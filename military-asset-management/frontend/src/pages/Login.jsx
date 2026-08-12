import React from "react";
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username,setUsername] = useState('admin_user');
  const [password,setPassword] = useState('AdminPass123!');
  const [error,setError] = useState('');

  if (user) return <Navigate to="/" replace/>;

  async function submit(e) {
    e.preventDefault();
    try {
      setError('');
      await login(username,password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <form onSubmit={submit} className="bg-white w-full max-w-md rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold">Military Asset Management</h1>
        <p className="text-slate-500 mt-1 mb-6">Secure operations dashboard</p>
        {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4">{error}</div>}
        <label className="block mb-4">Username<input value={username} onChange={e=>setUsername(e.target.value)} className="mt-1 w-full border rounded-lg p-2"/></label>
        <label className="block mb-6">Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full border rounded-lg p-2"/></label>
        <button className="w-full bg-slate-900 text-white rounded-lg py-3 font-semibold">Sign in</button>
        <div className="text-xs text-slate-500 mt-5 space-y-1">
          <div>Admin: admin_user / AdminPass123!</div>
          <div>Commander: commander_alpha / CommandPass123!</div>
          <div>Logistics: logistics_officer / LogisticsPass123!</div>
        </div>
      </form>
    </div>
  );
}
