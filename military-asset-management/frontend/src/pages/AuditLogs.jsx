import React from "react";
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function AuditLogs(){
  const [rows,setRows]=useState([]);
  useEffect(()=>{api.get('/audit-logs').then(r=>setRows(r.data))},[]);
  return <div><h1 className="text-2xl font-bold mb-1">Audit Logs</h1><p className="text-slate-500 mb-6">Central record of asset-changing operations.</p>
    <div className="bg-white rounded-xl shadow-sm overflow-auto"><table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className="p-3 text-left">Time</th><th className="p-3 text-left">User</th><th className="p-3 text-left">Action</th><th className="p-3 text-left">Details</th></tr></thead>
    <tbody>{rows.map(x=><tr key={x.id} className="border-t"><td className="p-3">{new Date(x.created_at).toLocaleString()}</td><td className="p-3">{x.username||'—'}</td><td className="p-3 font-semibold">{x.action}</td><td className="p-3">{x.details}</td></tr>)}</tbody></table></div>
  </div>
}
