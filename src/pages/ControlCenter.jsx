import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Play, SkipForward, SkipBack, Eye, 
  Pause, RotateCcw, Maximize, Trophy, CheckCircle
} from 'lucide-react';
import { useQuiz, RoundEngine } from '../context/QuizContext';
import './ControlCenter.css';

const ControlCenter = () => {
  const { state, actions } = useQuiz();
  const { currentQuiz, settings, teams, questions } = state;

  // Timer Logic
  useEffect(() => {
    let interval = null;
    if (currentQuiz.timer.status === 'running' && currentQuiz.timer.remaining > 0) {
      interval = setInterval(() => {
        actions.updateTimerRemaining(currentQuiz.timer.remaining - 1);
      }, 1000);
    } else if (currentQuiz.timer.remaining === 0 && currentQuiz.timer.status === 'running') {
      actions.setTimerStatus('finished');
    }
    return () => clearInterval(interval);
  }, [currentQuiz.timer.status, currentQuiz.timer.remaining, actions]);

  const activeQuestion = questions[currentQuiz.questionIndex];
  const isLastQuestionOverall = currentQuiz.questionIndex >= questions.length - 1;
  const currentRound = RoundEngine.getCurrentRound(currentQuiz.questionIndex, settings);
  const isLastInRound = RoundEngine.isLastQuestionOfRound(currentQuiz.questionIndex, settings, questions.length);
  
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  const handleStartQuiz = () => {
    actions.startQuiz();
  };

  const handleToggleTimer = () => {
    if (currentQuiz.timer.status === 'running') {
      actions.setTimerStatus('paused');
    } else if (currentQuiz.timer.status === 'idle' || currentQuiz.timer.status === 'paused') {
      actions.setTimerStatus('running');
    }
  };

  const handleRestartTimer = () => {
    actions.updateTimerRemaining(currentQuiz.timer.duration || 30);
    actions.setTimerStatus('idle');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const formatTimer = (remaining) => {
    if (typeof remaining !== 'number' || isNaN(remaining)) return '00:00';
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isRevealed = currentQuiz.questionState === 'revealed' || currentQuiz.questionState === 'completed';
  const isCompleted = currentQuiz.questionState === 'completed';
  const isRoundWinner = currentQuiz.questionState === 'round_winner';
  const isQuizChampion = currentQuiz.questionState === 'quiz_champion';

  return (
    <div className="control-page">
      <header className="control-header glass-panel">
        <div className="control-header-left">
          <Link to="/" className="btn btn-secondary btn-icon">
            <ArrowLeft size={20} /> Back
          </Link>
          <h2>Live Control Center</h2>
        </div>
        <div className="control-stats">
          <div className="stat-item">
            <span className="stat-label">Round</span>
            <span className="stat-value">{currentRound}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Question</span>
            <span className="stat-value">{currentQuiz.questionIndex + 1} / {questions.length || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Timer</span>
            <span className="stat-value" style={{ color: currentQuiz.timer.remaining <= 5 ? 'var(--crimson)' : 'var(--primary-yellow)' }}>
              {formatTimer(currentQuiz.timer.remaining)}
            </span>
          </div>
        </div>
      </header>

      <div className="control-main">
        {/* LEFT SIDEBAR CONTROLS */}
        <div className="control-sidebar-left glass-panel">
          <div className="sidebar-title">Quiz Controls</div>
          {!currentQuiz.isActive ? (
            <button className="control-btn primary-action" onClick={handleStartQuiz} disabled={questions.length === 0}>
              <Play size={18} /> Start Quiz
            </button>
          ) : (
            <>
              <button className="control-btn" onClick={() => actions.previousQuestion()} disabled={currentQuiz.questionIndex === 0 || isRoundWinner}>
                <SkipBack size={18} /> Previous Question
              </button>
              {isLastInRound ? (
                <button className="control-btn" onClick={() => actions.showRoundWinner()} disabled={isRoundWinner}>
                  <Trophy size={18} /> Reveal Round Winner
                </button>
              ) : (
                <button className="control-btn" onClick={() => actions.nextQuestion()} disabled={currentQuiz.questionIndex >= questions.length - 1 || isRoundWinner}>
                  <SkipForward size={18} /> Next Question
                </button>
              )}
              
              <hr style={{ borderColor: 'var(--border-color)', margin: '0.5rem 0' }} />
              
              {settings.timerEnabled && (
                <>
                  <button className="control-btn" onClick={handleToggleTimer}>
                    {currentQuiz.timer.status === 'running' ? <Pause size={18} /> : <Play size={18} />} 
                    {currentQuiz.timer.status === 'running' ? 'Pause Timer' : 'Start/Resume Timer'}
                  </button>
                  <button className="control-btn" onClick={handleRestartTimer}>
                    <RotateCcw size={18} /> Restart Timer
                  </button>
                </>
              )}

              <hr style={{ borderColor: 'var(--border-color)', margin: '0.5rem 0' }} />
              
              <button 
                className="control-btn primary-action" 
                onClick={() => actions.revealAnswer()} 
                disabled={isRevealed || isRoundWinner}
              >
                <Eye size={18} /> Reveal Answer
              </button>
              
              <button className="control-btn" onClick={() => actions.skipQuestion()} disabled={currentQuiz.questionIndex >= questions.length - 1 || isRoundWinner}>
                <SkipForward size={18} /> Skip Question
              </button>
            </>
          )}

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
             <button className="control-btn" onClick={() => { if(window.confirm('Are you sure you want to reset the quiz? This will clear all scores.')) actions.resetQuiz(); }}>
                <RotateCcw size={18} style={{ color: 'var(--crimson)' }} /> Reset Quiz
             </button>
             <button className="control-btn" onClick={toggleFullscreen}>
                <Maximize size={18} /> Toggle Fullscreen
             </button>
          </div>
        </div>

        {/* CENTER PANEL */}
        <div className="control-center-panel">
          <div className="active-question-card glass-panel">
            {!currentQuiz.isActive ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
                <Trophy size={48} style={{ opacity: 0.5, marginBottom: '1rem', display: 'inline-block' }} />
                <h3>Ready to Start</h3>
                <p>Click "Start Quiz" in the left sidebar to begin.</p>
              </div>
            ) : isQuizChampion ? (
              <div style={{ textAlign: 'center', marginTop: '2rem' }} className="animate-slide-up">
                <Trophy size={64} style={{ color: 'var(--primary-yellow)', marginBottom: '1rem' }} className="animate-bounce-slight" />
                <h2 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Quiz Champion</h2>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: sortedTeams[0]?.color }}>
                  {sortedTeams[0]?.name}
                </div>
                <div style={{ fontSize: '1.5rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Final Score: {sortedTeams[0]?.score}
                </div>
                <button className="btn btn-primary" style={{ marginTop: '3rem' }} onClick={() => actions.resetQuiz()}>
                  <RotateCcw size={20} /> Start New Quiz
                </button>
              </div>
            ) : isRoundWinner ? (
              <div style={{ textAlign: 'center', marginTop: '2rem' }} className="animate-slide-up">
                <Trophy size={64} style={{ color: 'var(--primary-yellow)', marginBottom: '1rem' }} className="animate-bounce-slight" />
                <h2 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Round {currentRound} Winner</h2>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: sortedTeams[0]?.color }}>
                  {sortedTeams[0]?.name}
                </div>
                <div style={{ fontSize: '1.5rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Score: {sortedTeams[0]?.score}
                </div>
                {!isLastQuestionOverall ? (
                  <button className="btn btn-primary" style={{ marginTop: '3rem' }} onClick={() => actions.nextRound()}>
                    Continue to Next Round <SkipForward size={20} />
                  </button>
                ) : (
                  <button className="btn btn-primary" style={{ marginTop: '3rem', background: 'var(--primary-yellow)', color: 'black', border: 'none' }} onClick={() => actions.showQuizChampion()}>
                    <Trophy size={20} /> Reveal Quiz Champion
                  </button>
                )}
              </div>
            ) : !activeQuestion ? (
               <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
                 <h3>No Questions Available</h3>
                 <p>Please add your first question in the Question Bank.</p>
               </div>
            ) : (
              <>
                <div className="question-meta" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="badge" style={{ background: 'var(--bg-card)' }}>Q{currentQuiz.questionIndex + 1}</span>
                  <span className="badge">Round {currentRound}</span>
                  <span className="badge">{activeQuestion.category}</span>
                  <span className={`badge difficulty-${activeQuestion.difficulty?.toLowerCase()}`}>{activeQuestion.difficulty}</span>
                  {activeQuestion.questionType && (
                     <span className="badge" style={{ background: 'var(--bg-card)' }}>{activeQuestion.questionType}</span>
                  )}
                </div>
                
                <div className="question-text" style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: '1.4', marginBottom: '1rem' }}>
                  {activeQuestion.text}
                </div>
                
                {activeQuestion.code && activeQuestion.code.trim().length > 0 && (activeQuestion.questionType === 'Guess Output' || activeQuestion.code.includes('\n')) && (
                  <div className="question-code" style={{ padding: '1rem', background: '#1e1e1e', color: '#d4d4d4', borderRadius: 'var(--radius-lg)', fontFamily: "'JetBrains Mono', monospace", marginBottom: '1rem', overflowX: 'auto' }}>
                    <pre style={{ margin: 0 }}>{activeQuestion.code.trim()}</pre>
                  </div>
                )}
                
                {activeQuestion.questionType !== 'Guess Output' && activeQuestion.options && (
                  <div className="question-options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {['A', 'B', 'C', 'D'].map(letter => {
                      const optionText = activeQuestion.options[letter];
                      if (!optionText) return null;
                      
                      const isCorrect = activeQuestion.correctAnswer === letter || activeQuestion.options[letter] === activeQuestion.correctAnswer;
                      let classes = 'option-card';
                      if (isRevealed && isCorrect) classes += ' correct-revealed';
                      else if (!isRevealed && isCorrect) classes += ' correct-hint';
                      
                      return (
                        <div key={letter} className={classes}>
                          <div className="option-letter">{letter}</div>
                          <div className="option-text" style={{ fontWeight: 500 }}>{optionText}</div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {isRevealed && (!activeQuestion.options || Object.values(activeQuestion.options).filter(Boolean).length === 0 || activeQuestion.questionType === 'Guess Output') && (
                  <div style={{ marginTop: '1rem', padding: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '2px solid var(--emerald)', borderRadius: 'var(--radius-lg)' }} className="animate-slide-up">
                    <div style={{ color: 'var(--emerald)', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.875rem' }}>Correct Answer</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{activeQuestion.options?.[activeQuestion.correctAnswer] || activeQuestion.correctAnswer || 'Answer Revealed'}</div>
                  </div>
                )}

                {isRevealed && activeQuestion.explanation && (
                  <div className="question-explanation" style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(55, 118, 171, 0.1)', borderLeft: '4px solid var(--primary-blue)', borderRadius: '0 var(--radius-md) var(--radius-md) 0' }}>
                    <strong style={{ color: 'var(--primary-blue)' }}>Explanation:</strong> {activeQuestion.explanation}
                  </div>
                )}
              </>
            )}
          </div>

          {/* AWARD WINNER PANEL */}
          {isRevealed && !isRoundWinner && (
            <div className="award-panel glass-panel animate-slide-up">
              <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>Award Points (Current Question)</span>
                {isCompleted && <span style={{ fontSize: '0.75rem', color: 'var(--emerald)' }}>Points Awarded</span>}
              </h3>
              <div className="award-grid">
                {teams.map(team => {
                  const isWinner = currentQuiz.winnerTeamId === team.id;
                  return (
                    <button 
                      key={team.id} 
                      className={`award-btn ${isWinner ? 'awarded' : ''}`} 
                      style={{ color: team.color }}
                      disabled={!currentQuiz.isActive || !isRevealed || isCompleted}
                      onClick={() => actions.awardPoints(team.id)}
                    >
                      <div className="award-color" style={{ backgroundColor: team.color }}>
                        {isWinner && <CheckCircle size={14} color="white" style={{ display: 'block', margin: '5px auto' }}/>}
                      </div>
                      <span style={{ fontWeight: '600' }}>{team.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR - SCOREBOARD */}
        <div className="control-sidebar-right glass-panel">
          <div className="sidebar-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Live Scoreboard</span>
            <Trophy size={16} />
          </div>
          
          <div className="scoreboard-list">
            {sortedTeams.map((team, idx) => (
              <div key={team.id} className={`score-item ${idx === 0 && team.score > 0 ? 'first-place' : ''}`}>
                <div className="score-rank">#{idx + 1}</div>
                <div className="score-team-info">
                  <div className="score-badge" style={{ backgroundColor: team.color }}></div>
                  <span>{team.name}</span>
                </div>
                <div className="score-points">{team.score}</div>
              </div>
            ))}
            {sortedTeams.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem', fontSize: '0.875rem' }}>
                No teams found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlCenter;
