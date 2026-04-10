import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import './index.css';
import { useState, useEffect } from 'react';
import LoginPage from './pages/Login';
import Profile from './pages/Profile';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('userData');
    if(savedUser) {
      return JSON.parse(savedUser);
    }
    return { auth: false, name: '' }
  });

  useEffect(() => {
    localStorage.setItem('userData', JSON.stringify(user));
  }, [user])

  return (
    <BrowserRouter>
      <div className='App'>
        <Routes>
          
          {/* Public Route: Login */}
          <Route 
            path="/login" 
            element={
              user.auth ? <Navigate to="/profile" /> : <LoginPage setUser={setUser} />
            } 
          />

          {/* Protected Route: Profile */}
          <Route 
            path="/profile" 
            element={
              user.auth ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" />
            } 
          />

          {/* Catch-all: Redirects any unknown URLs to the right place */}
          <Route 
            path="*" 
            element={<Navigate to={user.auth ? "/profile" : "/login"} />} 
          />

        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;