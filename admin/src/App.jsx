import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { useEffect, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';

import './index.css';

import LoginPage from './pages/Login';
import SignupForm from './pages/SignIn';

import Profile from './pages/Profile';
import NewPost from './pages/NewPost';
import Comments from './pages/Comments';

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

          {/* Public Route: Sign Up */}
          <Route 
            path="/sign-up" 
            element={
              user.auth ? <Navigate to="/profile" /> : <SignupForm />
            } 
          />

          {/* Protected Route: Profile */}
          <Route 
            path="/profile" 
            element={
              user.auth ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" />
            } 
          />
          
          {/* Protected Route: New Post */}
          <Route 
            path='/new-post'
            element={
              user.auth ? <NewPost user={user} setUser={setUser} /> : <Navigate to="/login" />
            }
          />
          
          {/* Protected Route: Comments */}
          <Route 
            path='/comments'
            element={
              user.auth ? <Comments user={user} /> : <Navigate to="/login" />
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