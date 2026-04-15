import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { TailSpin } from 'react-loader-spinner';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setErrors([]);
    
    try { 
        setIsSubmitting(true);
        const res = await fetch('/api/sign-up', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData)
        })

        const data = await res.json();

        if(!res.ok) {
            if(res.status === 400) {
                if(data.errors && data.errors.length !== 0) {
                    const errorMessages = data.errors.map(err => err.msg);
                    setErrors(errorMessages);
                }
                else if(data.message) {
                    setErrors([data.message]);
                }
            }
            else {
                setErrors(["Something went wrong. Please try again."]);
            }
        } else {
            // Success
            // Redirect to login page
            navigate('/login', {
                state: {successMessage: "Sign up successful! Please log in."}
            });
        }
    } catch(err) {
        console.error("Fetch error: ", err);
        setErrors(["Failed to connect to the server."])
    }
    finally {
      setIsSubmitting(false);
    }

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="bg-white w-full max-w-sm px-8 py-10 rounded-xl shadow-lg border border-gray-50">
        
        {/* Display errors if they exist */}
        {errors.length > 0 && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p  className='text-sm font-medium text-red-600 text-center mb-1 last:mb-0'>
                {errors[0]}
            </p>
          </div>
        )}

        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-1">Create an Account</h2>
        <p className="text-sm text-center text-gray-500 mb-8">Join us to get started.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="username" className="block text-sm font-medium text-gray-900 mb-2">Username</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              value={formData.username}
              onChange={handleChange}
              placeholder="John Doe" 
              required 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200"
            />
          </div>
          
          <div className="mb-5">
            <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com" 
              required 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••" 
              required 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200"
            />
          </div>
          
          <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-sm"
          >
              {isSubmitting && (
                  <TailSpin
                      visible={true}
                      height="20"
                      width="20"
                      color="#ffffff"
                      ariaLabel="tail-spin-loading"
                      radius="1"
                  />
              )}
              <span>{isSubmitting ? "Signing up..." : "Sign up"}</span>
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account? 
          <a href="/login" className="text-indigo-600 font-medium hover:underline">Log in</a>
        </div>
        
      </div>
    </div>
  );
};

export default SignupForm;