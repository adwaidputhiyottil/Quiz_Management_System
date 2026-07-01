import { Link } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { Settings, Users, Play, Database, Monitor, Moon, Sun } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { state, actions } = useQuiz();

  return (
    <div className="dashboard-container">
      <header className="dashboard-header glass-panel">
        <div className="header-left">
          <h1>Python Quizmaster Dashboard</h1>
        </div>
        <div className="header-right">
          <button className="btn btn-secondary" onClick={actions.toggleTheme}>
            {state.settings.theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <Link to="/projector" target="_blank" className="btn btn-secondary">
            <Monitor size={20} /> Open Projector Screen
          </Link>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-grid">
          {/* Active Quiz Controls */}
          <div className="dashboard-card glass-panel main-control">
            <h2>Active Quiz Control</h2>
            <p className="text-muted">Manage the live quiz session, control timer, and reveal answers.</p>
            <div className="card-actions">
              <Link to="/control" className="btn btn-primary btn-large">
                <Play size={24} /> Enter Control Center
              </Link>
            </div>
          </div>

          {/* Teams Setup */}
          <div className="dashboard-card glass-panel">
            <div className="card-header">
              <Users size={24} color="var(--emerald)" />
              <h2>Teams Setup</h2>
            </div>
            <p className="text-muted">{state.teams.length} Teams configured.</p>
            <div className="card-actions">
              <Link to="/teams" className="btn btn-secondary">Manage Teams</Link>
            </div>
          </div>

          {/* Question Bank */}
          <div className="dashboard-card glass-panel">
            <div className="card-header">
              <Database size={24} color="var(--primary-blue)" />
              <h2>Question Bank</h2>
            </div>
            <p className="text-muted">{state.questions.length} Questions available.</p>
            <div className="card-actions">
              <Link to="/bank" className="btn btn-secondary">Manage Questions</Link>
            </div>
          </div>

          {/* Event Settings */}
          <div className="dashboard-card glass-panel">
            <div className="card-header">
              <Settings size={24} color="var(--primary-yellow)" />
              <h2>Event Settings</h2>
            </div>
            <p className="text-muted">Configure rounds, timer defaults, and sounds.</p>
            <div className="card-actions">
              <Link to="/settings" className="btn btn-secondary">Settings</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
