import { useEffect, useRef, useState } from 'react';
import { Answer, Question, QuestionStatus } from '../types';

interface UseTestEngineProps {
  questions: Question[];
  duration: number; // in seconds
  onTimeUp: () => void;
  initialAnswers?: Record<string, Answer>;
  initialStatus?: Record<string, QuestionStatus>;
  initialTime?: number;
  enabled?: boolean;
}

export const useTestEngine = ({
  questions,
  duration,
  onTimeUp,
  initialAnswers = {},
  initialStatus = {},
  initialTime,
  enabled = true,
}: UseTestEngineProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>(initialAnswers);
  const [questionStatus, setQuestionStatus] = useState<Record<string, QuestionStatus>>(initialStatus);
  const [timeRemaining, setTimeRemaining] = useState(initialTime ?? duration);
  
  const timerRef = useRef<any>(null);

  // Initialize status for not visited questions
  useEffect(() => {
    const newStatus = { ...initialStatus };
    let hasChanges = false;
    
    questions.forEach(q => {
      if (!newStatus[q.id]) {
        newStatus[q.id] = QuestionStatus.NOT_VISITED;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setQuestionStatus(newStatus);
    }
  }, [questions]); // Only run when questions change (initially)

  // Timer Logic
  useEffect(() => {
    if (!enabled) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [onTimeUp, enabled]);

  // Sync timeRemaining with duration if it becomes available later
  useEffect(() => {
    if (duration > 0 && timeRemaining === 0 && !initialTime) {
      setTimeRemaining(duration);
    }
  }, [duration]);

  // Mark current question as visited/not answered if it was NOT_VISITED
  useEffect(() => {
    const currentQ = questions[currentQuestionIndex];
    if (currentQ && questionStatus[currentQ.id] === QuestionStatus.NOT_VISITED) {
      setQuestionStatus(prev => ({
        ...prev,
        [currentQ.id]: QuestionStatus.NOT_ANSWERED
      }));
    }
  }, [currentQuestionIndex, questions, questionStatus]);

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const nextQuestion = () => goToQuestion(currentQuestionIndex + 1);
  const prevQuestion = () => goToQuestion(currentQuestionIndex - 1);

  const saveAnswer = (answer: Answer) => {
    const currentQ = questions[currentQuestionIndex];
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: answer
    }));
    
    // Update status to ANSWERED (or keep MARKED_FOR_REVIEW logic separate if needed)
    setQuestionStatus(prev => ({
      ...prev,
      [currentQ.id]: QuestionStatus.ANSWERED
    }));
  };

  const markForReview = () => {
    const currentQ = questions[currentQuestionIndex];
    const hasAnswer = !!answers[currentQ.id];
    
    setQuestionStatus(prev => ({
      ...prev,
      [currentQ.id]: hasAnswer ? QuestionStatus.ANSWERED_AND_MARKED : QuestionStatus.MARKED_FOR_REVIEW
    }));
  };

  const clearResponse = () => {
     const currentQ = questions[currentQuestionIndex];
     const newAnswers = { ...answers };
     delete newAnswers[currentQ.id];
     setAnswers(newAnswers);
     
     setQuestionStatus(prev => ({
       ...prev,
       [currentQ.id]: QuestionStatus.NOT_ANSWERED
     }));
  };

  // derived state
  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const currentStatus = currentQuestion ? questionStatus[currentQuestion.id] : QuestionStatus.NOT_VISITED;

  return {
    currentQuestion,
    currentQuestionIndex,
    totalQuestions: questions.length,
    timeRemaining,
    answers,
    questionStatus,
    currentAnswer, // Added for convenience
    currentStatus, // Added for convenience
    nextQuestion,
    prevQuestion,
    goToQuestion,
    saveAnswer,
    markForReview,
    clearResponse,
  };
};
