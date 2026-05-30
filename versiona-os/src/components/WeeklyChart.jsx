// src/components/WeeklyChart.jsx
import React from 'react';

export default function WeeklyChart({ allDone, thm }) {
  if (!allDone || !Array.isArray(allDone)) return null;
  const weeks = {};
  allDone.forEach(t => {
    if (!t.completedAt) return;
    const d = new Date(t.completedAt);
    const key = `${d.getFullYear()}-W${Math.ceil((((d - new Date(d.getFullYear(),0,1)) / 86400000) + 1) / 7)}`;
    if (!weeks[key]) weeks[key] = { label: `S ${key.split('-W')[1]}`, count: 0 };
    weeks[key].count++;
  });

  const data = Object.entries(weeks).sort((a,b) => a[0].localeCompare(b[0])).slice(-8);
  if (!data.length) return null;
  const max = Math.max(...data.map(([,w])=>w.count), 1);

  return (
    <div className="fade-up" style={{ background:thm.surface, borderRadius:12, padding:"18px 20px", border:`1px solid ${thm.border}`, marginBottom:28 }}>
      <div style={{ fontSize:10, color:thm.textMuted, letterSpacing:1.5, textTransform:"uppercase", fontWeight:700, marginBottom:14 }}>Entregas semanales</div>
      <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:60 }}>
        {data.map(([key, w]) => (
          <div key={key} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
            <span style={{ fontSize:9, color:"#4ade80", fontWeight:700 }}>{w.count}</span>
            <div style={{ width:"100%", borderRadius:"3px 3px 0 0", background:"rgba(74,222,128,0.2)", height:`${(w.count/max)*60}px` }}/>
          </div>
        ))}
      </div>
    </div>
  );
}