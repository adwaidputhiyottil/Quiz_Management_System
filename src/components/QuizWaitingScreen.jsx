import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hourglass } from 'lucide-react';
import './QuizWaitingScreen.css';

const PHRASES = [
  "Preparing Questions...",
  "Loading Challenge...",
  "Get Ready Teams...",
  "Stay Tuned...",
  "Almost Ready..."
];

const QuizWaitingScreen = ({ eventTitle, eventSubtitle }) => {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className="qw-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      {/* Background Floating Elements */}
      <div className="qw-background">
        <motion.div 
          className="qw-blob qw-blob-1"
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -40, 20, 0],
            scale: [1, 1.1, 0.9, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="qw-blob qw-blob-2"
          animate={{
            x: [0, -40, 20, 0],
            y: [0, 30, -30, 0],
            scale: [1, 1.2, 0.8, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <motion.div 
        className="qw-card"
        animate={{ 
          boxShadow: [
            '0 10px 30px rgba(0, 0, 0, 0.1), 0 0 0px rgba(55, 118, 171, 0)',
            '0 15px 40px rgba(0, 0, 0, 0.15), 0 0 30px rgba(55, 118, 171, 0.3)',
            '0 10px 30px rgba(0, 0, 0, 0.1), 0 0 0px rgba(55, 118, 171, 0)'
          ]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div 
          className="qw-icon-wrapper"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Hourglass size={64} className="qw-icon" />
        </motion.div>

        <h1 className="qw-title text-gradient">
          {eventTitle || 'QUIZ WILL START SOON'}
        </h1>
        
        <p className="qw-subtitle">
          {eventSubtitle || 'Get Ready! The Quiz Master is preparing the first question.'}
        </p>

        <div className="qw-phrase-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={phraseIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="qw-phrase"
            >
              {PHRASES[phraseIndex].replace('...', '')}
              <span className="qw-dots">
                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}>.</motion.span>
                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.25 }}>.</motion.span>
                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}>.</motion.span>
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QuizWaitingScreen;
