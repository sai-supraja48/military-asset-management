import React from "react";
import { Link, NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, ArrowLeftRight, UserRoundCheck, PackageX, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const links = [
  ['/','Dashboard',LayoutDashboard],
  ['/purchases','Purchases',ShoppingCart],
  ['/transfers','Transfers',ArrowLeftRight],
  ['/assignments','Assignments',UserRoundCheck],
  ['/expenditures','Expenditures',PackageX]
];

export default function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-bold flex items-center gap-2"><ShieldCheck size={22}/> Asset Management</Link>
        <div className="flex items-center gap-4 text-sm">
          <span>{user?.username} · {user?.role}</span>
          <button onClick={logout} className="flex gap-1 items-center hover:text-slate-300"><LogOut size={16}/> Logout</button>
        </div>
      </header>
      <div className="flex">
        <aside className="w-60 min-h-[calc(100vh-64px)] bg-white border-r p-4">
          <nav className="space-y-1">
            {links.map(([to,label,Icon]) => (
              <NavLink key={to} to={to}
                className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded ${isActive?'bg-slate-900 text-white':'hover:bg-slate-100'}`}>
                <Icon size={18}/>{label}
              </NavLink>
            ))}
            {user?.role === 'ADMIN' && (
              <NavLink to="/audit" className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded ${isActive?'bg-slate-900 text-white':'hover:bg-slate-100'}`}>
                <ShieldCheck size={18}/> Audit Logs
              </NavLink>
            )}
          </nav>
        </aside>
        <main className="flex-1 p-6"><Outlet/></main>
      </div>
    </div>
  );
}
