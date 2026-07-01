import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

const QuizContext = createContext();

export const RoundEngine = {
  getCurrentRound: (questionIndex, settings) => {
    const qpr = Math.max(1, Number(settings.questionsPerRound) || 1);
    return Math.floor(questionIndex / qpr) + 1;
  },
  
  isLastQuestionOfRound: (questionIndex, settings, totalQuestions) => {
    const qpr = Math.max(1, Number(settings.questionsPerRound) || 1);
    const isMathematicallyLastInRound = (questionIndex + 1) % qpr === 0;
    const isAbsolutelyLast = questionIndex >= totalQuestions - 1;
    return isMathematicallyLastInRound || isAbsolutelyLast;
  },
  
  getFirstQuestionOfRound: (roundNumber, settings) => {
    const qpr = Math.max(1, Number(settings.questionsPerRound) || 1);
    return (roundNumber - 1) * qpr;
  },
  
  isFinalRound: (roundNumber, settings) => {
    const maxRounds = Math.max(1, Number(settings.roundsCount) || 1);
    return roundNumber >= maxRounds;
  }
};

const CHANNEL_NAME = 'python_quiz_sync';

// Default initial state
const defaultState = {
  teams: [
    { id: 't1', name: 'Team Alpha', color: '#3776AB', score: 0 },
    { id: 't2', name: 'Team Beta', color: '#FFD43B', score: 0 },
    { id: 't3', name: 'Team Gamma', color: '#10B981', score: 0 },
    { id: 't4', name: 'Team Delta', color: '#EF4444', score: 0 },
    { id: 't5', name: 'Team Epsilon', color: '#8B5CF6', score: 0 },
    { id: 't6', name: 'Team Zeta', color: '#F97316', score: 0 },
    { id: 't7', name: 'Team Eta', color: '#06B6D4', score: 0 },
  ],
  questions: [], // Question Bank
  rounds: [], // Current quiz structure
  currentQuiz: {
    isActive: false,
    hideQuestion: true,
    roundIndex: 0,
    questionIndex: 0,
    questionState: 'hidden', // 'hidden', 'timer', 'revealed', 'completed'
    winnerTeamId: null,
    awardedPoints: 0,
    timer: {
      duration: 30, // seconds
      remaining: 30,
      status: 'idle', // 'idle', 'running', 'paused', 'finished'
    }
  },
  settings: {
    eventTitle: 'Python Quiz Competition',
    eventSubtitle: 'Test Your Python Knowledge',
    organizerName: 'Quizmaster',
    roundsCount: 3,
    questionsPerRound: 10,
    timerEnabled: true,
    timerDuration: 30,
    defaultPoints: 10,
    negativePoints: 0,
    allowManualScoring: false,
    soundEnabled: true,
    soundVolume: 50,
    theme: 'light',
  }
};

