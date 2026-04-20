import React from 'react';
import { Link } from 'react-router-dom';

interface HomeProps {
  user: any;
}

const Home: React.FC<HomeProps> = ({ user }) => {
  return (
    <div className="home">
      <h1>Welcome to AI Pet Universe</h1>
      <p>Create and manage your AI-powered pet companions!</p>
      
      {user ? (
        <Link to="/dashboard">Go to Dashboard</Link>
      ) : (
        <div>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      )}
    </div>
  );
};

export default Home;