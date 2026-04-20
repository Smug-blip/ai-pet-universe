import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  email: string;
  username: string;
}

interface Companion {
  id: number;
  name: string;
  species: string;
  level: number;
  experience: number;
  created_at: string;
}

interface DashboardProps {
  user: User;
  token: string;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, token, onLogout }) => {
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanions();
  }, []);

  const fetchCompanions = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/companions/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCompanions(data.companions);
      }
    } catch (err) {
      setError('Failed to load companions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompanion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/companions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ owner_id: user.id, name, species }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add companion');
      }

      const data = await response.json();
      setCompanions([data.companion, ...companions]);
      setName('');
      setSpecies('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  if (loading) {
    return <div className="app-container"><h1>Loading...</h1></div>;
  }

  return (
    <div className="app-container">
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>🎮 Welcome, {user.username}!</h1>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>

        <div className="add-companion-section">
          <h2>Add a New Companion</h2>
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleAddCompanion}>
            <input
              type="text"
              placeholder="Companion Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={submitting}
            />
            
            <input
              type="text"
              placeholder="Species"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              required
              disabled={submitting}
            />
            
            <button type="submit" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Companion'}
            </button>
          </form>
        </div>

        <div className="companions-section">
          <h2>Your Companions ({companions.length})</h2>
          {companions.length === 0 ? (
            <p>No companions yet. Create your first one!</p>
          ) : (
            <div className="companions-grid">
              {companions.map((companion) => (
                <div key={companion.id} className="companion-card">
                  <h3>{companion.name}</h3>
                  <p>Species: {companion.species}</p>
                  <p>Level: {companion.level}</p>
                  <p>Experience: {companion.experience}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;