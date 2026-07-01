import React from 'react';
import { useQuiz, RoundEngine } from '../context/QuizContext';
import PodiumCeremony from '../components/PodiumCeremony';
import QuizWaitingScreen from '../components/QuizWaitingScreen';
import { motion, AnimatePresence } from 'framer-motion';
import './ProjectorScreen.css';

const ProjectorScreen = () => {
  const { state, actions } = useQuiz();
  const { currentQuiz, settings, teams, questions } = state;

  const [activeAwards, setActiveAwards] = React.useState({});

  React.useEffect(() => {
    if (currentQuiz.awardTimestamp && currentQuiz.lastAwardedTeamId && currentQuiz.awardedPoints > 0) {
      const id = currentQuiz.awardTimestamp;
      setActiveAwards(prev => ({
        ...prev,
        [id]: {
          teamId: currentQuiz.lastAwardedTeamId,
          points: currentQuiz.awardedPoints,
        }
      }));

      const timer = setTimeout(() => {
        setActiveAwards(prev => {
          const newState = { ...prev };
          delete newState[id];
          return newState;
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentQuiz.awardTimestamp, currentQuiz.lastAwardedTeamId]);

  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const highestScore = sortedTeams.length > 0 ? sortedTeams[0].score : 0;

  const activeQuestion = questions[currentQuiz.questionIndex];
  const isRevealed = currentQuiz.questionState === 'revealed' || currentQuiz.questionState === 'completed';
  const currentRound = RoundEngine.getCurrentRound(currentQuiz.questionIndex, settings);
  const showWaitingScreen = !currentQuiz.isActive || currentQuiz.hideQuestion === true;

  return (
    <div className="projector-container">
      <AnimatePresence mode="wait">
        {showWaitingScreen ? (
          <motion.div
            key="waiting-screen-full"
            className="projector-waiting-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <QuizWaitingScreen eventTitle={settings.eventTitle} eventSubtitle={settings.eventSubtitle} />
          </motion.div>
        ) : (
          <motion.div
            key="live-projector"
            className="projector-live-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <header className="projector-header">
              <div className="event-title text-gradient">{settings.eventTitle || 'Quiz Competition'}</div>
              <div className="round-info">Round {currentRound}</div>
            </header>

            <div className="projector-content-wrapper">
              <main className="projector-main">
                <AnimatePresence mode="wait">
                  {!activeQuestion ? (
                    <motion.div
                      key="no-questions"
                      className="waiting-screen animate-slide-up"
                      style={{ textAlign: 'center' }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <h1 className="text-gradient" style={{ fontSize: '4rem' }}>
                        No Questions Found
                      </h1>
                    </motion.div>
                  ) : currentQuiz.questionState === 'round_winner' || currentQuiz.questionState === 'quiz_champion' ? (
                    <motion.div
                      key={currentQuiz.questionState}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      style={{ width: '100%', height: '100%' }}
                    >
                      <PodiumCeremony
                        teams={teams}
                        roundNumber={currentRound}
                        isFinale={currentQuiz.questionState === 'quiz_champion'}
                        isFinalRound={currentQuiz.questionIndex === questions.length - 1}
                        onNext={() => actions?.nextQuestion()}
                        onFinish={() => {
                          if (actions?.resetQuiz) actions.resetQuiz();
                          else alert('Competition Finished!');
                        }}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="active-question"
                      className="active-question-screen"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      style={{ width: '100%' }}
                    >
                      <div className="projector-question-meta">
                        <div style={{ fontSize: '1.5rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                          Question {currentQuiz.questionIndex + 1}
                        </div>
                        {settings.timerEnabled && currentQuiz.timer.status !== 'idle' && (
                          <div className={`projector-timer ${currentQuiz.timer.remaining <= 5 && currentQuiz.timer.status === 'running' ? 'warning' : ''}`}>
                            {Math.floor(currentQuiz.timer.remaining / 60)}:{(currentQuiz.timer.remaining % 60).toString().padStart(2, '0')}
                          </div>
                        )}
                      </div>

                      <div className="projector-question-text">{activeQuestion.text}</div>

                      {activeQuestion.code && activeQuestion.code.trim().length > 0 && (activeQuestion.questionType === 'Guess Output' || activeQuestion.code.includes('\n')) && (
                        <div className="projector-question-code">
                          <pre>{activeQuestion.code.trim()}</pre>
                        </div>
                      )}

                      {activeQuestion.options && Object.keys(activeQuestion.options).length > 0 && (
                        <div className="projector-options">
                          {['A', 'B', 'C', 'D'].map(letter => {
                            const optionText = activeQuestion.options[letter];
                            if (!optionText) return null;

                            const isCorrect = activeQuestion.correctAnswer === letter || activeQuestion.options[letter] === activeQuestion.correctAnswer;
                            let optionClass = 'projector-option';
                            if (isRevealed) {
                              if (isCorrect) optionClass += ' correct-revealed';
                              else optionClass += ' dimmed';
                            }

                            return (
                              <div key={letter} className={optionClass}>
                                <div className="projector-option-letter">{letter}</div>
                                <div className="projector-option-text">{optionText}</div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {isRevealed && (!activeQuestion.options || Object.values(activeQuestion.options).filter(Boolean).length === 0 || activeQuestion.questionType === 'Guess Output') && (
                        <div style={{ marginTop: '2rem', padding: '2rem', background: 'rgba(16, 185, 129, 0.1)', border: '4px solid var(--emerald)', borderRadius: 'var(--radius-xl)' }} className="animate-slide-up">
                          <div style={{ color: 'var(--emerald)', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', fontSize: '1.5rem' }}>Correct Answer</div>
                          <div style={{ fontSize: '3rem', fontWeight: 700 }}>{activeQuestion.options?.[activeQuestion.correctAnswer] || activeQuestion.correctAnswer || 'Answer Revealed'}</div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div style={{ position: 'absolute', bottom: '3rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', gap: '1rem', zIndex: 100, alignItems: 'center' }}>
                  <AnimatePresence>
                    {Object.keys(activeAwards).map(awardKey => {
                      const award = activeAwards[awardKey];
                      const team = teams.find(t => t.id === award.teamId);
                      if (!team) return null;
                      return (
                        <motion.div
                          key={awardKey}
                          initial={{ opacity: 0, y: 50, scale: 0.5, rotateX: -30 }}
                          animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                          exit={{ opacity: 0, y: -30, scale: 0.8 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            color: '#1e293b',
                            padding: '1rem 3rem',
                            borderRadius: '100px',
                            fontWeight: 800,
                            fontSize: '2rem',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            border: `4px solid ${team.color}`
                          }}
                        >
                          <span style={{ color: 'var(--emerald)' }}>{award.points} points</span> added to <span style={{ color: team.color }}>{team.name}</span>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </main>

              <aside className="projector-sidebar glass-panel">
                <div className="sidebar-title" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Scoreboard</div>

                <div className="pl-table-container">
                  <table className="pl-table">
                    <thead>
                      <tr>
                        <th className="pl-pos">Pos</th>
                        <th className="pl-club">Club</th>
                        <th className="pl-pts">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedTeams.map((team, index) => {
                        const isFirstPlace = team.score > 0 && team.score === highestScore;
                        const awardKey = Object.keys(activeAwards).find(k => activeAwards[k].teamId === team.id);
                        const isRecentlyAwarded = !!awardKey;

                        return (
                          <tr key={team.id} className={`pl-row ${isFirstPlace ? 'pl-first' : ''}`} style={{ position: 'relative' }}>
                            <td className="pl-pos">{index + 1}</td>
                            <td className="pl-club" style={{ position: 'relative' }}>
                              <span className="pl-team-color" style={{ backgroundColor: team.color }}></span>
                              {team.name}
                              {isRecentlyAwarded && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1.05 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 1.5 }}
                                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: `linear-gradient(90deg, transparent, ${team.color}40, transparent)`, pointerEvents: 'none', borderRadius: '4px' }}
                                />
                              )}
                            </td>
                            <td className="pl-pts" style={{ position: 'relative' }}>
                              <motion.div
                                key={team.score}
                                initial={isRecentlyAwarded ? { scale: 1.5, color: 'var(--emerald)' } : { scale: 1, color: 'var(--text-main)' }}
                                animate={{ scale: 1, color: 'var(--text-main)' }}
                                transition={{ duration: 0.5 }}
                              >
                                {team.score}
                              </motion.div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </aside>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectorScreen;
