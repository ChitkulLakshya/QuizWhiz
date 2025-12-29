'use server';

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

const generateQuizQuestionsPrompt = ai.definePrompt({
  name: 'generateQuizQuestionsPrompt',
  input: {schema: GenerateQuizQuestionsInputSchema},
  output: {schema: GenerateQuizQuestionsOutputSchema},
  prompt: `You are an expert quiz creator. Your task is to generate high-quality multiple-choice questions based on the provided subject and skill level.

Subject: {{{subject}}}
Skill Level: {{{skillLevel}}}
Number of Questions: {{{numberOfQuestions}}}

Guidelines:
1. **Diversity**: Ensure questions cover different aspects of the subject and vary in style (e.g., definitions, applications, problem-solving). Avoid repetition.
2. **Distractors**: The wrong options (distractors) must be plausible and related to the context. Avoid obviously incorrect or silly answers.
3. **Difficulty**:
   - If Skill Level is 'hard', questions should require deep reasoning, analysis, or synthesis of concepts, not just rote memorization.
   - If Skill Level is 'easy', focus on fundamental concepts and definitions.
   - If Skill Level is 'normal', balance between recall and application.
4. **Format**: Strictly follow the output JSON schema.
   - Each question must have exactly 4 options.
   - 'correctAnswer' must be an exact string match to one of the 'options'.
   - Do NOT include any markdown formatting (like \`\`\`json), introductory text, or explanations. Return ONLY the raw JSON object.

Example Output Structure:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option C"
    }
  ]
}
`,
});

const generateQuizQuestionsFlow = ai.defineFlow(
  {
    name: 'generateQuizQuestionsFlow',
    inputSchema: GenerateQuizQuestionsInputSchema,
    outputSchema: GenerateQuizQuestionsOutputSchema,
  },
  async input => {
    const {output} = await generateQuizQuestionsPrompt(input);
    return output!;
  }
);
