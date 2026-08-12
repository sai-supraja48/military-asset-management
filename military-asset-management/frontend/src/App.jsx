import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OperationsPage from './pages/OperationsPage';
import AuditLogs from './pages/AuditLogs';

export default function App(){
  return <AuthProvider><BrowserRouter><Routes>
    <Route path="/login" element={<Login/>}/>
    <Route element={<ProtectedRoute><Layout/></ProtectedRoute>}>
      <Route path="/" element={<Dashboard/>}/>
      <Route path="/purchases" element={<OperationsPage type="purchases"/>}/>
      <Route path="/transfers" element={<OperationsPage type="transfers"/>}/>
      <Route path="/assignments" element={<OperationsPage type="assignments"/>}/>
      <Route path="/expenditures" element={<OperationsPage type="expenditures"/>}/>
      <Route path="/audit" element={<AuditLogs/>}/>
    </Route>
  </Routes></BrowserRouter></AuthProvider>
}
