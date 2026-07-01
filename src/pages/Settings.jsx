import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Settings as SettingsIcon, Download, Upload, RotateCcw, AlertTriangle } from 'lucide-react';
import { useQuiz } from '../context/QuizContext';
import './Settings.css';

const Settings = () => {
  const { state, actions } = useQuiz();
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let parsedValue = type === 'checkbox' ? checked : value;
    
    if (type === 'number') {
      parsedValue = parsedValue === '' ? '' : Number(parsedValue);
    }

    actions.updateSettings({ [name]: parsedValue });
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quiz_event_full.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported && imported.settings && imported.teams) {
          actions.replaceState(imported);
          alert('Event imported successfully!');
        } else {
          alert('Invalid event JSON structure.');
        }
      } catch (err) {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const handleResetScores = () => {
    if (window.confirm('Are you sure you want to reset all scores?')) {
      actions.resetScores();
    }
  };

  const handleResetEvent = () => {
    if (window.confirm('WARNING: This will erase all teams, questions, and settings. Are you absolutely sure?')) {
      actions.resetEvent();
    }
  };

  return (
    <div className="page-container settings-page">
      <header className="dashboard-header glass-panel">
        <div className="header-left">
          <Link to="/" className="btn btn-secondary">
            <ArrowLeft size={20} /> Back to Dashboard
          </Link>
          <h1>Settings</h1>
        </div>
      </header>
      
      <main className="dashboard-main">
        <div className="settings-grid">
          {/* GENERAL */}
          <div className="settings-section">
            <h3>General Configuration</h3>
            <div className="settings-group">
              <label>Event Title</label>
              <input type="text" name="eventTitle" className="settings-input" value={state.settings.eventTitle || ''} onChange={handleChange} />
            </div>
            <div className="settings-group">
              <label>Event Subtitle</label>
              <input type="text" name="eventSubtitle" className="settings-input" value={state.settings.eventSubtitle || ''} onChange={handleChange} />
            </div>
            <div className="settings-group">
              <label>Organizer Name</label>
              <input type="text" name="organizerName" className="settings-input" value={state.settings.organizerName || ''} onChange={handleChange} />
            </div>
          </div>

          {/* QUIZ */}
          <div className="settings-section">
            <h3>Quiz Structure</h3>
            <div className="settings-group">
              <label>Number of Rounds</label>
              <input type="number" min="1" name="roundsCount" className="settings-input" value={state.settings.roundsCount || 1} onChange={handleChange} />
            </div>
            <div className="settings-group">
              <label>Questions Per Round</label>
              <input type="number" min="1" name="questionsPerRound" className="settings-input" value={state.settings.questionsPerRound || 10} onChange={handleChange} />
            </div>
          </div>

          {/* TIMER */}
          <div className="settings-section">
            <h3>Timer Configuration</h3>
            <label className="settings-toggle">
              <input type="checkbox" name="timerEnabled" checked={state.settings.timerEnabled || false} onChange={handleChange} />
              Enable Timer
            </label>
            {state.settings.timerEnabled && (
              <div className="settings-group" style={{ marginTop: '0.5rem' }}>
                <label>Timer Duration</label>
                <select name="timerDuration" className="settings-select" value={state.settings.timerDuration || 30} onChange={handleChange}>
                  <option value={15}>15 Seconds</option>
                  <option value={30}>30 Seconds</option>
                  <option value={45}>45 Seconds</option>
                  <option value={60}>60 Seconds</option>
                  <option value={90}>90 Seconds</option>
                  <option value={120}>120 Seconds</option>
                </select>
              </div>
            )}
          </div>

          {/* SCORING */}
          <div className="settings-section">
            <h3>Scoring Rules</h3>
            <div className="settings-group">
              <label>Default Points (Correct)</label>
              <input type="number" min="1" name="defaultPoints" className="settings-input" value={state.settings.defaultPoints || 10} onChange={handleChange} />
            </div>
            <div className="settings-group">
              <label>Negative Points (Incorrect)</label>
              <input type="number" min="0" name="negativePoints" className="settings-input" value={state.settings.negativePoints || 0} onChange={handleChange} />
            </div>
            <label className="settings-toggle" style={{ marginTop: '0.5rem' }}>
              <input type="checkbox" name="allowManualScoring" checked={state.settings.allowManualScoring || false} onChange={handleChange} />
              Allow Manual Editing in Live Quiz
            </label>
          </div>

          {/* SOUNDS & THEME */}
          <div className="settings-section">
            <h3>Appearance & Audio</h3>
            <label className="settings-toggle">
              <input type="checkbox" name="soundEnabled" checked={state.settings.soundEnabled || false} onChange={handleChange} />
              Enable Sounds
            </label>
            {state.settings.soundEnabled && (
              <div className="settings-group" style={{ marginTop: '0.5rem' }}>
                <label>Volume: {state.settings.soundVolume || 50}%</label>
                <input type="range" min="0" max="100" name="soundVolume" value={state.settings.soundVolume || 50} onChange={handleChange} />
              </div>
            )}
            
            <div className="settings-group" style={{ marginTop: '1rem' }}>
              <label>UI Theme</label>
              <select name="theme" className="settings-select" value={state.settings.theme || 'light'} onChange={handleChange}>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System (Auto)</option>
              </select>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="settings-actions-section glass-panel settings-section">
            <h3 style={{ color: 'var(--text-main)', borderBottom: 'none' }}>Event Actions</h3>
            <div className="actions-row">
              <input type="file" accept=".json" ref={fileInputRef} className="hidden-file-input" onChange={handleImportJSON} />
              
              <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
                <Upload size={18} /> Import Event JSON
              </button>
              
              <button className="btn btn-secondary" onClick={handleExportJSON}>
                <Download size={18} /> Export Event JSON
              </button>
              
              <button className="btn btn-secondary" onClick={handleResetScores}>
                <RotateCcw size={18} /> Reset All Scores
              </button>
              
              <button className="btn btn-danger" onClick={handleResetEvent}>
                <AlertTriangle size={18} /> Complete Factory Reset
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Settings;
