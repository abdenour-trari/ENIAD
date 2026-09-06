import { useEffect, useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { Question, ExamSettings, ExamResult, Attempt, OpenQuestionGrade } from './types';
import { Header } from './components/Header';
import { Home, SAMPLE_PYTHON_CODE } from './pages/Home';
import { EditorPage } from './pages/EditorPage';
import { ExamPage } from './pages/ExamPage';
import { ResultsPage } from './pages/ResultsPage';
import { calculateResultsWithOpenGrades, shuffleArray, arraysEqual } from './utils/helpers';

export default function App() {
  // Navigation & Core States
  const [screen, setScreen] = useLocalStorage<'HOME' | 'EDITOR'>('qcm_screen', 'HOME');
  const [code, setCode] = useLocalStorage<string>('qcm_code', SAMPLE_PYTHON_CODE);
  
  // Dark/Light Theme (defaults to dark = true)
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('qcm_dark_mode', true);

  // Active Quiz State (autosaved to recover from page reload)
  const [activeQuestions, setActiveQuestions] = useLocalStorage<Question[]>('qcm_active_questions', []);
  const [answers, setAnswers] = useLocalStorage<Record<number, number[] | string>>('qcm_answers', {});
  const [settings, setSettings] = useLocalStorage<ExamSettings>('qcm_settings', {
    enableTimer: false,
    duration: 15,
    shuffleQuestions: false,
    shuffleOptions: false,
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useLocalStorage<number>('qcm_curr_q_idx', 0);
  const [isExamStarted, setIsExamStarted] = useLocalStorage<boolean>('qcm_exam_started', false);
  const [isExamSubmitted, setIsExamSubmitted] = useLocalStorage<boolean>('qcm_exam_submitted', false);
  
  // Timer States
  const [startTime, setStartTime] = useLocalStorage<number | null>('qcm_start_time', null);
  const [timeRemaining, setTimeRemaining] = useLocalStorage<number | null>('qcm_time_remaining', null);
  const [examResult, setExamResult] = useLocalStorage<ExamResult | null>('qcm_result', null);

  // Attempts History & Teacher Adjustment
  const [attempts, setAttempts] = useLocalStorage<Attempt[]>('qcm_attempts', []);
  const [currentAttemptId, setCurrentAttemptId] = useLocalStorage<string | null>('qcm_curr_attempt_id', null);

  // AI Grading Loading State (Not persisted, reset on load/reload)
  const [isGrading, setIsGrading] = useState(false);
  const [gradedCount, setGradedCount] = useState(0);
  const [totalOpenQuestions, setTotalOpenQuestions] = useState(0);
  const [gradingStatusMessage, setGradingStatusMessage] = useState('');

  // Apply dark mode class to HTML
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handle Home -> Editor paste code action
  const handlePasteCode = (defaultCode: string) => {
    setCode(defaultCode);
    setScreen('EDITOR');
  };

  // Handle Home -> Editor upload action
  const handleUploadFile = (fileContent: string) => {
    setCode(fileContent);
    setScreen('EDITOR');
  };

  // Initialize Exam Session (Shuffles option labels and question indices safely)
  const handleGenerateExam = (parsedQuestions: Question[], examSettings: ExamSettings) => {
    let questionsToUse = [...parsedQuestions];

    // 1. Shuffle option text values first if configured, re-mapping correct answer index values
    if (examSettings.shuffleOptions) {
      questionsToUse = questionsToUse.map((q) => {
        // Skip open ended questions as they don't have multiple options
        if (!['QCU', 'QCM'].includes(q.type) || !q.options || !q.correct) {
          return q;
        }

        // Pair options with their indices
        const indexedOptions = q.options.map((opt, idx) => ({ opt, originalIdx: idx }));
        const shuffledIndexedOptions = shuffleArray(indexedOptions);
        
        const newOptions = shuffledIndexedOptions.map((x) => x.opt);
        const newCorrect = shuffledIndexedOptions
          .map((x, newIdx) => (q.correct!.includes(x.originalIdx) ? newIdx : -1))
          .filter((newIdx) => newIdx !== -1);

        return {
          ...q,
          options: newOptions,
          correct: newCorrect,
        };
      });
    }

    // 2. Shuffle questions index orders
    if (examSettings.shuffleQuestions) {
      questionsToUse = shuffleArray(questionsToUse);
    }

    setActiveQuestions(questionsToUse);
    setAnswers({});
    setSettings(examSettings);
    setCurrentQuestionIndex(0);
    setIsExamStarted(true);
    setIsExamSubmitted(false);
    setExamResult(null);
    setCurrentAttemptId(null);

    const now = Date.now();
    setStartTime(now);
    if (examSettings.enableTimer) {
      setTimeRemaining(examSettings.duration * 60);
    } else {
      setTimeRemaining(null);
    }
  };

  // Toggle user MCQ selected index options
  const handleOptionToggle = (questionId: number, optionIdx: number) => {
    setAnswers((prevAnswers) => {
      const currentSelection = (prevAnswers[questionId] as number[]) || [];
      const question = activeQuestions.find((q) => q.id === questionId);
      if (!question) return prevAnswers;

      let newSelection: number[];

      if (question.type === 'QCU') {
        newSelection = currentSelection.includes(optionIdx) ? [] : [optionIdx];
      } else {
        newSelection = currentSelection.includes(optionIdx)
          ? currentSelection.filter((i) => i !== optionIdx)
          : [...currentSelection, optionIdx];
      }

      return {
        ...prevAnswers,
        [questionId]: newSelection,
      };
    });
  };

  // Update user essay answer text
  const handleTextAnswerChange = (questionId: number, text: string) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: text,
    }));
  };

  const handlePrevQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.min(activeQuestions.length - 1, prev + 1));
  };

  const handleJumpToQuestion = (index: number) => {
    if (index >= 0 && index < activeQuestions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  // Submit and compute results (uses backend streaming evaluation for open questions)
  const handleSubmitExam = async () => {
    const endTime = Date.now();
    const elapsedSeconds = startTime ? Math.round((endTime - startTime) / 1000) : 0;
    
    // Filter open questions
    const openQuestions = activeQuestions.filter(
      (q) => !['QCU', 'QCM'].includes(q.type)
    );

    // Identify incorrect MCQ/QCU questions
    const incorrectMCQs = activeQuestions.filter((q) => {
      if (['QCU', 'QCM'].includes(q.type)) {
        const userAnswer = answers[q.id] as number[] || [];
        return !arraysEqual(userAnswer, q.correct || []);
      }
      return false;
    });

    if (openQuestions.length > 0 || incorrectMCQs.length > 0) {
      setIsGrading(true);
      setGradedCount(0);
      setTotalOpenQuestions(openQuestions.length + incorrectMCQs.length);
      setGradingStatusMessage("Connexion au serveur de correction IA...");

      const payloadAnswers: any[] = [];
      openQuestions.forEach((q) => {
        payloadAnswers.push({
          question_id: q.id,
          type: q.type,
          question: q.question,
          expected_answer: q.expected_answer || '',
          student_answer: (answers[q.id] as string || '').trim(),
        });
      });

      incorrectMCQs.forEach((q) => {
        payloadAnswers.push({
          question_id: q.id,
          type: q.type,
          question: q.question,
          options: q.options || [],
          correct_indices: q.correct || [],
          student_selected: answers[q.id] as number[] || [],
        });
      });

      try {
        const response = await fetch('http://localhost:8000/grade-stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ answers: payloadAnswers }),
        });

        if (!response.ok) {
          throw new Error(`Le serveur de correction a renvoyé une erreur (${response.status})`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error("Impossible de décoder le flux de données");

        const openGrades: Record<number, OpenQuestionGrade> = {};
        const mcqExplanations: Record<number, string> = {};
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep partial line

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (dataStr) {
                const parsedEvent = JSON.parse(dataStr);
                const qId = parsedEvent.question_id;
                const grade = parsedEvent.grade;

                const qObj = activeQuestions.find((x) => x.id === qId);
                if (qObj) {
                  const isOpen = !['QCU', 'QCM'].includes(qObj.type);
                  if (isOpen) {
                    openGrades[qId] = grade as OpenQuestionGrade;
                  } else {
                    mcqExplanations[qId] = grade.feedback || '';
                  }

                  setGradedCount((prev) => prev + 1);
                  const qShort = qObj.question.substring(0, 25);
                  if (isOpen) {
                    setGradingStatusMessage(`Évalué : "${qShort}..." -> ${grade.score}/20`);
                  } else {
                    setGradingStatusMessage(`Expliqué : "${qShort}..."`);
                  }
                }
              }
            }
          }
        }

        // Complete score evaluations
        const finalResults = calculateResultsWithOpenGrades(
          activeQuestions,
          answers,
          openGrades,
          elapsedSeconds,
          {},
          mcqExplanations
        );

        setExamResult(finalResults);
        setIsExamSubmitted(true);
        setIsGrading(false);

        // Save Attempt to logs
        const attemptId = 'att_' + Date.now();
        setCurrentAttemptId(attemptId);

        const newAttempt: Attempt = {
          id: attemptId,
          timestamp: Date.now(),
          questions: activeQuestions,
          answers: answers,
          result: finalResults,
          settings: settings,
        };
        setAttempts((prev) => [newAttempt, ...prev]);

      } catch (err: any) {
        setIsGrading(false);
        alert(`Erreur de correction automatique : ${err.message}. Soumission en mode dégradé.`);

        // Fallback grades with zero scores
        const fallbackGrades: Record<number, OpenQuestionGrade> = {};
        openQuestions.forEach((q) => {
          fallbackGrades[q.id] = {
            score: 0,
            percentage: 0,
            feedback: `La correction automatique a échoué : ${err.message}`,
            strengths: [],
            missing_points: ["Veuillez corriger manuellement cette question en mode Enseignant."],
          };
        });

        const fallbackExplanations: Record<number, string> = {};
        incorrectMCQs.forEach((q) => {
          fallbackExplanations[q.id] = `L'explication IA a échoué : ${err.message}`;
        });

        const finalResults = calculateResultsWithOpenGrades(
          activeQuestions,
          answers,
          fallbackGrades,
          elapsedSeconds,
          {},
          fallbackExplanations
        );

        setExamResult(finalResults);
        setIsExamSubmitted(true);

        const attemptId = 'att_' + Date.now();
        setCurrentAttemptId(attemptId);

        const newAttempt: Attempt = {
          id: attemptId,
          timestamp: Date.now(),
          questions: activeQuestions,
          answers: answers,
          result: finalResults,
          settings: settings,
        };
        setAttempts((prev) => [newAttempt, ...prev]);
      }
    } else {
      // QCM/QCU only (instant - all correct or no MCQs)
      const finalResults = calculateResultsWithOpenGrades(
        activeQuestions,
        answers,
        {},
        elapsedSeconds,
        {},
        {}
      );

      setExamResult(finalResults);
      setIsExamSubmitted(true);

      const attemptId = 'att_' + Date.now();
      setCurrentAttemptId(attemptId);

      const newAttempt: Attempt = {
        id: attemptId,
        timestamp: Date.now(),
        questions: activeQuestions,
        answers: answers,
        result: finalResults,
        settings: settings,
      };
      setAttempts((prev) => [newAttempt, ...prev]);
    }
  };

  // Manual modifications made in Teacher Mode
  const handleUpdateResultWithTeacherAdjustments = (adjustments: Record<number, Partial<OpenQuestionGrade>>) => {
    if (!examResult) return;

    const newResult = calculateResultsWithOpenGrades(
      activeQuestions,
      answers,
      examResult.openGrades,
      examResult.timeSpent,
      adjustments,
      examResult.mcqExplanations
    );

    setExamResult(newResult);

    // Synchronize attempts history log
    setAttempts((prevAttempts) =>
      prevAttempts.map((att) => {
        if (att.id === currentAttemptId) {
          return {
            ...att,
            result: newResult,
          };
        }
        return att;
      })
    );
  };

  // Load a previously submitted attempt
  const handleLoadAttempt = (attempt: Attempt) => {
    setActiveQuestions(attempt.questions);
    setAnswers(attempt.answers);
    setSettings(attempt.settings);
    setExamResult(attempt.result);
    setCurrentAttemptId(attempt.id);
    setIsExamStarted(true);
    setIsExamSubmitted(true);
  };

  // Remove attempt from history logs
  const handleDeleteAttempt = (attemptId: string) => {
    if (window.confirm("Voulez-vous supprimer cette tentative de l'historique ?")) {
      setAttempts((prev) => prev.filter((a) => a.id !== attemptId));
      if (currentAttemptId === attemptId) {
        resetQuizState();
      }
    }
  };

  // Restart active exam (reuses active shuffling and clear responses)
  const handleRestartExam = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setIsExamSubmitted(false);
    setExamResult(null);
    setCurrentAttemptId(null);
    
    const now = Date.now();
    setStartTime(now);
    if (settings.enableTimer) {
      setTimeRemaining(settings.duration * 60);
    } else {
      setTimeRemaining(null);
    }
  };

  // Quit back to Monaco Editor screen
  const handleQuitExam = () => {
    if (window.confirm("Voulez-vous vraiment abandonner l'examen en cours ? Votre progression sera perdue.")) {
      resetQuizState();
      setScreen('EDITOR');
    }
  };

  // Reset to editor screen
  const handleNewExam = () => {
    resetQuizState();
    setScreen('EDITOR');
  };

  // Reset to home page logo click
  const handleLogoReset = () => {
    if (isExamStarted && !isExamSubmitted) {
      if (!window.confirm("Voulez-vous abandonner l'examen en cours ?")) {
        return;
      }
    }
    resetQuizState();
    setScreen('HOME');
  };

  const resetQuizState = () => {
    setIsExamStarted(false);
    setIsExamSubmitted(false);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setExamResult(null);
    setStartTime(null);
    setTimeRemaining(null);
    setActiveQuestions([]);
    setCurrentAttemptId(null);
  };

  const handleTimerTick = (nextTime: number) => {
    setTimeRemaining(nextTime);
  };

  // Render view router based on state
  const renderScreen = () => {
    if (isExamStarted) {
      if (isExamSubmitted && examResult) {
        return (
          <ResultsPage
            questions={activeQuestions}
            answers={answers}
            result={examResult}
            onRestart={handleRestartExam}
            onNewExam={handleNewExam}
            attempts={attempts}
            onLoadAttempt={handleLoadAttempt}
            onDeleteAttempt={handleDeleteAttempt}
            onUpdateResultWithTeacherAdjustments={handleUpdateResultWithTeacherAdjustments}
          />
        );
      }
      return (
        <ExamPage
          questions={activeQuestions}
          settings={settings}
          answers={answers}
          onOptionToggle={handleOptionToggle}
          onTextAnswerChange={handleTextAnswerChange}
          onPrevQuestion={handlePrevQuestion}
          onNextQuestion={handleNextQuestion}
          onJumpToQuestion={handleJumpToQuestion}
          currentQuestionIndex={currentQuestionIndex}
          timeRemaining={timeRemaining}
          onTick={handleTimerTick}
          onSubmitExam={handleSubmitExam}
          onQuitExam={handleQuitExam}
          isGrading={isGrading}
          gradedCount={gradedCount}
          totalOpenQuestions={totalOpenQuestions}
          gradingStatusMessage={gradingStatusMessage}
        />
      );
    }

    switch (screen) {
      case 'EDITOR':
        return (
          <EditorPage
            initialCode={code}
            onGenerateExam={handleGenerateExam}
            onBack={() => setScreen('HOME')}
          />
        );
      case 'HOME':
      default:
        return (
          <Home
            onPasteCode={handlePasteCode}
            onUploadFile={handleUploadFile}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-250 bg-slate-900 text-slate-50 dark:bg-slate-950 dark:text-slate-50 light:bg-slate-50 light:text-slate-900">
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onReset={handleLogoReset}
      />
      <main className="flex-grow flex flex-col items-center justify-start w-full">
        {renderScreen()}
      </main>
    </div>
  );
}
