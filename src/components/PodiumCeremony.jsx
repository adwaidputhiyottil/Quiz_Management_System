import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { animate } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, Medal } from 'lucide-react';
import './PodiumCeremony.css';

const Counter = ({ from, to, delay = 0 }) => {
  const [value, setValue] = useState(from);

  useEffect(() => {
    let controls;
    const timeout = setTimeout(() => {
      controls = animate(from, to, {
        duration: 1.5,
        ease: "easeOut",
        onUpdate: (latest) => setValue(Math.floor(latest))
      });
    }, delay * 1000);

    return () => {
      clearTimeout(timeout);
      if (controls) controls.stop();
    };
  }, [from, to, delay]);

  return <span>{value}</span>;
};

const PodiumCeremony = ({ teams, roundNumber, isFinalRound, isFinale, onNext, onFinish }) => {
  const [showButtons, setShowButtons] = useState(false);

  // Derive podium positions
  const sorted = [...teams].sort((a, b) => b.score - a.score);
  
  // Tie handling
  const firstScore = sorted[0]?.score;
  const secondScore = sorted.length > 1 ? sorted[1].score : null;
  const thirdScore = sorted.length > 2 ? sorted[2].score : null;

  const isTie1 = sorted.length > 1 && firstScore === secondScore;
  const isTie2 = sorted.length > 2 && secondScore === thirdScore;

  // We only grab top 3 distinct slots
  const firstPlace = sorted[0];
  const secondPlace = sorted.length > 1 ? sorted[1] : null;
  const thirdPlace = sorted.length > 2 ? sorted[2] : null;

  useEffect(() => {
    const confettiTimer = setTimeout(() => {
      if (isFinale) {
        const end = Date.now() + 8000;
        const frame = () => {
          confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#FFD700', '#3776AB', '#FFD43B'] });
          confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#FFD700', '#3776AB', '#FFD43B'] });
          if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame();
      } else {
        const duration = 3000;
        const end = Date.now() + duration;
        const frame = () => {
          confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#FFD700', '#3776AB', '#FFD43B'] });
          confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#FFD700', '#3776AB', '#FFD43B'] });
          if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame();
      }
    }, 3500);

    const buttonTimer = setTimeout(() => {
      setShowButtons(true);
    }, isFinale ? 8000 : 7000);

    return () => {
      clearTimeout(confettiTimer);
      clearTimeout(buttonTimer);
    };
  }, [isFinale]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  const trophyVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { type: "spring", bounce: 0.5, delay: 0.5 }
    }
  };

  return (
    <motion.div 
      className={`podium-overlay ${isFinale ? 'podium-finale' : ''}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="podium-bg-glow" />

      <div className="podium-header">
        <motion.h1 
          className="podium-title"
          initial={{ scale: 0.9, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
        >
          {isFinale ? 'Quiz Champion' : `Round ${roundNumber} Complete`}
        </motion.h1>
      </div>
      
      {isFinale && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', background: 'radial-gradient(circle at top, rgba(255, 215, 0, 0.15) 0%, transparent 60%)' }}
        />
      )}

      {isFinale ? (
        <div className="podium-stage">
          {/* 2nd Place */}
          {secondPlace && (
            <div className="podium-column">
              <motion.div 
                className="team-card"
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 2.2, duration: 0.8, ease: "easeOut" }}
              >
                <motion.div 
                  className="team-medal"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 2.5, type: "spring", bounce: 0.5 }}
                >
                  <Medal size={36} color="#94A3B8" />
                </motion.div>
                {isTie1 && <span className="tie-badge">Tie for 1st</span>}
                <div className="team-name">{secondPlace.name}</div>
                <div className="team-score">
                  <Counter from={0} to={secondPlace.score} delay={2.8} />
                </div>
              </motion.div>

              <motion.div 
                className="podium-block podium-block-2"
                initial={{ height: 0 }}
                animate={{ height: 160 }}
                transition={{ delay: 1.5, duration: 1, ease: "easeOut" }}
              >
                <span className="podium-rank-text">2</span>
              </motion.div>
            </div>
          )}

          {/* 1st Place */}
          {firstPlace && (
            <div className="podium-column" style={{ zIndex: 10 }}>
              <motion.div 
                className="team-card"
                style={{ padding: '3rem 2rem 2rem', transform: 'translateY(-20px)' }}
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: -20, opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.8, ease: "easeOut" }}
              >
                <motion.div 
                  className="team-medal"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 2.1, type: "spring", bounce: 0.5 }}
                >
                  <Trophy size={48} color="#FBBF24" />
                </motion.div>
                {isTie1 && <span className="tie-badge">Tie for 1st</span>}
                <div className="team-name" style={{ fontSize: '2rem' }}>{firstPlace.name}</div>
                <div className="team-score" style={{ fontSize: '3.5rem' }}>
                  <Counter from={0} to={firstPlace.score} delay={2.4} />
                </div>
              </motion.div>

              <motion.div 
                className="podium-block podium-block-1"
                initial={{ height: 0 }}
                animate={{ height: 240 }}
                transition={{ delay: 1, duration: 1, ease: "easeOut" }}
              >
                <span className="podium-rank-text">1</span>
              </motion.div>
            </div>
          )}

          {/* 3rd Place */}
          {thirdPlace && (
            <div className="podium-column">
              <motion.div 
                className="team-card"
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 2.5, duration: 0.8, ease: "easeOut" }}
              >
                <motion.div 
                  className="team-medal"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 2.8, type: "spring", bounce: 0.5 }}
                >
                  <Medal size={36} color="#D97706" />
                </motion.div>
                {isTie2 && <span className="tie-badge">Tie for 2nd</span>}
                <div className="team-name">{thirdPlace.name}</div>
                <div className="team-score">
                  <Counter from={0} to={thirdPlace.score} delay={3.1} />
                </div>
              </motion.div>

              <motion.div 
                className="podium-block podium-block-3"
                initial={{ height: 0 }}
                animate={{ height: 120 }}
                transition={{ delay: 1.8, duration: 1, ease: "easeOut" }}
              >
                <span className="podium-rank-text">3</span>
              </motion.div>
            </div>
          )}
        </div>
      ) : (
        <div className="round-winner-container">
          <motion.div 
            className="round-winner-card"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
          >
            <motion.div 
              variants={trophyVariants} 
              initial="hidden" 
              animate="visible"
            >
              <Trophy size={72} color="#FBBF24" style={{ filter: 'drop-shadow(0 4px 10px rgba(251, 191, 36, 0.4))' }} />
            </motion.div>
            <div className="round-winner-subtitle">🏆 Round Winner</div>
            
            {firstPlace && (
              <>
                <motion.div 
                  className="team-name" 
                  style={{ fontSize: '2.5rem', color: 'var(--primary-blue)' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5, duration: 0.8 }}
                >
                  {firstPlace.name}
                </motion.div>
                <motion.div 
                  className="team-score" 
                  style={{ fontSize: '4rem', marginTop: '1rem' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2 }}
                >
                  <Counter from={0} to={firstPlace.score} delay={2.5} />
                </motion.div>
              </>
            )}
          </motion.div>
        </div>
      )}

      {showButtons && (
        <motion.div 
          className="action-buttons"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {isFinale ? (
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '2.5rem', color: 'var(--primary-blue)', margin: 0 }}>🎉 Congratulations!</h2>
              <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', margin: '0.5rem 0 2rem 0' }}>Thank You for Participating</p>
              <button className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.25rem', background: 'var(--primary-yellow)', color: 'var(--text-main)', borderRadius: '99px', fontWeight: 700, boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} onClick={onFinish}>
                Start New Quiz
              </button>
            </div>
          ) : (
            <button className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.25rem', borderRadius: '99px', background: 'var(--primary-blue)', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', fontWeight: 700, border: 'none', color: 'white' }} onClick={onNext}>
              Continue to Round {roundNumber + 1}
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default PodiumCeremony;
