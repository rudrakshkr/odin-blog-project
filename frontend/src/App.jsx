import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import './index.css';
import { useState, useEffect } from 'react';
import LoginPage from './pages/Login';
import Profile from './pages/Profile';
import SignupForm from './pages/SignIn';
import ShowPost from './pages/ShowPost';

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
            element={user.auth ? <Navigate to="/profile" /> : <LoginPage setUser={setUser} />} 
          />
          
          {/* Public Route: Sign Up */}
          <Route 
            path="/sign-up" 
            element={user.auth ? <Navigate to="/profile" /> : <SignupForm />} 
          />

          {/* Protected Route: Blog posts  */}
          <Route 
            path="/blogs/:postSlug"
            element= { <ShowPost user={user} setUser={setUser}/> } 
          />

          {/* Protected Route: Profile */}
          <Route 
            path="/profile" 
            element={ <Profile user={user} setUser={setUser} />}  
          />

          {/* Catch-all: Redirects unknown URL's*/} 
          <Route 
            path="*" 
            element={ <Navigate to={"/profile"} /> } 
          />

        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;