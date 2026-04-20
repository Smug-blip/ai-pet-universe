import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="app-container">
      <div className="home-page">
        <h1>🎮 Welcome to AI Pet Universe</h1>
        <p>Create and care for your AI-powered pet companions!</p>
        <button onClick={() => navigate('/login')}>Login</button>
        <button onClick={() => navigate('/register')}>Register</button>
      </div>
    </div>
  );
};

export default Home;