import React from "react";
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [metrics,setMetrics] = useState({});
  const [stock,setStock] = useState([]);
  const [bases,setBases] = useState([]);
  const [equipment,setEquipment] = useState([]);
  const [baseId,setBaseId] = useState('');
  const [equipmentTypeId,setEquipmentTypeId] = useState('');
  const [show,setShow] = useState(false);
  const [startDate, setStartDate] = useState('');
const [endDate, setEndDate] = useState('');

  async function load() {
    const params = {};

if (baseId) params.baseId = baseId;
if (equipmentTypeId) params.equipmentTypeId = equipmentTypeId;
if (startDate) params.startDate = startDate;
if (endDate) params.endDate = endDate;
    const [m,s] = await Promise.all([
      api.get('/assets/metrics',{params}),
      api.get('/assets/stock',{params})
    ]);
    setMetrics(m.data); setStock(s.data);
  }

  useEffect(()=>{ api.get('/bases').then(r=>setBases(r.data)); api.get('/equipment-types').then(r=>setEquipment(r.data)); },[]);
  useEffect(() => {
  load();
}, [baseId, equipmentTypeId, startDate, endDate]);

  const chart = stock.slice(0,8).map(x => ({name:x.equipment_name, quantity:x.quantity}));

  return (
    <div>
      <div className="flex flex-wrap justify-between gap-4 mb-6">
        <div><h1 className="text-2xl font-bold">Dashboard</h1><p className="text-slate-500">Real-time inventory overview · {user?.baseName || 'All bases'}</p></div>
        <div className="flex flex-wrap gap-2">

  <select
    value={baseId}
    onChange={e => setBaseId(e.target.value)}
    className="border rounded-lg p-2"
  >
    <option value="">All bases</option>
    {bases.map(b => (
      <option key={b.id} value={b.id}>
        {b.name}
      </option>
    ))}
  </select>

  <select
    value={equipmentTypeId}
    onChange={e => setEquipmentTypeId(e.target.value)}
    className="border rounded-lg p-2"
  >
    <option value="">All equipment</option>
    {equipment.map(e => (
      <option key={e.id} value={e.id}>
        {e.name}
      </option>
    ))}
  </select>

  <input
    type="date"
    value={startDate}
    onChange={e => setStartDate(e.target.value)}
    className="border rounded-lg p-2"
    title="Start date"
  />

  <input
    type="date"
    value={endDate}
    onChange={e => setEndDate(e.target.value)}
    className="border rounded-lg p-2"
    title="End date"
  />

  <button
    type="button"
    onClick={() => {
      setStartDate('');
      setEndDate('');
    }}
    className="border rounded-lg px-3 py-2"
  >
    Clear
  </button>

</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard title="Opening Balance" value={metrics.openingBalance}/>
        <StatCard title="Net Movement" value={metrics.netMovement} onClick={()=>setShow(true)} accent="emerald"/>
        <StatCard title="Assigned" value={metrics.assigned} accent="amber"/>
        <StatCard title="Expended" value={metrics.expended} accent="red"/>
        <StatCard title="Closing Balance" value={metrics.closingBalance} accent="blue"/>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mt-6">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="font-bold mb-4">Current Stock</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart}><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey="quantity"/></BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm overflow-auto">
          <h2 className="font-bold mb-4">Stock by Base</h2>
          <table className="w-full text-sm"><thead><tr className="text-left border-b"><th className="py-2">Base</th><th>Equipment</th><th>Qty</th></tr></thead>
          <tbody>{stock.map(x=><tr key={x.id} className="border-b"><td className="py-2">{x.base_name}</td><td>{x.equipment_name}</td><td className="font-semibold">{x.quantity.toLocaleString()}</td></tr>)}</tbody></table>
        </div>
      </div>

      {show && <Modal title="Net Movement Breakdown" onClose={()=>setShow(false)}>
        <div className="space-y-3">
          <div className="flex justify-between"><span>Purchases (+)</span><b>{Number(metrics.purchases||0).toLocaleString()}</b></div>
          <div className="flex justify-between"><span>Transfers In (+)</span><b>{Number(metrics.transfersIn||0).toLocaleString()}</b></div>
          <div className="flex justify-between"><span>Transfers Out (-)</span><b>{Number(metrics.transfersOut||0).toLocaleString()}</b></div>
          <hr/><div className="flex justify-between font-bold"><span>Total Net</span><span>{Number(metrics.netMovement||0).toLocaleString()}</span></div>
        </div>
      </Modal>}
    </div>
  );
}
