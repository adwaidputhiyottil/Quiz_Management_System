import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ProjectorScreen from './pages/ProjectorScreen';
import QuestionBank from './pages/QuestionBank';
import ControlCenter from './pages/ControlCenter';
import ManageTeams from './pages/ManageTeams';
import Settings from './pages/Settings';

function App() {
  return (
    <div className="app-container">
      {/* Background Animation */}
      <div className="particle-bg">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              width: `${Math.random() * 300 + 50}px`,
              height: `${Math.random() * 300 + 50}px`,
              left: `${Math.random() * 100}vw`,
              animationDuration: `${Math.random() * 20 + 10}s`,
              animationDelay: `-${Math.random() * 20}s`,
            }}
          />
        ))}
      </div>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projector" element={<ProjectorScreen />} />
        <Route path="/bank" element={<QuestionBank />} />
        <Route path="/control" element={<ControlCenter />} />
        <Route path="/teams" element={<ManageTeams />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </div>
  );
}

export default App;
