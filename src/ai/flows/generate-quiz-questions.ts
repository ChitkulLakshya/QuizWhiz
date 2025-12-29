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
  prompt: `You are a quiz generator expert. Generate multiple-choice quiz questions based on the provided subject and skill level. The number of questions should be equal to numberOfQuestions.

Subject: {{{subject}}}
Skill Level: {{{skillLevel}}}
Number of Questions: {{{numberOfQuestions}}}

Each question should have four options, one of which is the correct answer. Return the questions in JSON format as specified in the output schema.  The schema descriptions should be used to guide the structure of the JSON. Return a JSON array of questions. Each question object must contain a question (string), options (array of strings), and correctAnswer (string; must match one of the options). Ensure the questions and options are appropriate for the specified skill level. Do NOT include any introductory or concluding remarks.  Just the JSON.

For example:

{
  "questions": [
    {
      "question": "What is the capital of France?",
      "options": ["Berlin", "Madrid", "Paris", "Rome"],
      "correctAnswer": "Paris"
    },
    {
      "question": "What is the value of Pi to two decimal places?",
      "options": ["3.14", "3.15", "3.16", "3.17"],
      "correctAnswer": "3.14"
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
