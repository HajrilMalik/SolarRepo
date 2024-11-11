import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, set } from 'firebase/database';   

import { firebaseConfig } from '../../firebase/firebase';
// Import stylesheet untuk styling

export function SignUp  ()  {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');   

  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    try {
      const auth = getAuth();
      await createUserWithEmailAndPassword(auth, email, password);

      const user = auth.currentUser;
      const uid = user.uid;

      const db = getDatabase();
      const userRef = ref(db, 'users/' + uid);

      await set(userRef, {
        email: user.email,
        displayName: 'Nama Pengguna',
        createdAt: new Date().toISOString()
      });

      setError('');
      // Redirect ke halaman lain atau tampilkan pesan sukses
      console.log('User added to database:', uid);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="signup-container">
      <h2>Daftar</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}   

        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}   

        />
        <input
          type="password"
          placeholder="Konfirmasi Password"
          value={confirmPassword}   

          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button type="submit">Daftar</button>
      </form>
    </div>
  );
};

export default SignUp;