export const QuizProvider = ({ children }) => {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem('pythonQuizState');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.teams) {
        parsed.teams = parsed.teams.map(t => ({
          ...t,
          score: isNaN(Number(t.score)) ? 0 : Number(t.score)
        }));
      }
      return parsed;
    }
    return defaultState;
  });

  const channelRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('pythonQuizState', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    channelRef.current = new BroadcastChannel(CHANNEL_NAME);
    
    const handleMessage = (event) => {
      const { type, payload, senderId } = event.data;
      if (type === 'SYNC_STATE') {
        setState(payload);
      }
    };

    channelRef.current.addEventListener('message', handleMessage);
    
    return () => {
      channelRef.current.removeEventListener('message', handleMessage);
      channelRef.current.close();
    };
  }, []);

  const dispatchUpdate = useCallback((newStateOrUpdater) => {
    setState((prevState) => {
      const newState = typeof newStateOrUpdater === 'function' ? newStateOrUpdater(prevState) : newStateOrUpdater;
      
      if (channelRef.current) {
        channelRef.current.postMessage({
          type: 'SYNC_STATE',
          payload: newState,
          senderId: Date.now()
        });
      }
      return newState;
    });
  }, []);

  // --- TEAM ACTIONS ---
  const addTeam = (team) => {
    dispatchUpdate(prev => ({
      ...prev,
      teams: [...prev.teams, { ...team, id: uuidv4(), score: 0 }]
    }));
  };

  const updateTeam = (id, updates) => {
    dispatchUpdate(prev => ({
      ...prev,
      teams: prev.teams.map(t => t.id === id ? { ...t, ...updates } : t)
    }));
  };

  const removeTeam = (id) => {
    dispatchUpdate(prev => ({
      ...prev,
      teams: prev.teams.filter(t => t.id !== id)
    }));
  };

  const shuffleTeams = () => {
    dispatchUpdate(prev => {
      const shuffled = [...prev.teams].sort(() => Math.random() - 0.5);
      return { ...prev, teams: shuffled };
    });
  };

  const updateScore = (teamId, points) => {
    dispatchUpdate(prev => ({
      ...prev,
      teams: prev.teams.map(t => t.id === teamId ? { ...t, score: t.score + Number(points) } : t)
    }));
  };

  const reorderTeam = (teamId, direction) => {
    dispatchUpdate(prev => {
      const index = prev.teams.findIndex(t => t.id === teamId);
      if (index === -1) return prev;
      const newTeams = [...prev.teams];
      if (direction === 'up' && index > 0) {
        [newTeams[index - 1], newTeams[index]] = [newTeams[index], newTeams[index - 1]];
      } else if (direction === 'down' && index < newTeams.length - 1) {
        [newTeams[index + 1], newTeams[index]] = [newTeams[index], newTeams[index + 1]];
      }
      return { ...prev, teams: newTeams };
    });
  };

  const resetScores = () => {
    dispatchUpdate(prev => ({
      ...prev,
      teams: prev.teams.map(t => ({ ...t, score: 0 }))
    }));
  };

  // --- QUESTION ACTIONS ---
  const addQuestion = (question) => {
    dispatchUpdate(prev => ({
      ...prev,
      questions: [...prev.questions, { ...question, id: uuidv4() }]
    }));
  };

  const updateQuestion = (id, updates) => {
    dispatchUpdate(prev => ({
      ...prev,
      questions: prev.questions.map(q => q.id === id ? { ...q, ...updates } : q)
    }));
  };

  const removeQuestion = (id) => {
    dispatchUpdate(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id)
    }));
  };

  const removeMultipleQuestions = (ids) => {
    dispatchUpdate(prev => ({
      ...prev,
      questions: prev.questions.filter(q => !ids.includes(q.id))
    }));
  };

  const duplicateQuestion = (id) => {
    dispatchUpdate(prev => {
      const q = prev.questions.find(q => q.id === id);
      if (!q) return prev;
      const copy = { ...q, id: uuidv4(), text: `${q.text} (Copy)` };
      const index = prev.questions.findIndex(q => q.id === id);
      const newQuestions = [...prev.questions];
      newQuestions.splice(index + 1, 0, copy);
      return { ...prev, questions: newQuestions };
    });
  };

  const setQuestions = (questions) => {
    dispatchUpdate(prev => ({ ...prev, questions }));
  };

  // --- SETTINGS ACTIONS ---
  const updateSettings = (updates) => {
    dispatchUpdate(prev => ({
      ...prev,
      settings: { ...prev.settings, ...updates }
    }));
  };

  const resetEvent = () => {
    dispatchUpdate(prev => ({
      ...defaultState,
      settings: prev.settings, // Keep settings? Actually user asked for general Reset Event.
    }));
  };
  
  const replaceState = (newState) => {
    dispatchUpdate(newState);
  };

  // --- CONTROL CENTER ACTIONS ---
  const startQuiz = () => {
    dispatchUpdate(prev => ({
      ...prev,
      currentQuiz: {
        ...prev.currentQuiz,
        isActive: true,
        roundIndex: 0,
        questionIndex: 0,
        questionState: prev.settings.timerEnabled ? 'timer' : 'hidden',
        winnerTeamId: null,
        awardedPoints: 0,
        awardTimestamp: null,
        lastAwardedTeamId: null,
        timer: {
          duration: Number(prev.settings.timerDuration) || 30,
          remaining: Number(prev.settings.timerDuration) || 30,
          status: prev.settings.timerEnabled ? 'running' : 'idle',
        }
      }
    }));
  };

  const nextQuestion = () => {
    dispatchUpdate(prev => {
      const isLastOverall = prev.currentQuiz.questionIndex >= prev.questions.length - 1;
      const isLastInRound = RoundEngine.isLastQuestionOfRound(prev.currentQuiz.questionIndex, prev.settings, prev.questions.length);

      if (isLastInRound && !isLastOverall && prev.currentQuiz.questionState !== 'round_winner') {
        return {
          ...prev,
          currentQuiz: {
            ...prev.currentQuiz,
            questionState: 'round_winner'
          }
        };
      }

      if (isLastOverall && prev.currentQuiz.questionState !== 'quiz_champion') {
        return {
          ...prev,
          currentQuiz: {
            ...prev.currentQuiz,
            questionState: 'quiz_champion'
          }
        };
      }

      let qIndex = Math.min(prev.questions.length - 1, prev.currentQuiz.questionIndex + 1);
      return {
        ...prev,
        currentQuiz: {
          ...prev.currentQuiz,
          questionIndex: qIndex,
          questionState: prev.settings.timerEnabled ? 'timer' : 'hidden',
          winnerTeamId: null,
          awardedPoints: 0,
          awardTimestamp: null,
          lastAwardedTeamId: null,
          timer: {
            duration: Number(prev.settings.timerDuration) || 30,
            remaining: Number(prev.settings.timerDuration) || 30,
            status: prev.settings.timerEnabled ? 'running' : 'idle',
          }
        }
      };
    });
  };

  const nextRound = () => {
    dispatchUpdate(prev => {
      const currentRoundVal = RoundEngine.getCurrentRound(prev.currentQuiz.questionIndex, prev.settings);
      const nextRoundVal = currentRoundVal + 1;
      
      let nextQIndex = RoundEngine.getFirstQuestionOfRound(nextRoundVal, prev.settings);
      
      if (nextQIndex >= prev.questions.length) {
         return prev; // Already at the end
      }

      return {
        ...prev,
        currentQuiz: {
          ...prev.currentQuiz,
          questionIndex: nextQIndex,
          questionState: prev.settings.timerEnabled ? 'timer' : 'hidden',
          winnerTeamId: null,
          awardedPoints: 0,
          awardTimestamp: null,
          lastAwardedTeamId: null,
          timer: {
            duration: Number(prev.settings.timerDuration) || 30,
            remaining: Number(prev.settings.timerDuration) || 30,
            status: prev.settings.timerEnabled ? 'running' : 'idle',
          }
        }
      };
    });
  };

  const previousQuestion = () => {
    dispatchUpdate(prev => {
      let qIndex = Math.max(0, prev.currentQuiz.questionIndex - 1);
      return {
        ...prev,
        currentQuiz: {
          ...prev.currentQuiz,
          questionIndex: qIndex,
          questionState: prev.settings.timerEnabled ? 'timer' : 'hidden',
          winnerTeamId: null,
          awardedPoints: 0,
          timer: {
            duration: Number(prev.settings.timerDuration) || 30,
            remaining: Number(prev.settings.timerDuration) || 30,
            status: prev.settings.timerEnabled ? 'running' : 'idle',
          }
        }
      };
    });
  };

  const revealAnswer = () => {
    dispatchUpdate(prev => ({
      ...prev,
      currentQuiz: {
        ...prev.currentQuiz,
        questionState: 'revealed',
        timer: { ...prev.currentQuiz.timer, status: 'finished' }
      }
    }));
  };

  const skipQuestion = () => {
    nextQuestion(); // Basically identical to next for now.
  };

  const awardPoints = (teamId) => {
    dispatchUpdate(prev => {
      const activeQuestion = prev.questions[prev.currentQuiz.questionIndex];
      // Default to 10 points if not specified
      const points = activeQuestion?.points || 10;
      
      const newTeams = prev.teams.map(team => {
        if (team.id === teamId) {
          return { ...team, score: team.score + points };
        }
        return team;
      });

      return {
        ...prev,
        teams: newTeams,
        currentQuiz: {
          ...prev.currentQuiz,
          winnerTeamId: teamId,
          awardedPoints: points,
          lastAwardedTeamId: teamId,
          awardTimestamp: Date.now(),
          questionState: 'completed',
          timer: { ...prev.currentQuiz.timer, status: 'finished' }
        }
      };
    });
  };

  const showRoundWinner = () => {
    dispatchUpdate(prev => ({
      ...prev,
      currentQuiz: {
        ...prev.currentQuiz,
        questionState: 'round_winner'
      }
    }));
  };

  const showQuizChampion = () => {
    dispatchUpdate(prev => ({
      ...prev,
      currentQuiz: {
        ...prev.currentQuiz,
        questionState: 'quiz_champion'
      }
    }));
  };

  const setTimerStatus = (status) => {
    // 'idle', 'running', 'paused', 'finished'
    dispatchUpdate(prev => ({
      ...prev,
      currentQuiz: {
        ...prev.currentQuiz,
        questionState: status === 'running' ? 'timer' : prev.currentQuiz.questionState,
        timer: { ...prev.currentQuiz.timer, status }
      }
    }));
  };

  const updateTimerRemaining = (remaining) => {
    dispatchUpdate(prev => ({
      ...prev,
      currentQuiz: {
        ...prev.currentQuiz,
        timer: { ...prev.currentQuiz.timer, remaining }
      }
    }));
  };

  const setQuizState = (updates) => {
    dispatchUpdate(prev => ({
      ...prev,
      currentQuiz: { ...prev.currentQuiz, ...updates }
    }));
  };

  const resetQuiz = () => {
    dispatchUpdate(prev => ({
      ...prev,
      teams: prev.teams.map(t => ({ ...t, score: 0 })),
      currentQuiz: {
        ...prev.currentQuiz,
        isActive: true,
        roundIndex: 0,
        questionIndex: 0,
        questionState: 'hidden',
        winnerTeamId: null,
        awardedPoints: 0,
        timer: {
          duration: Number(prev.settings.timerDuration) || 30,
          remaining: Number(prev.settings.timerDuration) || 30,
          status: 'idle',
        }
      }
    }));
  };
  
  const toggleTheme = () => {
    dispatchUpdate(prev => {
      const newTheme = prev.settings.theme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      return { ...prev, settings: { ...prev.settings, theme: newTheme } };
    });
  }
  
  useEffect(() => {
      document.documentElement.setAttribute('data-theme', state.settings.theme);
  }, [state.settings.theme]);

  const value = {
    state,
    dispatchUpdate,
    actions: {
      addTeam, updateTeam, removeTeam, shuffleTeams, updateScore, reorderTeam, resetScores,
      addQuestion, updateQuestion, removeQuestion, removeMultipleQuestions, duplicateQuestion, setQuestions,
      updateSettings, resetEvent, replaceState,
      startQuiz, nextQuestion, previousQuestion, revealAnswer, skipQuestion, nextRound, awardPoints, showRoundWinner, showQuizChampion,
      setTimerStatus, updateTimerRemaining, setQuizState, resetQuiz, toggleTheme
    }
  };

  return (
    <QuizContext.Provider value={value}>
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};
