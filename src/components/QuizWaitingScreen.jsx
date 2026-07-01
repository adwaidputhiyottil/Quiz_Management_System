import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './QuizWaitingScreen.css';

const PHRASES = [
  'Preparing Questions...',
  'Loading Challenge...',
  'Get Ready Teams...',
  'Stay Tuned...',
  'Almost Ready...'
];

const KEYWORDS = ['def', 'class', 'lambda', 'import', 'print()', 'return', 'for', 'while', 'True', 'False', 'None'];
const TERMINAL_LINES = [
  '>>> print("Welcome to the Python Quiz Competition!")',
  'Loading Quiz...'
];

const QuizWaitingScreen = ({ eventTitle, eventSubtitle }) => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [terminalLineIndex, setTerminalLineIndex] = useState(0);
  const [terminalText, setTerminalText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const currentLine = TERMINAL_LINES[terminalLineIndex];

    if (isTyping) {
      if (terminalText.length < currentLine.length) {
        const timeout = setTimeout(() => {
          setTerminalText(currentLine.slice(0, terminalText.length + 1));
        }, 45);
        return () => clearTimeout(timeout);
      }

      const timeout = setTimeout(() => {
        setIsTyping(false);
      }, 1200);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(() => {
      setTerminalLineIndex((prev) => (prev + 1) % TERMINAL_LINES.length);
      setTerminalText('');
      setIsTyping(true);
    }, 1200);

    return () => clearTimeout(timeout);
  }, [isTyping, terminalLineIndex, terminalText]);

  return (
    <motion.div
      className="qw-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35 } }}
    >
      <div className="qw-background" aria-hidden="true">
        <div className="qw-grid" />
        {KEYWORDS.map((word, index) => (
          <motion.span
            key={`${word}-${index}`}
            className={`qw-keyword qw-keyword-${index % 4}`}
            animate={{
              x: [0, 18, -12, 0],
              y: [0, -22, 16, 0],
              opacity: [0.28, 0.7, 0.28],
              rotate: [0, 3, -3, 0]
            }}
            transition={{ duration: 10 + index * 0.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            {word}
          </motion.span>
        ))}
        {Array.from({ length: 16 }).map((_, index) => (
          <motion.span
            key={`particle-${index}`}
            className="qw-particle"
            animate={{
              y: [0, -20, 0],
              x: [0, 12, -8, 0],
              opacity: [0.18, 0.6, 0.18]
            }}
            transition={{ duration: 6 + index * 0.3, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              top: `${8 + (index % 8) * 10}%`,
              left: `${8 + (index * 7) % 84}%`
            }}
          />
        ))}
      </div>

      <motion.div
        className="qw-card"
        animate={{
          boxShadow: [
            '0 12px 30px rgba(2, 6, 23, 0.12), 0 0 0 rgba(55, 118, 171, 0)',
            '0 18px 45px rgba(2, 6, 23, 0.18), 0 0 24px rgba(55, 118, 171, 0.16)',
            '0 12px 30px rgba(2, 6, 23, 0.12), 0 0 0 rgba(55, 118, 171, 0)'
          ]
        }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.div
          className="qw-icon-wrapper"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="qw-python-icon">🐍</span>
        </motion.div>

        <div className="qw-event-title">{eventTitle || 'Python Quiz Competition'}</div>
        <p className="qw-event-subtitle">{eventSubtitle || 'Waiting for the Quizmaster to Start the Quiz'}</p>

        <h1 className="qw-title text-gradient">Quiz Will Start Soon...</h1>

        <p className="qw-waiting-subtitle">Waiting for the Quizmaster...</p>

        <div className="qw-phrase-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={phraseIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45 }}
              className="qw-phrase"
            >
              {PHRASES[phraseIndex].replace('...', '')}
              <span className="qw-dots" aria-hidden="true">
                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}>●</motion.span>
                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}>●</motion.span>
                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}>●</motion.span>
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="qw-loader" aria-label="Loading" role="status">
          <motion.span className="qw-loader-dot" animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} />
          <motion.span className="qw-loader-dot" animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0.18 }} />
          <motion.span className="qw-loader-dot" animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0.36 }} />
          <motion.span className="qw-loader-dot" animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0.54 }} />
        </div>

        <div className="qw-terminal-card">
          <div className="qw-terminal-bar">
            <span className="qw-terminal-dot qw-dot-red" />
            <span className="qw-terminal-dot qw-dot-yellow" />
            <span className="qw-terminal-dot qw-dot-green" />
          </div>
          <div className="qw-terminal-body">
            <span className="qw-terminal-text">{terminalText}</span>
            <motion.span
              className="qw-cursor"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.9, repeat: Infinity }}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QuizWaitingScreen;
