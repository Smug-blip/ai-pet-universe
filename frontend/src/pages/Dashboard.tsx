import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Companion {
  id: string;
  name: string;
  species: string;
  level: number;
}

interface DashboardProps {
  user: any;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');

  useEffect(() => {
    const fetchCompanions = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/companions/${user.id}`);
        setCompanions(response.data.companions);
      } catch (error) {
        console.error('Failed to fetch companions:', error);
      }
    };
    
    fetchCompanions();
  }, [user.id]);

  const createCompanion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/companions', {
        owner_id: user.id,
        name,
        species
      });
      setCompanions([...companions, response.data.companion]);
      setName('');
      setSpecies('');
    } catch (error) {
      console.error('Failed to create companion:', error);
    }
  };

  return (
    <div className="dashboard">
      <h1>Welcome, {user.username}!</h1>
      
      <div className="create-companion">
        <h2>Create New Companion</h2>
        <form onSubmit={createCompanion}>
          <input
            type="text"
            placeholder="Companion Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Species"
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            required
          />
          <button type="submit">Create</button>
        </form>
      </div>

      <div className="companions">
        <h2>Your Companions</h2>
        {companions.length === 0 ? (
          <p>No companions yet. Create one!</p>
        ) : (
          companions.map((companion) => (
            <div key={companion.id} className="companion-card">
              <h3>{companion.name}</h3>
              <p>Species: {companion.species}</p>
              <p>Level: {companion.level}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;