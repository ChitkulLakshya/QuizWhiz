'use server';

import { z } from 'zod';
import { generateQuizQuestions, type GenerateQuizQuestionsOutput } from '@/ai/flows/generate-quiz-questions';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { v4 as uuidv4 } from 'uuid';

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
  const validatedFields = generateQuestionsSchema.safeParse({
    subject: formData.get('subject'),
    skillLevel: formData.get('skillLevel'),
    numberOfQuestions: formData.get('numberOfQuestions'),
  });

  if (!validatedFields.success) {
    return {
      status: 'error',
      message: validatedFields.error.flatten().fieldErrors.subject?.[0] || 'Invalid input.',
    };
  }

  try {
    const result = await generateQuizQuestions(validatedFields.data);
    if (result && result.questions && result.questions.length > 0) {
      // The AI returns correctAnswer, but the form needs correctAnswerIndex.
      const questionsWithIndex = result.questions.map(q => {
        const correctAnswerIndex = q.options.indexOf(q.correctAnswer);
        const { correctAnswer, ...rest } = q;
        return {
            ...rest,
            correctAnswer: String(correctAnswerIndex),
            question: q.question,
        };
      });

      return {
        status: 'success',
        message: 'Questions generated successfully!',
        data: questionsWithIndex.map(q => ({
            ...q,
            options: q.options as [string, string, string, string],
        })),
      };
    } else {
      throw new Error('AI returned an empty list of questions.');
    }
  } catch (error: any) {
    console.error('AI Generation Error:', error);
    
    let errorMessage = 'Failed to generate questions. Please try again.';
    
    if (error.message?.includes('429') || error.message?.includes('Resource has been exhausted')) {
      errorMessage = 'AI service is currently busy (Rate Limit Reached). Please wait a moment and try again.';
    } else if (error.message?.includes('empty list')) {
      errorMessage = 'The AI could not generate questions for this topic. Try a different subject.';
    }

    return {
      status: 'error',
      message: errorMessage,
    };
  }
}

const questionSchema = z.object({
  question: z.string().min(1, 'Question cannot be empty'),
  options: z.array(z.string().min(1, 'Option cannot be empty')).length(4, 'There must be 4 options'),
  correctAnswer: z.string().min(1, 'Please select a correct answer'),
  timeLimit: z.coerce.number().min(5, 'Time limit must be at least 5 seconds'),
});

const quizFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  questions: z.array(questionSchema).min(1, 'Quiz must have at least one question'),
});

export type CreateQuizResult = {
  success: boolean;
  quizId?: string;
  error?: string;
};

export async function createQuizAction(formData: FormData): Promise<CreateQuizResult> {

  try {
    const data = JSON.parse(formData.get('quizData') as string);
    const validatedFields = quizFormSchema.safeParse(data);

    if (!validatedFields.success) {
      const errorMessage = 'Validation failed: ' + validatedFields.error.flatten().fieldErrors.title?.[0] || 'Invalid quiz data';
      console.error('Server-side validation failed:', validatedFields.error.flatten());
      return {
        success: false,
        error: errorMessage,
      };
    }

    const { title, questions } = validatedFields.data;

    // Prepare quiz data with createdAt timestamp
    const quizData = {
      title,
      description: `A quiz about ${title}`,
      startTime: serverTimestamp(),
      endTime: serverTimestamp(),
      qrCode: uuidv4(), // Generate QR code
      questionIds: questions.map(() => uuidv4()),
      createdAt: serverTimestamp(), // Optional timestamp field as requested
    };

    // Use addDoc to create the quiz document in the 'quizzes' collection
    const quizRef = await addDoc(collection(db, 'quizzes'), quizData);
    const quizId = quizRef.id;

    // Update the document to include the id field matching the document ID
    await setDoc(quizRef, { id: quizId }, { merge: true });

    // Log the created document ID for debugging
    console.log('Quiz created successfully with ID:', quizId);

    // Add questions to the questions subcollection
    for (let i = 0; i < questions.length; i++) {
      const questionData = questions[i];
      const questionId = quizData.questionIds[i];
      
      // The form gives us the option text as the `correctAnswer`. We need the index.
      const correctAnswerIndex = questionData.options.indexOf(questionData.correctAnswer);

      const questionPayload = {
        id: questionId,
        quizId: quizId,
        text: questionData.question,
        options: questionData.options,
        correctAnswerIndex: correctAnswerIndex,
        timer: questionData.timeLimit,
        createdAt: serverTimestamp(),
      };

      // Use addDoc for questions subcollection
      await addDoc(
        collection(db, 'quizzes', quizId, 'questions'),
        questionPayload
      );
    }

    // Revalidate the path after successful creation
    revalidatePath('/');

    return {
      success: true,
      quizId: quizId,
    };
  } catch (error) {
    // Provide clear console error messages if Firestore write fails
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Firestore write failed:', errorMessage);
    console.error('Error details:', error);

    return {
      success: false,
      error: `Failed to create quiz: ${errorMessage}`,
    };
  }
}