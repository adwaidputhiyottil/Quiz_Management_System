import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Users, Plus, Minus, Edit2, Trash2, 
  ChevronUp, ChevronDown, Shuffle, RotateCcw, X 
} from 'lucide-react';
import { useQuiz } from '../context/QuizContext';
import './ManageTeams.css';

const TeamModal = ({ isOpen, onClose, onSave, editingTeam, existingTeams }) => {
  const [name, setName] = useState(editingTeam ? editingTeam.name : '');
  const [color, setColor] = useState(editingTeam ? editingTeam.color : '#3776AB');
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setName(editingTeam ? editingTeam.name : '');
      setColor(editingTeam ? editingTeam.color : '#3776AB');
      setError('');
    }
  }, [isOpen, editingTeam]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Team name cannot be empty.');
      return;
    }
    const isDuplicate = existingTeams.some(
      t => t.name.toLowerCase() === trimmedName.toLowerCase() && t.id !== editingTeam?.id
    );
    if (isDuplicate) {
      setError('A team with this name already exists.');
      return;
    }
    onSave({ name: trimmedName, color });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{editingTeam ? 'Edit Team' : 'Add New Team'}</h2>
          <button className="btn-icon-small" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Team Name</label>
            <input 
              type="text" 
              className="form-input" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Team Alpha"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Team Color</label>
            <div className="color-picker-container">
              <input 
                type="color" 
                className="color-picker-input" 
                value={color} 
                onChange={(e) => setColor(e.target.value)}
              />
              <span className="text-muted">{color.toUpperCase()}</span>
            </div>
          </div>
          {error && <span className="error-message">{error}</span>}
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {editingTeam ? 'Save Changes' : 'Add Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ManageTeams = () => {
  const { state, actions } = useQuiz();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);

  const handleAddClick = () => {
    setEditingTeam(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (team) => {
    setEditingTeam(team);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (teamId, teamName) => {
    if (window.confirm(`Are you sure you want to delete ${teamName}?`)) {
      actions.removeTeam(teamId);
    }
  };

  const handleSaveTeam = (teamData) => {
    if (editingTeam) {
      actions.updateTeam(editingTeam.id, teamData);
    } else {
      actions.addTeam(teamData);
    }
  };

  const handleResetScores = () => {
    if (window.confirm('Are you sure you want to reset all scores to zero?')) {
      actions.resetScores();
    }
  };

  return (
    <div className="page-container manage-teams-page">
      <header className="dashboard-header glass-panel">
        <div className="header-left">
          <Link to="/" className="btn btn-secondary">
            <ArrowLeft size={20} /> Back to Dashboard
          </Link>
          <h1>Manage Teams</h1>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-card glass-panel">
          <div className="teams-header-actions">
            <div className="teams-count">
              <Users size={24} color="var(--emerald)" />
              {state.teams.length} Team{state.teams.length !== 1 && 's'}
            </div>
            
            <div className="teams-actions-group">
              <button className="btn btn-secondary" onClick={actions.shuffleTeams} disabled={state.teams.length < 2}>
                <Shuffle size={18} /> Randomize
              </button>
              <button className="btn btn-secondary" onClick={handleResetScores} disabled={state.teams.length === 0}>
                <RotateCcw size={18} /> Reset Scores
              </button>
              <button className="btn btn-primary" onClick={handleAddClick}>
                <Plus size={18} /> Add Team
              </button>
            </div>
          </div>

          {state.teams.length === 0 ? (
            <div className="empty-state">
              <Users size={64} />
              <h3>No Teams Configured</h3>
              <p>Add your first team to get started.</p>
              <button className="btn btn-primary" onClick={handleAddClick}>
                <Plus size={18} /> Add First Team
              </button>
            </div>
          ) : (
            <div className="teams-list">
              {state.teams.map((team, index) => (
                <div key={team.id} className="team-item">
                  
                  <div className="team-info">
                    <div className="order-controls">
                      <button 
                        className="btn-icon-small" 
                        onClick={() => actions.reorderTeam(team.id, 'up')}
                        disabled={index === 0}
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button 
                        className="btn-icon-small" 
                        onClick={() => actions.reorderTeam(team.id, 'down')}
                        disabled={index === state.teams.length - 1}
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>
                    
                    <div className="team-color-badge" style={{ backgroundColor: team.color }}></div>
                    <span className="team-name">{team.name}</span>
                  </div>

                  <div className="team-score-controls">
                    <button className="btn-icon-small" onClick={() => actions.updateScore(team.id, -1)}><Minus size={16} /></button>
                    <span className="score-display">{team.score}</span>
                    <button className="btn-icon-small" onClick={() => actions.updateScore(team.id, 1)}><Plus size={16} /></button>
                  </div>

                  <div className="team-item-actions">
                    <button className="btn-icon" onClick={() => handleEditClick(team)} title="Edit">
                      <Edit2 size={18} />
                    </button>
                    <button className="btn-icon danger" onClick={() => handleDeleteClick(team.id, team.name)} title="Delete">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <TeamModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTeam}
        editingTeam={editingTeam}
        existingTeams={state.teams}
      />
    </div>
  );
};

export default ManageTeams;
