import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState('');
  const navigate = useNavigate();

  // get my groups from the backend
  async function loadGroups() {
    try {
      const response = await api.get('/groups');
      setGroups(response.data);
    } catch (error) {
      alert('Could not load groups');
    }
  }

  // run loadGroups once when the page opens
  useEffect(function () {
    loadGroups();
  }, []);

  // create a new group
  async function handleCreate() {
    try {
      await api.post('/groups', { name: groupName });
      setGroupName('');
      loadGroups();
    } catch (error) {
      alert('Could not create group');
    }
  }

  function handleLogout() {
  localStorage.removeItem('token');
  navigate('/');
}

  return (
    <div>
      <button onClick={handleLogout}>Logout</button>
      <h2>Your Groups</h2>

      {groups.map(function (group) {
        return (
          <div key={group._id}>
            <button onClick={() => navigate('/group/' + group._id)}>
              {group.name}
            </button>
          </div>
        );
      })}

      <h3>Create a group</h3>
      <input
        placeholder="Group name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />
      <button onClick={handleCreate}>Create</button>
    </div>
  );
}

export default Dashboard;