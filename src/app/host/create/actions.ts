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

  console.log('✅ Input validated, calling Cloud Function...', validatedFields.data);

  try {
    const generateQuestionsFn = httpsCallable(functions, 'generateQuestions');
    const result = await generateQuestionsFn(validatedFields.data);
    const responseData = result.data as any; // Cast to expected response structure

    console.log('✅ AI Cloud Function response received');

    // Cloud function returns { success: true, data: [...] }
    if (responseData.success && responseData.data && responseData.data.length > 0) {
      // The Cloud Function already processed the questions (correctAnswer -> indexString)
      // We just need to ensure options are strictly 4 strings for Typescript check if needed
      // But the type definition expects specific structure.

      return {
        status: 'success',
        message: 'Questions generated successfully!',
        data: responseData.data,
      };
    } else {
      throw new Error('AI returned an empty list of questions.');
    }
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