// src/pages/auth/Login.jsx
import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Typography } from "@material-tailwind/react";

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard"); // Arahkan ke dashboard setelah login berhasil
    } catch (error) {
      alert("Login gagal: " + error.message);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded shadow-md">
        <Typography variant="h4" className="mb-4 text-center">Login</Typography>
        <form onSubmit={handleLogin}>
          <Input
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-4"
          />
          <Button type="submit" className="mt-6 w-full bg-blue-500">Login</Button>
        </form>
      </div>
    </div>
  );
}

export default Login;
