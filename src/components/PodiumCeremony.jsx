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
      <div className="podium-header">
        <motion.div variants={trophyVariants} initial="hidden" animate="visible">
          <Trophy size={80} color="#FFD700" style={{ filter: 'drop-shadow(0 4px 10px rgba(255, 215, 0, 0.4))' }} />
        </motion.div>
        
        <motion.h1 
          className="podium-title"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
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

      <div className="podium-stage">
        {/* 2nd Place */}
        {secondPlace && (
          <div className="podium-column">
            <motion.div 
              className="team-card"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 2.8, type: "spring", bounce: 0.4 }}
            >
              <motion.div 
                className="team-medal"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 3.2 }}
              >
                <Medal size={32} color="#C0C0C0" />
              </motion.div>
              {isTie1 && <span className="tie-badge">Tie for 1st</span>}
              <div className="team-color-indicator" style={{ background: secondPlace.color }} />
              <div className="team-name">{secondPlace.name}</div>
              <div className="team-score">
                <Counter from={0} to={secondPlace.score} delay={3.5} />
              </div>
            </motion.div>

            <motion.div 
              className="podium-block podium-block-2"
              initial={{ height: 0 }}
              animate={{ height: 180 }}
              transition={{ delay: 2.2, duration: 0.8, ease: "easeOut" }}
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
              style={{ padding: '2rem' }}
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 2.5, type: "spring", bounce: 0.4 }}
            >
              <motion.div 
                className="team-medal"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 3 }}
              >
                <Trophy size={48} color="#FFD700" />
              </motion.div>
              {isTie1 && <span className="tie-badge">Tie for 1st</span>}
              <div className="team-color-indicator" style={{ background: firstPlace.color, width: '32px', height: '32px' }} />
              <div className="team-name" style={{ fontSize: '2rem' }}>{firstPlace.name}</div>
              <div className="team-score" style={{ fontSize: '2.5rem' }}>
                <Counter from={0} to={firstPlace.score} delay={3.5} />
              </div>
            </motion.div>

            <motion.div 
              className="podium-block podium-block-1"
              initial={{ height: 0 }}
              animate={{ height: 250 }}
              transition={{ delay: 1.5, duration: 1, ease: "easeOut" }}
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
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 3.1, type: "spring", bounce: 0.4 }}
            >
              <motion.div 
                className="team-medal"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 3.4 }}
              >
                <Medal size={32} color="#CD7F32" />
              </motion.div>
              {isTie2 && <span className="tie-badge">Tie for 2nd</span>}
              <div className="team-color-indicator" style={{ background: thirdPlace.color }} />
              <div className="team-name">{thirdPlace.name}</div>
              <div className="team-score">
                <Counter from={0} to={thirdPlace.score} delay={3.5} />
              </div>
            </motion.div>

            <motion.div 
              className="podium-block podium-block-3"
              initial={{ height: 0 }}
              animate={{ height: 130 }}
              transition={{ delay: 2.5, duration: 0.6, ease: "easeOut" }}
            >
              <span className="podium-rank-text">3</span>
            </motion.div>
          </div>
        )}
      </div>

      {showButtons && (
        <motion.div 
          className="action-buttons"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {isFinale ? (
            <>
              <h2 style={{ fontSize: '2.5rem', color: '#FFD700', margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>🎉 Congratulations!</h2>
              <p style={{ fontSize: '1.5rem', color: 'white', margin: '0 0 1rem 0' }}>🙏 Thank You for Participating</p>
              <button className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.25rem', background: 'var(--primary-yellow)', color: 'black' }} onClick={onFinish}>
                🔄 Start New Quiz
              </button>
            </>
          ) : (
            <button className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.25rem' }} onClick={onNext}>
              Continue to Next Round
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default PodiumCeremony;
