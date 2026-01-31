import { z } from 'zod';

// Mock types since we removed the import
type GenerateQuizQuestionsOutput = {
  questions: {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }[];
};

const generateQuestionsSchema = z.object({
  subject: z.string().min(3, 'Subject must be at least 3 characters long.'),
  skillLevel: z.string(),
  numberOfQuestions: z.coerce.number().min(1).max(10),
});

export type GenerateQuestionsState = {
  status: 'success' | 'error' | 'idle';
  message: string;
  data?: GenerateQuizQuestionsOutput['questions'];
};

export async function generateQuestionsAction(
  prevState: GenerateQuestionsState,
  formData: FormData
): Promise<GenerateQuestionsState> {
  console.log(' generateQuestionsAction started (Client Side Mock)');
  
  const validatedFields = generateQuestionsSchema.safeParse({
    subject: formData.get('subject'),
    skillLevel: formData.get('skillLevel'),
    numberOfQuestions: formData.get('numberOfQuestions'),
  });

  if (!validatedFields.success) {
    console.log(' Validation failed:', validatedFields.error.flatten());
    return {
      status: 'error',
      message: validatedFields.error.flatten().fieldErrors.subject?.[0] || 'Invalid input.',
    };
  }

  // Mock AI Response for Static Build
  console.warn(' AI Generation is mocked because Server Actions are not supported in Static Exports.');
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  return {
    status: 'success',
    message: 'Mock questions generated (AI unavailable in static mode)',
    data: [
      {
        question: `Sample Question about ${topic}`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: '0',
        explanation: 'This is a mock question.'
      }
    ]
  };
}
