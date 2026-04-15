import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Link } from "react-router"
import { TailSpin } from "react-loader-spinner"
import { useLocation, useNavigate } from "react-router"

export function LoginForm({ className, setUser, ...props }) {
  const API_URL = import.meta.env.VITE_API_BASE_URL || "";

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors('');
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password })
      });

      // Parse the json response
      const data = await res.json(); 

      if (!res.ok) {
        if (res.status === 401) setErrors('Invalid credentials');
        else setErrors(data.message || 'Please try again.');
      } else {
        // If user not admin 
        if(data.role !== "ADMIN") {
          setErrors("Access denied. Admin previleges required.");
          return;
        }

        // If they admin, let them in
        localStorage.setItem('jwtToken', data.token);
        if (setUser) {
          setUser({ auth: true, name: data.username, role: data.role });
        }
        setTimeout(() => {
          navigate('/profile', { 
            state: { successMessage: 'You successfully logged in as an Admin!' }
          });
        }, 10);
      }
    } catch (err) {
      setErrors('Network error. Is the backend running?');
    }
    finally {
      setIsSubmitting(false);
    }
  }

  const location = useLocation();

  const successMessage = location.state?.successMessage;

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your username below to login to your account
          </p>
          {/* Display errors if they exist */}
          {errors && <p className="text-sm font-medium text-destructive">{errors}</p>}

          {/* Display the success message if successful sign in */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm text-center font-medium">
              {successMessage}
            </div>
          )}
        </div>
        
        <Field>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <Input
            id="username"
            type="text"
            placeholder="user"
            required
            className="bg-background" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
          />
        </Field>
        
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
          </div>
          <Input 
            id="password" 
            type="password" 
            required 
            className="bg-background" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
          />
        </Field>
        
        <Field>
          <Button type="submit" disabled={isSubmitting} className="w-full">
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
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </Field>
        
        <Field>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <Link to="/sign-up" className="underline underline-offset-4">
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}