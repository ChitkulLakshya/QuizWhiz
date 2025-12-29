/**
 * @fileOverview This file defines a Genkit flow for generating quiz questions based on a subject and skill level.
 *
 * It exports:
 * - `generateQuizQuestions`: An async function to generate quiz questions.
 * - `GenerateQuizQuestionsInput`: The input type for the `generateQuizQuestions` function.
 * - `GenerateQuizQuestionsOutput`: The output type for the `generateQuizQuestions` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizQuestionsInputSchema = z.object({
  subject: z
    .string()
    .describe('The subject or topic for which to generate quiz questions.'),
  skillLevel: z
    .string()
    .describe(
      'The skill level of the quiz questions (e.g., easy, normal, hard).'
    ),
  numberOfQuestions: z
    .number()
    .describe('The number of questions to generate.')
    .default(10),
  image: z
    .string()
    .optional()
    .describe('Base64 encoded image data (data:image/...) to generate questions from.'),
});

export type GenerateQuizQuestionsInput = z.infer<
  typeof GenerateQuizQuestionsInputSchema
>;

const GenerateQuizQuestionsOutputSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().describe('The quiz question.'),
      options: z.array(z.string()).describe('The possible answer options.'),
      correctAnswer: z.string().describe('The correct answer to the question.'),
    })
  ).describe('An array of generated quiz questions.'),
});

export type GenerateQuizQuestionsOutput = z.infer<
  typeof GenerateQuizQuestionsOutputSchema
>;

export async function generateQuizQuestions(
  input: GenerateQuizQuestionsInput
): Promise<GenerateQuizQuestionsOutput> {
  return generateQuizQuestionsFlow(input);
}

const generateQuizQuestionsFlow = ai.defineFlow(
  {
    name: 'generateQuizQuestionsFlow',
    inputSchema: GenerateQuizQuestionsInputSchema,
    outputSchema: GenerateQuizQuestionsOutputSchema,
  },
  async (input) => {
    const promptText = `You are an expert quiz creator. Your task is to generate high-quality multiple-choice questions based on the provided subject${input.image ? ', the attached image,' : ''} and skill level.

Subject: ${input.subject}
Skill Level: ${input.skillLevel}
Number of Questions: ${input.numberOfQuestions}

Guidelines:
1. **Source Material**: ${input.image ? 'Analyze the attached image thoroughly. Generate questions based on visual details, text, charts, or concepts presented in the image. If the image is not sufficient for all questions, supplement with general knowledge about the Subject.' : 'Generate questions based on the Subject.'}
2. **Diversity**: Ensure questions cover different aspects and vary in style (e.g., definitions, applications, problem-solving). Avoid repetition.
3. **Distractors**: The wrong options (distractors) must be plausible and related to the context. Avoid obviously incorrect or silly answers.
4. **Difficulty**:
   - If Skill Level is 'hard', questions should require deep reasoning, analysis, or synthesis of concepts.
   - If Skill Level is 'easy', focus on fundamental concepts and definitions.
   - If Skill Level is 'normal', balance between recall and application.
5. **Format**: Strictly follow the output JSON schema.
   - Each question must have exactly 4 options.
   - 'correctAnswer' must be an exact string match to one of the 'options'.
   - Do NOT include any markdown formatting, introductory text, or explanations. Return ONLY the raw JSON object.
`;

    const promptParts: any[] = [{ text: promptText }];
    
    if (input.image) {
      promptParts.push({ media: { url: input.image } });
    }

    const { output } = await ai.generate({
      prompt: promptParts,
      output: { schema: GenerateQuizQuestionsOutputSchema },
    });

    if (!output) {
      throw new Error('Failed to generate questions');
    }

    return output;
  }
);
