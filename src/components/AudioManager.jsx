import React, { useEffect, useRef } from 'react';
import { useQuiz } from '../context/QuizContext';

// --- Web Audio API Engine ---
let audioCtx = null;
let bgmNodes = [];
let masterVolume = 0.5;
let isMuted = false;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

const playTone = (freq, type = 'sine', duration = 0.5, volModifier = 1.0) => {
  if (isMuted || !audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  
  // Envelope
  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(masterVolume * volModifier, audioCtx.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
};

// Sound Effects Library
const sfx = {
  quizStart: () => {
    [261.63, 329.63, 392.00, 523.25].forEach((freq, i) => {
      setTimeout(() => playTone(freq, 'triangle', 2, 0.4), i * 50);
    });
  },
  reveal: () => {
    playTone(523.25, 'sine', 0.2, 0.3); // Soft pop (C5)
    setTimeout(() => playTone(659.25, 'sine', 0.4, 0.3), 100); // E5
  },
  awardPoints: () => {
    // Sparkling arpeggio (C Major)
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      setTimeout(() => playTone(freq, 'sine', 0.8, 0.2), i * 80);
    });
  },
  roundWinner: () => {
    // Celebratory brass/bell feel (F Major chord)
    [349.23, 440.00, 523.25, 698.46].forEach(freq => {
      playTone(freq, 'square', 1.5, 0.15);
      playTone(freq, 'sine', 2.0, 0.3);
    });
  },
  champion: () => {
    // Grand finale
    sfx.roundWinner();
    setTimeout(() => {
      [392.00, 493.88, 587.33, 783.99].forEach(freq => {
        playTone(freq, 'square', 2.5, 0.15);
        playTone(freq, 'sine', 3.0, 0.3);
      });
    }, 800);
  },
  countdown: () => {
    // Low, gentle pulse
    playTone(220.00, 'sine', 0.3, 0.2);
  }
};

const startBGM = () => {
  if (isMuted) return;
  initAudio();
  if (bgmNodes.length > 0) return; // Already playing

  const baseFreq = 196.00; // G3
  // Open, modern, calming chord (G add9)
  const frequencies = [baseFreq, baseFreq * 1.5, baseFreq * 2, baseFreq * 2.25]; 
  
  const masterGain = audioCtx.createGain();
  // Very low volume for non-distracting background
  masterGain.gain.value = masterVolume * 0.05;
  masterGain.connect(audioCtx.destination);
  
  frequencies.forEach(freq => {
    const osc = audioCtx.createOscillator();
    const lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    
    osc.type = 'triangle'; // Warm tone
    osc.frequency.value = freq;
    
    // Slow LFO for organic movement
    lfo.type = 'sine';
    lfo.frequency.value = 0.05 + Math.random() * 0.1; 
    lfoGain.gain.value = 8;
    
    filter.type = 'lowpass';
    filter.frequency.value = 600; 
    
    lfo.connect(lfoGain);
    lfoGain.connect(osc.detune);
    
    osc.connect(filter);
    filter.connect(masterGain);
    
    osc.start();
    lfo.start();
    
    bgmNodes.push({ osc, lfo, gain: masterGain });
  });
};

const stopBGM = () => {
  bgmNodes.forEach(({ osc, lfo }) => {
    osc.stop();
    lfo.stop();
  });
  bgmNodes = [];
};

const updateVolume = (vol) => {
  masterVolume = vol / 100;
  bgmNodes.forEach(node => {
    if (node.gain) {
      node.gain.gain.setTargetAtTime(masterVolume * 0.05, audioCtx?.currentTime || 0, 0.1);
    }
  });
};

// --- React Component (The Observer) ---
const AudioManager = () => {
  const { state } = useQuiz();
  const prev = useRef({ ...state });

  // Handle global audio settings
  useEffect(() => {
    isMuted = !state.settings.soundEnabled;
    updateVolume(state.settings.soundVolume);
    
    if (isMuted) {
      stopBGM();
    }
  }, [state.settings.soundEnabled, state.settings.soundVolume]);

  // Handle Quiz Events
  useEffect(() => {
    const current = state.currentQuiz;
    const previous = prev.current.currentQuiz;

    // Ensure audio context is ready on first user interaction via the toggle
    if (state.settings.soundEnabled && !isMuted) {
        initAudio();
    }

    if (!state.settings.soundEnabled) {
        prev.current = state;
        return;
    }

    // Event: Quiz Started
    if (!previous.isActive && current.isActive) {
      sfx.quizStart();
      startBGM();
    }

    // Event: Quiz Stopped/Finished
    if (previous.isActive && !current.isActive) {
      stopBGM();
    }

    // Event: Reveal Answer
    if (previous.questionState !== 'revealed' && current.questionState === 'revealed') {
      sfx.reveal();
    }

    // Event: Round Winner
    if (previous.questionState !== 'round_winner' && current.questionState === 'round_winner') {
      sfx.roundWinner();
    }

    // Event: Quiz Champion
    if (previous.questionState !== 'quiz_champion' && current.questionState === 'quiz_champion') {
      stopBGM();
      sfx.champion();
    }

    // Event: Points Awarded
    if (previous.awardedPoints !== current.awardedPoints && current.awardedPoints !== 0) {
      sfx.awardPoints();
    }

    // Event: Countdown Timer Ending (<= 5 seconds left)
    if (current.timer.status === 'running' && current.timer.remaining <= 5 && current.timer.remaining > 0) {
      // Only play once per second change
      if (previous.timer.remaining !== current.timer.remaining) {
        sfx.countdown();
      }
    }

    // Update reference for next cycle
    prev.current = state;
  }, [state]);

  // Global Button Click Sound
  useEffect(() => {
    if (!state.settings.soundEnabled) return;
    
    const handleGlobalClick = (e) => {
      const target = e.target.closest('button, .btn, [role="button"]');
      if (target) {
        initAudio();
        if (isMuted || !audioCtx) return;
        
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.05);
        
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(masterVolume * 0.1, audioCtx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [state.settings.soundEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopBGM();
  }, []);

  return null; // Invisible component
};

export default AudioManager;
