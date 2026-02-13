/**
 * Firebase Service Layer
 * All Firestore operations use the singleton db instance from @/firebase
 * NO Firebase initialization happens here - it's all handled in firebase.ts
 * Fully type-safe with explicit DocumentReference and CollectionReference types
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  type DocumentReference,
  type CollectionReference,
  type FieldValue,
  writeBatch,
  setDoc,
  increment,
} from "firebase/firestore";

import { db, auth, functions } from "@/firebase";
import { httpsCallable } from "firebase/functions";
import { signInAnonymously } from "firebase/auth";
import { fetchQuestionsFromAPI } from "./trivia-service";
import { Quiz, Question, Participant, LeaderboardEntry, QuestionResult } from "@/types/quiz";
import { Capacitor } from "@capacitor/core";
type QuizCollection = CollectionReference<Omit<Quiz, "id">>;
type QuizDocument = DocumentReference<Quiz>;
type QuestionCollection = CollectionReference<Omit<Question, "id">>;
type ParticipantCollection = CollectionReference<Omit<Participant, "id">>;
export const generateQuizCode = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

/**
 * Create a "Quick Play" quiz with auto-fetched questions
 * @param topic - Topic name (e.g., "Movies", "Sports")
 * @param difficulty - Difficulty level
 * @returns Promise resolving to the created quiz ID
 */
