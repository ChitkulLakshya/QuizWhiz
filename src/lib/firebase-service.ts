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
  onSnapshot,
  serverTimestamp,
  Timestamp,
  type DocumentReference,
  type CollectionReference,
  type FieldValue,
  writeBatch,
  setDoc,
} from "firebase/firestore";

import { db, auth } from "@/firebase";
import { signInAnonymously } from "firebase/auth";
import { fetchQuestionsFromAPI } from "./trivia-service";
import { Quiz, Question, Participant, ParticipantAnswer, LeaderboardEntry, QuestionResult } from "@/types/quiz";

// Type helpers for Firestore operations
type QuizCollection = CollectionReference<Omit<Quiz, "id">>;
type QuizDocument = DocumentReference<Quiz>;
type QuestionCollection = CollectionReference<Omit<Question, "id">>;
type ParticipantCollection = CollectionReference<Omit<Participant, "id">>;

// Generate random 6-digit quiz code
export const generateQuizCode = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ---------------------- QUIZZES ----------------------

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
    // 1. Ensure Auth (Anonymous)
    let user = auth.currentUser;
    if (!user) {
      console.log('👤 Signing in anonymously...');
      const userCred = await signInAnonymously(auth);
      user = userCred.user;
    }
    console.log('✅ User ID:', user.uid);

    // 2. Prepare Quiz ID & Fetch Questions
    const quizzesRef = collection(db, "quizzes");
    const quizDocRef = doc(quizzesRef); // Generate ID
    const quizId = quizDocRef.id;

    console.log("🌍 Fetching questions for quiz:", quizId);
    const questions = await fetchQuestionsFromAPI(quizId, topic, 10, difficulty);

    // 3. Create Quiz Document
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

    // 4. Populate Subcollection (for compatibility)
    await addQuestions(quizId, questions);

    console.log("✅ Quick Game created:", quizId);
    return quizId;

  } catch (error) {
    console.error("❌ Failed to create quick game:", error);
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
    // Type-safe quiz data with serverTimestamp
    // createdAt will be a FieldValue when writing, becomes Timestamp when reading
    const quizData: Omit<Quiz, "id" | "createdAt"> & { createdAt: FieldValue } = {
      title,
      description,
      // Storing email instead of UID allows us to display "Created by: user@example.com"
      // without needing a separate user lookup or profile system.
      createdBy: userEmail,
      ownerId: userId,
      createdAt: serverTimestamp(),
      status: "draft",
      currentQuestionIndex: -1,
      code: generateQuizCode(),
    };

    console.log("🚀 Writing to Firestore…");
    console.log("📦 Quiz payload:", { ...quizData, createdAt: "[serverTimestamp]" });

    // Type-safe collection reference
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

// ---------------------- GET QUIZ ----------------------

/**
 * Get a quiz by its document ID
 * @param quizId - The quiz document ID
 * @returns Promise resolving to Quiz object or null if not found
 */
export const getQuiz = async (quizId: string): Promise<Quiz | null> => {
  try {
    console.log("🔍 Fetching quiz:", quizId);

    // Type-safe document reference
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

    // 1. Delete all questions in the subcollection
    // We need to fetch them first because we can't delete a collection directly
    const questions = await getQuestions(quizId);
    const deletePromises = questions.map(q => deleteQuestion(quizId, q.id));
    await Promise.all(deletePromises);

    // 2. Delete the quiz document
    const quizRef = doc(db, "quizzes", quizId);
    await deleteDoc(quizRef);

    console.log("✅ Quiz deleted");
  } catch (error) {
    console.error("❌ Error deleting quiz:", error);
    throw error;
  }
};

// ---------------------- QUESTIONS ----------------------

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

    // Type-safe question data
    const questionData: Omit<Question, "id"> = {
      ...data,
      quizId,
    };

    // Type-safe subcollection reference
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

    // Type-safe document reference for subcollection
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

// ---------------------- PARTICIPANTS ----------------------

/**
 * Join a quiz as a participant
 * @param quizId - The quiz document ID
 * @param name - Participant name
 * @returns Promise resolving to the created participant document ID
 */
export const joinQuiz = async (
  quizId: string,
  name: string
): Promise<string> => {
  try {
    console.log("👤 Joining quiz:", { quizId, name });

    // 1. Check if quiz exists and is in lobby state
    // We enforce 'lobby' status to prevent users from joining mid-game,
    // which simplifies the state management and scoring logic.
    const quiz = await getQuiz(quizId);
    if (!quiz) throw new Error("Quiz not found");
    if (quiz.status !== "lobby") throw new Error("Quiz is not open for joining");

    // Type-safe participant data with serverTimestamp
    const participantData: Omit<Participant, "id" | "joinedAt"> & {
      joinedAt: FieldValue;
    } = {
      name,
      quizId,
      joinedAt: serverTimestamp(),
      totalScore: 0,
      answers: [],
    };

    // Type-safe subcollection reference
    const participantsRef: ParticipantCollection = collection(
      db,
      "quizzes",
      quizId,
      "participants"
    ) as ParticipantCollection;

    const docRef = await addDoc(participantsRef, participantData);

    console.log("✅ Participant joined:", docRef.id);
    return docRef.id;
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

// ---------------------- REALTIME SUBSCRIPTIONS ----------------------

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

  // Using onSnapshot allows the client to react instantly to state changes
  // (e.g., Admin clicks "Next Question" -> Client UI updates immediately).
  // This is the core of the real-time experience.
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

  const q = query(participantsRef, orderBy("totalScore", "desc"));

  return onSnapshot(q, (snap) => {
    const participants = snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Participant);
    console.log("📡 Participant updates received:", participants.length);
    callback(participants);
  });
};

// ---------------------- GAME CONTROL ----------------------

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
      questionStartTime: Date.now(), // Using client timestamp for simplicity, ideally serverTimestamp
    });

    console.log("✅ Question started");
  } catch (error) {
    console.error("❌ Error starting question:", error);
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
 * Submit an answer for a participant
 * @param quizId - The quiz ID
 * @param participantId - The participant ID
 * @param answer - The answer object
 */
export const submitAnswer = async (
  quizId: string,
  participantId: string,
  answer: ParticipantAnswer
): Promise<void> => {
  try {
    console.log("📝 Submitting answer:", { quizId, participantId, answer });

    const participantRef = doc(
      db,
      "quizzes",
      quizId,
      "participants",
      participantId
    ) as DocumentReference<Participant>;

    // We need to atomically update the answers array and totalScore
    // Ideally use a transaction, but for simplicity we'll read-modify-write here
    // or use arrayUnion if we trust the client. 
    // Since we need to update score too, let's use a transaction or just get/update.
    // NOTE: In a production app, scoring should happen in a Cloud Function
    // to prevent clients from manipulating their score or 'isCorrect' status.

    const participantSnap = await getDoc(participantRef);
    if (!participantSnap.exists()) throw new Error("Participant not found");

    const participant = participantSnap.data();

    // Check if already answered
    const alreadyAnswered = participant.answers.some(a => a.questionId === answer.questionId);
    if (alreadyAnswered) {
      console.warn("⚠️ Participant already answered this question");
      return; // Idempotency: just return success if already answered
    }

    const newScore = participant.totalScore + answer.pointsEarned;
    const newAnswers = [...participant.answers, answer];

    await updateDoc(participantRef, {
      answers: newAnswers,
      totalScore: newScore
    });

    console.log("✅ Answer submitted");
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
): Promise<QuestionResult> => {
  try {
    console.log("📊 Calculating results:", { quizId, questionId });

    const participants = await getParticipants(quizId);
    const questions = await getQuestions(quizId);
    const question = questions.find(q => q.id === questionId);

    if (!question) throw new Error("Question not found");

    // Aggregating results on the client side for the Admin view.
    // This avoids the need for a separate "results" collection or heavy backend logic
    // for this simple use case.
    const optionCounts = new Array(question.options.length).fill(0);
    let totalResponses = 0;

    participants.forEach(p => {
      const answer = p.answers.find(a => a.questionId === questionId);
      if (answer) {
        if (answer.selectedOptionIndex >= 0 && answer.selectedOptionIndex < optionCounts.length) {
          optionCounts[answer.selectedOptionIndex]++;
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

    const leaderboard: LeaderboardEntry[] = participants.map(p => ({
      participantId: p.id,
      name: p.name,
      totalScore: p.totalScore,
      correctAnswers: p.answers.filter(a => a.isCorrect).length,
      rank: 0 // Will calculate below
    }));

    // Sort by score desc
    leaderboard.sort((a, b) => b.totalScore - a.totalScore);

    // Assign ranks
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return leaderboard;
  } catch (error) {
    console.error("❌ Error fetching leaderboard:", error);
    throw error;
  }
};
