import { z } from 'zod'; // Client-side Zod
import { functions } from '@/firebase';
import { httpsCallable } from 'firebase/functions';
import { GenerateQuizQuestionsOutput } from '@/ai/flows/generate-quiz-questions'; // Type import is fine

const generateQuestionsSchema = z.object({
  subject: z.string().min(3, 'Subject must be at least 3 characters long.'),
  skillLevel: z.string(),
  numberOfQuestions: z.coerce.number().min(1).max(10),
});

type GenerateQuestionsState = {
  status: 'success' | 'error' | 'idle';
  message: string;
  data?: GenerateQuizQuestionsOutput['questions'];
};
const isElectron = () => {
  if (typeof window === 'undefined') return false;
  return /Electron/i.test(window.navigator.userAgent) || process.env.NEXT_PUBLIC_ELECTRON_BUILD === 'true';
};
async function generateQuestionsDirectAI(subject: string, skillLevel: string, numberOfQuestions: number) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_GENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing AI API Key');
  }

  const prompt = `Generate ${numberOfQuestions} multiple-choice questions about "${subject}" at "${skillLevel}" difficulty.
Output MUST be a JSON object with this schema:
{
  "questions": [
    {
      "question": "string",
      "options": ["opt1", "opt2", "opt3", "opt4"],
      "correctAnswer": "exact string match from options"
    }
  ]
}
Do not include markdown. Return RAW JSON only.`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    })
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty AI response');

  const data = JSON.parse(text);
  return data.questions.map((q: any) => {
    const index = q.options.indexOf(q.correctAnswer);
    return {
      question: q.question,
      options: q.options,
      correctAnswer: String(index >= 0 ? index : 0)
    };
  });
}

export async function generateQuestionsAction(
  prevState: GenerateQuestionsState,
  formData: FormData
): Promise<GenerateQuestionsState> {
  console.log('🤖 generateQuestionsAction started (Client Wrapper)');

  const validatedFields = generateQuestionsSchema.safeParse({
    subject: formData.get('subject'),
    skillLevel: formData.get('skillLevel'),
    numberOfQuestions: formData.get('numberOfQuestions'),
  });

  if (!validatedFields.success) {
    console.log('❌ Validation failed:', validatedFields.error.flatten());
    return {
      status: 'error',
      message: validatedFields.error.flatten().fieldErrors.subject?.[0] || 'Invalid input.',
    };
  }

  console.log('✅ Input validated', validatedFields.data);

  try {
    let questions;
    if (isElectron()) {
      console.log('🖥️ Electron detected, using direct AI API call...');
      questions = await generateQuestionsDirectAI(
        validatedFields.data.subject,
        validatedFields.data.skillLevel,
        validatedFields.data.numberOfQuestions
      );
    } else {
      console.log('🌐 Web detected, calling Cloud Function...');
      const generateQuestionsFn = httpsCallable(functions, 'generateQuestions');
      const result = await generateQuestionsFn(validatedFields.data);
      const responseData = result.data as any;

      if (!responseData.success || !responseData.data?.length) {
        throw new Error('AI returned an empty list of questions.');
      }
      questions = responseData.data;
    }

    console.log('✅ AI response received');

    return {
      status: 'success',
      message: 'Questions generated successfully!',
      data: questions,
    };
  } catch (error: any) {
    console.error('AI Generation Error:', error);

    let errorMessage = 'Failed to generate questions. Please try again.';

    if (error.message?.includes('429') || error.message?.includes('Resource has been exhausted')) {
      errorMessage = 'AI service is busy. Please wait.';
    } else if (error.message?.includes('empty list')) {
      errorMessage = 'The AI could not generate questions for this topic.';
    }

    return {
      status: 'error',
      message: errorMessage,
    };
  }
}