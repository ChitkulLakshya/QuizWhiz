'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { useFormState } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { generateQuestionsAction } from './actions';
import { PlusCircle, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { v4 as uuidv4 } from 'uuid';

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

type QuizFormValues = z.infer<typeof quizFormSchema>;

export function QuizForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [generateState, generateAction] = useFormState(generateQuestionsAction, { status: 'idle', message: '' });
  
  // React state for form fields and loading
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      title: '',
      questions: [],
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'questions',
  });

  useEffect(() => {
    if (generateState.status === 'success' && generateState.data) {
      toast({
        title: 'Success!',
        description: generateState.message,
      });
      const newQuestions = generateState.data.map(q => ({
        ...q,
        options: q.options.slice(0, 4) as [string, string, string, string], // Ensure only 4 options
        timeLimit: 30,
      }));
      // @ts-ignore
      append(newQuestions);
    } else if (generateState.status === 'error') {
      toast({
        title: 'Error',
        description: generateState.message,
        variant: 'destructive',
      });
    }
  }, [generateState, append, toast]);
  
  const createQuizFormRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('🟢 handleSubmit called');
    
    setLoading(true);
    
    try {
      // Validate form data
      const formData = form.getValues();
      if (!formData.title || formData.questions.length === 0) {
        throw new Error('Please fill in all required fields');
      }

      console.log('📝 Form data validated:', { title: formData.title, questionCount: formData.questions.length });
      
      // Prepare quiz data with createdAt timestamp
      const questionIds = formData.questions.map(() => uuidv4());
      const quizData = {
        title: formData.title,
        description: description || `A quiz about ${formData.title}`,
        questionIds: questionIds,
        createdAt: serverTimestamp(),
      };

      console.log('🚀 Starting Firestore write for quiz...');
      
      // Use addDoc with await - Firestore will create collection if it doesn't exist
      const quizRef = await addDoc(collection(db, 'quizzes'), quizData);
      const quizId = quizRef.id;

      console.log('✅ Quiz document created with ID:', quizId);

      // Update the document to include the id field matching the document ID
      await setDoc(quizRef, { id: quizId }, { merge: true });
      console.log('📄 Quiz document updated with id field');

      // Add questions to the questions subcollection
      console.log('🚀 Starting Firestore writes for questions...');
      for (let i = 0; i < formData.questions.length; i++) {
        const questionData = formData.questions[i];
        const questionId = questionIds[i];
        
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

        // Use addDoc for questions subcollection - Firestore creates collection if it doesn't exist
        await addDoc(
          collection(db, 'quizzes', quizId, 'questions'),
          questionPayload
        );
        console.log(`✅ Question ${i + 1} created with ID: ${questionId}`);
      }

      console.log('✅ All Firestore writes completed successfully!');
      console.log('📄 Final quiz ID:', quizId);

      // Reset form fields after successful submission
      form.reset();
      setTitle('');
      setDescription('');
      
      toast({
        title: 'Success!',
        description: 'Quiz created successfully.',
      });
      
      // Navigate to the quiz lobby ONLY after successful Firestore write
      const quizSlug = formData.title.toLowerCase().replace(/\s/g, '-');
      router.push(`/quiz/${quizSlug}-${quizId.substring(0, 7)}/lobby`);
    } catch (error) {
      // Clear console error messages
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ Error creating quiz:', errorMessage);
      console.error('🔍 Error details:', error);
      
      toast({
        title: 'Error',
        description: `Failed to create quiz: ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      // Always reset loading state in finally block
      setLoading(false);
      console.log('🔵 Loading state reset');
    }
  };
  
  const aiFormRef = React.useRef<HTMLFormElement>(null);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Sparkles className="text-primary-foreground fill-primary" /> AI Question Generator
          </CardTitle>
          <CardDescription>
            Let AI create questions for you. Just provide a subject and skill level.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            ref={aiFormRef}
            action={generateAction}
            className="grid sm:grid-cols-4 gap-4 items-end"
          >
            <div className="space-y-2 col-span-4 sm:col-span-1">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" name="subject" placeholder="e.g., World History" required />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="skillLevel">Skill Level</Label>
              <Select name="skillLevel" defaultValue="normal">
                <SelectTrigger>
                  <SelectValue placeholder="Select skill level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="numberOfQuestions">Number of Questions</Label>
               <Select name="numberOfQuestions" defaultValue="10">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,10].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
            </div>
             <Button 
                type="submit" 
                className="w-full sm:w-auto"
                disabled={form.formState.isSubmitting}
            >
                <Sparkles className="mr-2" />
                Generate
             </Button>
          </form>
           {generateState.status === 'error' && <p className="text-sm font-medium text-destructive mt-2">{generateState.message}</p>}
        </CardContent>
      </Card>
      <Form {...form}>
        <form ref={createQuizFormRef} onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Quiz Details</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quiz Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Fun Facts Friday" 
                        {...field}
                        value={title}
                        onChange={(e) => {
                          setTitle(e.target.value);
                          field.onChange(e);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem className="mt-4">
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter quiz description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </FormControl>
              </FormItem>
            </CardContent>
          </Card>

          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-headline text-xl">Question {index + 1}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name={`questions.${index}.question`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Text</FormLabel>
                      <FormControl>
                        <Input placeholder="What is the capital of...?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, optionIndex) => (
                        <FormField
                            key={optionIndex}
                            control={form.control}
                            name={`questions.${index}.options.${optionIndex}`}
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Option {optionIndex + 1}</FormLabel>
                                <FormControl>
                                <Input placeholder={`Option ${optionIndex + 1}`} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    ))}
                </div>

                <FormField
                  control={form.control}
                  name={`questions.${index}.correctAnswer`}
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Correct Answer</FormLabel>
                       <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                          {form.watch(`questions.${index}.options`).map((option, optionIndex) => (
                             <FormItem key={optionIndex} className="flex items-center space-x-3 space-y-0 rounded-md border p-4 has-[:checked]:bg-primary has-[:checked]:text-primary-foreground">
                                <FormControl>
                                    <RadioGroupItem value={option || ''} disabled={!option} className="text-primary-foreground" />
                                </FormControl>
                                <FormLabel className="font-normal w-full cursor-pointer">
                                    {option || `Option ${optionIndex+1}`}
                                </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name={`questions.${index}.timeLimit`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Limit (seconds)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 30" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          ))}
          
          <Button type="button" variant="outline" onClick={() => append({ question: '', options: ['', '', '', ''], correctAnswer: '', timeLimit: 30 })}>
            <PlusCircle className="mr-2" /> Add Question Manually
          </Button>

          <Separator />
          
          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={loading || !form.formState.isValid}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Quiz and Proceed to Lobby'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}