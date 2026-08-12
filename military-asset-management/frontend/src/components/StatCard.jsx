import React from "react";

const accents = {
  slate: 'border-slate-600',
  emerald: 'border-emerald-600',
  amber: 'border-amber-600',
  red: 'border-red-600',
  blue: 'border-blue-600'
};

export default function StatCard({ title, value, onClick, accent='slate' }) {
  return (
    <button
      onClick={onClick}
      className={`text-left bg-white p-5 rounded-xl shadow-sm border-l-4 ${accents[accent] || accents.slate} ${onClick?'hover:bg-slate-50 cursor-pointer':''}`}
    >
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-3xl font-bold mt-1">{Number(value || 0).toLocaleString()}</p>
    </button>
  );
}