export const createQuickGame = async (
  topic: string,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<string> => {
  console.log("🚀 createQuickGame called:", { topic, difficulty });

  try {
    let user = auth.currentUser;
    if (!user) {
      console.log('👤 Signing in anonymously...');
      const userCred = await signInAnonymously(auth);
      user = userCred.user;
    }
    console.log('✅ User ID:', user.uid);
    const quizzesRef = collection(db, "quizzes");
    const quizDocRef = doc(quizzesRef); // Generate ID
    const quizId = quizDocRef.id;

    console.log("🌍 Fetching questions for quiz:", quizId);
    const questions = await fetchQuestionsFromAPI(quizId, topic, 10, difficulty);
    const quizData: Omit<Quiz, "id" | "createdAt"> & { createdAt: FieldValue } = {
      title: `${topic} Trivia`,
      description: `A ${difficulty} ${topic} quiz generated for you.`,
      createdBy: 'Quick Play',
      ownerId: user.uid,
      createdAt: serverTimestamp(),
      status: "lobby",
      source: 'api',
      questions: questions,
      currentQuestionIndex: -1,
      code: generateQuizCode(),
    };

    console.log("💾 Saving quiz document...");
    await setDoc(quizDocRef, quizData);
    await addQuestions(quizId, questions);

    console.log("✅ Quick Game created:", quizId);
    return quizId;

  } catch (error) {
    console.error("❌ Failed to create quick game:", error);
    throw error;
  }
};

/**
 * Create a Quick Game using AI
 * @param topic - Custom user topic
 */
export const createAIQuickQuiz = async (topic: string): Promise<string> => {
  console.log("🤖 createAIQuickQuiz called:", topic);

  try {
    let user = auth.currentUser;
    if (!user) {
      console.log('👤 Signing in anonymously...');
      const userCred = await signInAnonymously(auth);
      user = userCred.user;
    }
    console.log('✅ User ID:', user.uid);
    console.log("🧠 calling /api/generate-quiz...");

    let apiUrl = '/api/generate-quiz';
    if (Capacitor.isNativePlatform() || process.env.NEXT_PUBLIC_ELECTRON_BUILD === 'true') {
      apiUrl = 'https://quiz-whiz-indol.vercel.app/api/generate-quiz';
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate quiz. Please try again.`);
    }

    const data = await response.json();
    const aiQuestions = data.questions; // Array of { question, options, correctAnswer }

    const formattedQuestions: Question[] = aiQuestions.map((q: any, index: number) => {
      const allOptions = q.options;
      const correctAnswer = q.correctAnswer;
      const shuffled = [...allOptions]
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);

      const correctIndex = shuffled.findIndex(opt => opt === correctAnswer);

      return {
        id: Math.random().toString(36).substring(2, 15), // Simple client-side ID
        quizId: "", // Will be set later or unused in doc creation
        questionText: q.question,
        options: shuffled,
        correctOptionIndex: correctIndex >= 0 ? correctIndex : 0, // Fallback if mismatch
        timeLimit: 20,
        points: 100,
        order: index
      } as Question;
    });
    const quizzesRef = collection(db, "quizzes");
    const quizDocRef = doc(quizzesRef);
    const quizId = quizDocRef.id;
    formattedQuestions.forEach(q => q.quizId = quizId);

    const quizData: Omit<Quiz, "id" | "createdAt"> & { createdAt: FieldValue } = {
      title: `${topic}`,
      description: `an AI-generated quiz about ${topic}.`,
      createdBy: 'AI Gen',
      ownerId: user.uid,
      createdAt: serverTimestamp(),
      status: "lobby", // Ready to join
      source: 'ai',
      questions: formattedQuestions,
      currentQuestionIndex: -1,
      code: generateQuizCode(),
    };

    console.log("💾 Saving AI quiz document...");
    await setDoc(quizDocRef, quizData);

    const questionsPayload = formattedQuestions.map(({ id, quizId, ...rest }) => rest);
    await addQuestions(quizId, questionsPayload);

    console.log("✅ AI Quick Game created:", quizId);
    return quizId;

  } catch (error) {
    console.error("❌ Failed to create AI game:", error);
    throw error;
  }
};

/**
 * Create a new quiz in Firestore
 * @param title - Quiz title
 * @param description - Quiz description
 * @param userEmail - Email of the user creating the quiz
 * @returns Promise resolving to the created quiz document ID
 */
export const createQuiz = async (
  title: string,
  description: string,
  userEmail: string,
  userId: string
): Promise<string> => {
  console.log("🟢 createQuiz called");
  console.log("📝 Quiz data:", { title, description, userEmail, userId });
  console.log("🔍 db instance:", db ? "exists" : "missing");

  try {
    const quizData: Omit<Quiz, "id" | "createdAt"> & { createdAt: FieldValue } = {
      title,
      description,
      createdBy: userEmail,
      ownerId: userId,
      createdAt: serverTimestamp(),
      status: "draft",
      currentQuestionIndex: -1,
      code: generateQuizCode(),
    };

    console.log("🚀 Writing to Firestore…");
    console.log("📦 Quiz payload:", { ...quizData, createdAt: "[serverTimestamp]" });
    const quizzesRef: QuizCollection = collection(
      db,
      "quizzes"
    ) as QuizCollection;

    const docRef = await addDoc(quizzesRef, quizData);

    console.log("✅ Quiz created successfully!");
    console.log("📄 Quiz document ID:", docRef.id);
    console.log("🔵 Firestore write completed");

    return docRef.id;
  } catch (error) {
    console.error("❌ Firestore write failed:", error);
    console.error("🔍 Error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      code: (error as any)?.code,
    });
    throw error;
  }
};

/**
 * Get all quizzes ordered by creation date
 * @param userId - Optional user ID to filter quizzes by owner
 * @returns Promise resolving to array of Quiz objects
 */
export const getQuizzes = async (userId?: string): Promise<Quiz[]> => {
  try {
    console.log("🔍 Fetching quizzes for user:", userId || "all");
    const quizzesRef = collection(db, "quizzes");

    let q;
    if (userId) {
      q = query(
        quizzesRef,
        where("ownerId", "==", userId),
        orderBy("createdAt", "desc")
      );
    } else {
      q = query(quizzesRef, orderBy("createdAt", "desc"));
    }

    const snap = await getDocs(q);

    const quizzes = snap.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
      } as Quiz;
    });

    console.log("✅ Found quizzes:", quizzes.length);
    return quizzes;
  } catch (error) {
    console.error("❌ Error fetching quizzes:", error);
    throw error;
  }
};

/**
 * Get a quiz by its document ID
 * @param quizId - The quiz document ID
 * @returns Promise resolving to Quiz object or null if not found
 */
export const getQuiz = async (quizId: string): Promise<Quiz | null> => {
  try {
    console.log("🔍 Fetching quiz:", quizId);
    const quizRef: QuizDocument = doc(db, "quizzes", quizId) as QuizDocument;
    const snap = await getDoc(quizRef);

    if (snap.exists()) {
      const data = snap.data();
      const quiz = {
        ...data,
        id: snap.id,
        createdAt: (data.createdAt as any) instanceof Timestamp ? (data.createdAt as any).toMillis() : Date.now(),
      } as Quiz;
      console.log("✅ Quiz found:", quiz.title);
      return quiz;
    }

    console.log("⚠️ Quiz not found:", quizId);
    return null;
  } catch (error) {
    console.error("❌ Error fetching quiz:", error);
    throw error;
  }
};

/**
 * Get a quiz by its join code
 * @param code - The 6-digit quiz code
 * @returns Promise resolving to Quiz object or null if not found
 */
export const getQuizByCode = async (code: string): Promise<Quiz | null> => {
  try {
    console.log("🔍 Searching quiz by code:", code);

    const quizzesRef: QuizCollection = collection(
      db,
      "quizzes"
    ) as QuizCollection;
    const q = query(quizzesRef, where("code", "==", code));
    const snap = await getDocs(q);

    if (snap.empty) {
      console.log("⚠️ No quiz found with code:", code);
      return null;
    }

    const doc = snap.docs[0];
    const data = doc.data();
    const quiz = {
      ...data,
      id: doc.id,
      createdAt: (data.createdAt as any) instanceof Timestamp ? (data.createdAt as any).toMillis() : Date.now(),
    } as Quiz;

    console.log("✅ Quiz found by code:", quiz.title);
    return quiz;
  } catch (error) {
    console.error("❌ Error searching quiz by code:", error);
    throw error;
  }
};

/**
 * Update quiz status
 * @param quizId - The quiz document ID
 * @param status - New status value
 */
export const updateQuizStatus = async (
  quizId: string,
  status: Quiz["status"]
): Promise<void> => {
  try {
    console.log("🔄 Updating quiz status:", { quizId, status });

    const quizRef: QuizDocument = doc(db, "quizzes", quizId) as QuizDocument;
    await updateDoc(quizRef, { status });

    console.log("✅ Quiz status updated");
  } catch (error) {
    console.error("❌ Error updating quiz status:", error);
    throw error;
  }
};

/**
 * Delete a quiz and all its questions
 * @param quizId - The quiz document ID
 */
export const deleteQuiz = async (quizId: string): Promise<void> => {
  try {
    console.log("🗑️ Deleting quiz:", quizId);
    const questions = await getQuestions(quizId);
    const deletePromises = questions.map(q => deleteQuestion(quizId, q.id));
    await Promise.all(deletePromises);
    const quizRef = doc(db, "quizzes", quizId);
    await deleteDoc(quizRef);

    console.log("✅ Quiz deleted");
  } catch (error) {
    console.error("❌ Error deleting quiz:", error);
    throw error;
  }
};

/**
 * Add a question to a quiz
 * @param quizId - The quiz document ID
 * @param data - Question data (without id and quizId)
 * @returns Promise resolving to the created question document ID
 */
export const addQuestion = async (
  quizId: string,
  data: Omit<Question, "id" | "quizId">
): Promise<string> => {
  try {
    console.log("➕ Adding question to quiz:", quizId);
    const questionData: Omit<Question, "id"> = {
      ...data,
      quizId,
    };
    const questionsRef: QuestionCollection = collection(
      db,
      "quizzes",
      quizId,
      "questions"
    ) as QuestionCollection;

    const docRef = await addDoc(questionsRef, questionData);

    console.log("✅ Question added:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("❌ Error adding question:", error);
    throw error;
  }
};

/**
 * Add multiple questions to a quiz in a batch
 * @param quizId - The quiz document ID
 * @param questionsData - Array of question data (without id and quizId)
 */
export const addQuestions = async (
  quizId: string,
  questionsData: Omit<Question, "id" | "quizId">[]
): Promise<void> => {
  try {
    console.log(`➕ Adding ${questionsData.length} questions to quiz:`, quizId);

    const batch = writeBatch(db);
    const questionsRef = collection(db, "quizzes", quizId, "questions");

    questionsData.forEach((data) => {
      const newDocRef = doc(questionsRef); // Generate a new ID
      const questionData: Omit<Question, "id"> = {
        ...data,
        quizId,
      };
      batch.set(newDocRef, questionData);
    });

    await batch.commit();
    console.log("✅ Batch questions added successfully");
  } catch (error) {
    console.error("❌ Error adding batch questions:", error);
    throw error;
  }
};

/**
 * Get all questions for a quiz
 * @param quizId - The quiz document ID
 * @returns Promise resolving to array of Question objects
 */
export const getQuestions = async (quizId: string): Promise<Question[]> => {
  try {
    console.log("🔍 Fetching questions for quiz:", quizId);

    const questionsRef: QuestionCollection = collection(
      db,
      "quizzes",
      quizId,
      "questions"
    ) as QuestionCollection;

    const q = query(questionsRef, orderBy("order", "asc"));
    const snap = await getDocs(q);
    const questions = snap.docs.map((d) => ({
      ...d.data(),
      id: d.id,
    } as Question));

    console.log("✅ Found questions:", questions.length);
    return questions;
  } catch (error) {
    console.error("❌ Error fetching questions:", error);
    throw error;
  }
};

/**
 * Delete a question from a quiz
 * @param quizId - The quiz document ID
 * @param questionId - The question document ID
 */
export const deleteQuestion = async (
  quizId: string,
  questionId: string
): Promise<void> => {
  try {
    console.log("🗑️ Deleting question:", { quizId, questionId });
    const questionRef: DocumentReference<Question> = doc(
      db,
      "quizzes",
      quizId,
      "questions",
      questionId
    ) as DocumentReference<Question>;

    await deleteDoc(questionRef);

    console.log("✅ Question deleted");
  } catch (error) {
    console.error("❌ Error deleting question:", error);
    throw error;
  }
};

/**
 * Join a quiz as a participant
 * @param quizId - The quiz document ID
 * @param name - Participant name
 * @param userId - Optional explicit User ID (e.g. for Host or logged-in users)
 * @returns Promise resolving to the created participant document ID
 */
export const joinQuiz = async (
  quizId: string,
  name: string
): Promise<string> => {
  try {
    console.log("👤 Joining quiz:", { quizId, name });
    let user = auth.currentUser;
    if (!user) {
      console.log("🕵️ Signing in anonymously...");
      const cred = await signInAnonymously(auth);
      user = cred.user;
    }
    const quiz = await getQuiz(quizId);
    if (!quiz) throw new Error("Quiz not found");
    if (quiz.status !== "lobby") throw new Error("Quiz is not open for joining");
    const participantData: Omit<Participant, "id" | "joinedAt"> & {
      joinedAt: FieldValue;
    } = {
      name,
      quizId,
      joinedAt: serverTimestamp(),
      totalScore: 0,
      currentStreak: 0,
      answers: {},
    };

    const participantsRef = collection(
      db,
      "quizzes",
      quizId,
      "participants"
    );
    const batch = writeBatch(db);
    const userDocRef = doc(participantsRef, user.uid);
    const quizRef = doc(db, "quizzes", quizId);
    
    batch.set(userDocRef, participantData);
    batch.update(quizRef, { participantCount: increment(1) });
    
    await batch.commit();
    console.log("✅ Participant joined and count incremented");

    return user.uid;
  } catch (error) {
    console.error("❌ Error joining quiz:", error);
    throw error;
  }
};


/**
 * Get all participants for a quiz
 * @param quizId - The quiz document ID
 * @returns Promise resolving to array of Participant objects
 */
export const getParticipants = async (
  quizId: string
): Promise<Participant[]> => {
  try {
    console.log("🔍 Fetching participants for quiz:", quizId);

    const participantsRef: ParticipantCollection = collection(
      db,
      "quizzes",
      quizId,
      "participants"
    ) as ParticipantCollection;

    const snap = await getDocs(participantsRef);
    const participants = snap.docs.map((d) => ({
      ...d.data(),
      id: d.id,
    } as Participant));

    console.log("✅ Found participants:", participants.length);
    return participants;
  } catch (error) {
    console.error("❌ Error fetching participants:", error);
    throw error;
  }
};

/**
 * Subscribe to real-time quiz updates
 * @param quizId - The quiz document ID
 * @param callback - Callback function that receives Quiz updates
 * @returns Unsubscribe function
 */
export const subscribeToQuiz = (
  quizId: string,
  callback: (quiz: Quiz) => void
): (() => void) => {
  console.log("👂 Subscribing to quiz updates:", quizId);
  const quizRef: QuizDocument = doc(db, "quizzes", quizId) as QuizDocument;

  return onSnapshot(quizRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      const quiz = {
        ...data,
        id: snap.id,
        createdAt: (data.createdAt as any) instanceof Timestamp ? (data.createdAt as any).toMillis() : Date.now(),
      } as Quiz;
      console.log("📡 Quiz update received:", quiz.title);
      callback(quiz);
    } else {
      console.log("⚠️ Quiz document does not exist");
    }
  });
};

/**
 * Subscribe to real-time question updates for a quiz
 * @param quizId - The quiz document ID
 * @param callback - Callback function that receives Question[] updates
 * @returns Unsubscribe function
 */
export const subscribeToQuestions = (
  quizId: string,
  callback: (questions: Question[]) => void
): (() => void) => {
  console.log("👂 Subscribing to question updates:", quizId);

  const questionsRef: QuestionCollection = collection(
    db,
    "quizzes",
    quizId,
    "questions"
  ) as QuestionCollection;

  const q = query(questionsRef, orderBy("order", "asc"));

  return onSnapshot(q, (snap) => {
    const questions = snap.docs.map((d) => ({
      ...d.data(),
      id: d.id,
    } as Question));
    console.log("📡 Question updates received:", questions.length);
    callback(questions);
  });
};

/**
 * Subscribe to real-time participant updates for a quiz
 * @param quizId - The quiz document ID
 * @param callback - Callback function that receives Participant[] updates
 * @returns Unsubscribe function
 */
export const subscribeToParticipants = (
  quizId: string,
  callback: (participants: Participant[]) => void
): (() => void) => {
  console.log("👂 Subscribing to participant updates:", quizId);

  const participantsRef: ParticipantCollection = collection(
    db,
    "quizzes",
    quizId,
    "participants"
  ) as ParticipantCollection;
  const q = query(participantsRef, orderBy("totalScore", "desc"), limit(100));

  return onSnapshot(q, (snap) => {
    const participants = snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Participant);
    console.log("📡 Participant updates received:", participants.length);
    callback(participants);
  });
};

/**
 * Start a specific question (moves quiz to active state for that question)
 * @param quizId - The quiz document ID
 * @param questionIndex - The index of the question to start
 */
export const startQuestion = async (
  quizId: string,
  questionIndex: number
): Promise<void> => {
  try {
    console.log("▶️ Starting question:", { quizId, questionIndex });

    const quizRef: QuizDocument = doc(db, "quizzes", quizId) as QuizDocument;
    await updateDoc(quizRef, {
      status: "active",
      currentQuestionIndex: questionIndex,
      questionStartTime: Date.now(),
      answeredCount: 0,
      skipVoteCount: 0,
    });

    console.log("✅ Question started with counters reset");
  } catch (error) {
    console.error("❌ Error starting question:", error);
    throw error;
  }
};

/**
 * End the current question early (e.g. all users answered) for everyone
 */
export const endQuestionNow = async (quizId: string): Promise<void> => {
    try {
        const quizRef = doc(db, "quizzes", quizId);
        await updateDoc(quizRef, {
            questionStartTime: 0
        });
    } catch (error) {
        console.error("Error ending question:", error);
    }
};

/**
 * Vote to skip to results (requires all participants to vote)
 */
export const voteToSkip = async (quizId: string, participantId: string): Promise<void> => {
    try {
        const participantRef = doc(db, "quizzes", quizId, "participants", participantId);
        const quizRef = doc(db, "quizzes", quizId);
        const participantDoc = await getDoc(participantRef);
        if (participantDoc.data()?.votedToSkip) {
            return; // Already voted, don't increment
        }

        const batch = writeBatch(db);
        batch.update(participantRef, { votedToSkip: true });
        batch.update(quizRef, { skipVoteCount: increment(1) });
        await batch.commit();
        
        console.log("✅ Participant voted to skip:", participantId);
    } catch (error) {
        console.error("Error voting to skip:", error);
        throw error;
    }
};

/**
 * End the quiz
 * @param quizId - The quiz document ID
 */
export const endQuiz = async (quizId: string): Promise<void> => {
  try {
    console.log("🏁 Ending quiz:", quizId);

    const quizRef: QuizDocument = doc(db, "quizzes", quizId) as QuizDocument;

    await updateDoc(quizRef, {
      status: "completed",
    });

    console.log("✅ Quiz ended");
  } catch (error) {
    console.error("❌ Error ending quiz:", error);
    throw error;
  }
};

/**
 * Restart the quiz (Reset to Lobby and clear scores)
 * @param quizId - The quiz document ID
 */
export const restartGame = async (quizId: string): Promise<void> => {
  try {
    console.log("🔄 Restarting quiz:", quizId);
    if (!auth.currentUser) throw new Error("Must be logged in to restart");
    const quizRef = doc(db, "quizzes", quizId);
    const quizSnap = await getDoc(quizRef);

    if (!quizSnap.exists()) throw new Error("Quiz not found");
    const quizData = quizSnap.data();

    if (quizData.ownerId !== auth.currentUser.uid) {
      throw new Error("Only the owner can restart the game");
    }
    const batch = writeBatch(db);
    batch.update(quizRef, {
      status: 'lobby',
      currentQuestionIndex: 0,
      stateUpdatedAt: serverTimestamp()
    });
    const participantsRef = collection(db, "quizzes", quizId, "participants");
    const participantsSnap = await getDocs(participantsRef);

    participantsSnap.docs.forEach(doc => {
      batch.update(doc.ref, {
        totalScore: 0,
        currentStreak: 0,
        answers: {}
      });
    });
    await batch.commit();
    console.log("✅ Quiz restarted successfully (Lobby, Scores Reset)");

  } catch (error) {
    console.error("❌ Error restarting quiz:", error);
    throw error;
  }
};

/**
 * Submit an answer for a participant (Server-Side Scoring)
 * Calls Firebase Cloud Function for secure score calculation
 * @param quizId - The quiz ID
 * @param participantId - The participant ID
 * @param questionIndex - The question index
 * @param selectedOptionIndex - The selected answer index
 * @returns Promise resolving to the result (isCorrect, pointsEarned)
 */
export const submitAnswer = async (
  quizId: string,
  participantId: string,
  questionIndex: number,
  selectedOptionIndex: number
): Promise<{ isCorrect: boolean; pointsEarned: number }> => {
  try {
    console.log("📝 Submitting answer (secure):", { quizId, participantId, questionIndex });

    const submitAnswerSecure = httpsCallable<
      { quizId: string; participantId: string; questionIndex: number; selectedOptionIndex: number },
      { success: boolean; isCorrect: boolean; pointsEarned: number }
    >(functions, 'submitAnswerSecure');

    const result = await submitAnswerSecure({
      quizId,
      participantId,
      questionIndex,
      selectedOptionIndex
    });

    console.log("✅ Answer submitted (secure):", result.data);
    return {
      isCorrect: result.data.isCorrect,
      pointsEarned: result.data.pointsEarned
    };
  } catch (error) {
    console.error("❌ Error submitting answer:", error);
    throw error;
  }
};

/**
 * Calculate results for a specific question
 * @param quizId - The quiz ID
 * @param questionId - The question ID
 * @returns Promise resolving to QuestionResult
 */
export const calculateQuestionResults = async (
  quizId: string,
  questionId: string
): Promise<QuestionResult> => { // Modified to tolerate missing questionId search if needed, but we used ID search.
  try {
    const questions = await getQuestions(quizId);
    const questionIndex = questions.findIndex(q => q.id === questionId);
    const question = questions[questionIndex];

    if (!question) throw new Error("Question not found");

    const participants = await getParticipants(quizId);
    const optionCounts = new Array(question.options.length).fill(0);
    let totalResponses = 0;

    participants.forEach(p => {
      const selectedIdx = p.answers[String(questionIndex)];

      if (typeof selectedIdx === 'number') {
        if (selectedIdx >= 0 && selectedIdx < optionCounts.length) {
          optionCounts[selectedIdx]++;
        }
        totalResponses++;
      }
    });

    return {
      quizId,
      questionId,
      optionCounts,
      totalResponses,
      correctOptionIndex: question.correctOptionIndex
    };
  } catch (error) {
    console.error("❌ Error calculating results:", error);
    throw error;
  }
};

/**
 * Get the leaderboard for a quiz
 * @param quizId - The quiz ID
 * @returns Promise resolving to LeaderboardEntry[]
 */
export const getLeaderboard = async (quizId: string): Promise<LeaderboardEntry[]> => {
  try {
    console.log("🏆 Fetching leaderboard:", quizId);

    const participants = await getParticipants(quizId);
    const questions = await getQuestions(quizId);

    const leaderboard: LeaderboardEntry[] = participants.map(p => {
      let correctCount = 0;
      Object.entries(p.answers).forEach(([qIdxStr, aIdx]) => {
        const qIdx = parseInt(qIdxStr);
        if (questions[qIdx] && questions[qIdx].correctOptionIndex === aIdx) {
          correctCount++;
        }
      });

      return {
        participantId: p.id,
        name: p.name,
        totalScore: p.totalScore,
        correctAnswers: correctCount,
        rank: 0
      };
    });
    leaderboard.sort((a, b) => b.totalScore - a.totalScore);
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return leaderboard;
  } catch (error) {
    console.error("❌ Error fetching leaderboard:", error);
    throw error;
  }
};
