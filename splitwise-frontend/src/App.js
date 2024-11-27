import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// User Registration Component
function UserRegistration() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3005/user', { name, password });
      alert('User registered successfully');
    } catch (error) {
      console.error('Registration error', error);
    }
  };

  return (
    <div>
      <h2>User Registration</h2>
      <form onSubmit={handleRegister}>
        <input 
          type="text" 
          placeholder="Name" 
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

// Create Group Component
function CreateGroup() {
  const [title, setTitle] = useState('');
  const [members, setMembers] = useState('');

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const memberIds = members.split(',').map(id => id.trim());
      const response = await axios.post('http://localhost:3005/user/create-group', { 
        title, 
        members: memberIds 
      });
      alert('Group created successfully');
    } catch (error) {
      console.error('Group creation error', error);
    }
  };

  return (
    <div>
      <h2>Create Group</h2>
      <form onSubmit={handleCreateGroup}>
        <input 
          type="text" 
          placeholder="Group Title" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input 
          type="text" 
          placeholder="Member IDs (comma-separated)" 
          value={members}
          onChange={(e) => setMembers(e.target.value)}
        />
        <button type="submit">Create Group</button>
      </form>
    </div>
  );
}

// Join Group Component
function JoinGroup() {
  const [groupId, setGroupId] = useState('');
  const [userId, setUserId] = useState('');

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3005/user/join-group', { 
        groupId, 
        userId 
      });
      alert('Joined group successfully');
    } catch (error) {
      console.error('Join group error', error);
    }
  };

  return (
    <div>
      <h2>Join Group</h2>
      <form onSubmit={handleJoinGroup}>
        <input 
          type="text" 
          placeholder="Group ID" 
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
        />
        <input 
          type="text" 
          placeholder="User ID" 
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <button type="submit">Join Group</button>
      </form>
    </div>
  );
}

// Make Payment Component
function MakePayment() {
  const [groupId, setGroupId] = useState('');
  const [amount, setAmount] = useState('');
  const [userId, setUserId] = useState('');

  const handleMakePayment = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`http://localhost:3005/user/${groupId}/payment`, { 
        amount: parseFloat(amount),
        userId 
      });
      alert('Payment made successfully');
    } catch (error) {
      console.error('Payment error', error);
    }
  };

  return (
    <div>
      <h2>Make Payment</h2>
      <form onSubmit={handleMakePayment}>
        <input 
          type="text" 
          placeholder="Group ID" 
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
        />
        <input 
          type="number" 
          placeholder="Amount" 
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input 
          type="text" 
          placeholder="User ID" 
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <button type="submit">Make Payment</button>
      </form>
    </div>
  );
}

// Group Status Component
function GroupStatus() {
  const [userId, setUserId] = useState('');
  const [status, setStatus] = useState(null);

  const fetchGroupStatus = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`http://localhost:3005/user/group/status?userId=${userId}`);
      setStatus(response.data);
    } catch (error) {
      console.error('Status fetch error', error);
    }
  };

  return (
    <div>
      <h2>Group Status</h2>
      <form onSubmit={fetchGroupStatus}>
        <input 
          type="text" 
          placeholder="User ID" 
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <button type="submit">Get Status</button>
      </form>
      {status && (
        <div>
          <h3>Owe Details</h3>
          {status.map((item, index) => (
            <div key={index}>
              Group: {item.group}, Owe Amount: {item.amount}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Group Details Component
function GroupDetails() {
  const [groupId, setGroupId] = useState('');
  const [groupDetails, setGroupDetails] = useState(null);

  const fetchGroupDetails = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`http://localhost:3005/user/groups/${groupId}`);
      setGroupDetails(response.data);
    } catch (error) {
      console.error('Group details fetch error', error);
    }
  };

  return (
    <div>
      <h2>Group Details</h2>
      <form onSubmit={fetchGroupDetails}>
        <input 
          type="text" 
          placeholder="Group ID" 
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
        />
        <button type="submit">Get Details</button>
      </form>
      {groupDetails && (
        <div>
          <h3>Group: {groupDetails.title}</h3>
          <h4>Members:</h4>
          {groupDetails.members.map((member, index) => (
            <div key={index}>{member.name}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <div>
        <nav>
          <Link to="/register">Register</Link>
          <Link to="/create-group">Create Group</Link>
          <Link to="/join-group">Join Group</Link>
          <Link to="/payment">Make Payment</Link>
          <Link to="/status">Group Status</Link>
          <Link to="/group-details">Group Details</Link>
        </nav>

        <Routes>
          <Route path="/register" element={<UserRegistration />} />
          <Route path="/create-group" element={<CreateGroup />} />
          <Route path="/join-group" element={<JoinGroup />} />
          <Route path="/payment" element={<MakePayment />} />
          <Route path="/status" element={<GroupStatus />} />
          <Route path="/group-details" element={<GroupDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;