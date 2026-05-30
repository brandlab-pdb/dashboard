// src/tabs/TeamTab.jsx
import React, { useState } from "react";
import { thm, getMemberColor, PRIO_ORDER } from "../utils";

export default function TeamTab({ teamMembers, clients }) {
  const [expandedWho, setExpandedWho] = useState(null);
  const WIP_LIMIT = 5;

  const totalActiveEquipo = clients.flatMap(c => c.tasks ? c.tasks.filter(t => t.state !== "done") : []).length || 1;
  let currentDeg = 0;
  
  const pieGradientParts = teamMembers.map(m => {
     const mActive = clients.flatMap(c => c.tasks ? c.tasks.filter(t => t.state !== "done" && t.assigned_to === m.id) : []).length;
     const pct = (mActive / totalActiveEquipo) * 100;
     if (pct === 0) return null;
     const color = getMemberColor(m.name);
     const start = currentDeg;
     currentDeg += pct;
     return `${color} ${start}% ${currentDeg}%`;
  }).filter(Boolean).join(", ");

  const pieStyle = {
     width: 130, height: 130, borderRadius: "50%",
     background: pieGradientParts ? `conic-gradient(${pieGradientParts})` : thm.border,
     display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.4)"
  };

  return (
    <div className="fade-up" style={{ flex: 1, overflowY: "auto", padding: "32px 40px", background: thm.bg }}>
      {/* HEADER & PIE CHART */}
      <div style={{ display: "flex", gap: 32, alignItems: "center", marginBottom: 32, background: thm.surface, padding: 24, borderRadius: 14, border: `1px solid ${thm.border}` }}>
        <div style={pieStyle}>
           <div style={{ width: 80, height: 80, background: thm.surface, borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: "#eef0f3" }}>{totalActiveEquipo}</span>
              <span style={{ fontSize: 9, color: thm.textMuted, letterSpacing: 1 }}>ACTIVAS</span>
           </div>
        </div>
        <div style={{ flex: 1 }}>
           <h2 className="font-serif" style={{ fontSize: 26, margin: "0 0 12px 0", color: thm.text }}>Distribución de Carga Actual</h2>
           <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {teamMembers.map(m => {
                 const mActive = clients.flatMap(c => c.tasks ? c.tasks.filter(t => t.state !== "done" && t.assigned_to === m.id) : []).length;
                 if (mActive === 0) return null;
                 return (
                    <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: thm.textSub, background: thm.inputBg, padding: "6px 12px", borderRadius: 20 }}>
                       <div style={{ width: 10, height: 10, borderRadius: "50%", background: getMemberColor(m.name) }}/> 
                       <span style={{ fontWeight: 700, color: thm.text }}>{m.name}</span> ({mActive})
                    </div>
                 )
              })}
           </div>
        </div>
      </div>

      {/* TEAM CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 18 }}>
        {teamMembers.map(m => {
          const allTasks = clients.flatMap(c => c.tasks ? c.tasks.filter(t => t.assigned_to === m.id).map(t => ({...t, cname: c.name})) : []);
          const active = allTasks.filter(t => t.state !== "done");
          const done = allTasks.filter(t => t.state === "done");
          const n = active.length; const ov = n >= WIP_LIMIT;
          const focusTask = active.sort((a,b) => (PRIO_ORDER[a.priority]||1) - (PRIO_ORDER[b.priority]||1))[0];
          const isExpanded = expandedWho === m.id;
          const mColor = getMemberColor(m.name);

          return (
            <div key={m.id} style={{ background: thm.surface, border: `1px solid ${thm.border}`, borderRadius: 12, overflow: "hidden", position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: mColor }}/>
              <div style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: mColor, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 600, fontSize: 14 }}>
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: mColor }}>{m.name}</div>
                    <div style={{ fontSize: 10, color: thm.textMuted }}>{m.role || "Equipo Ejecutivo"}</div>
                  </div>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                    <span style={{ color: thm.textMuted }}>Tareas pendientes</span>
                    <span style={{ fontWeight: 700, color: ov ? "#f87171" : thm.text }}>{n} {ov && "⚠"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                    <span style={{ color: thm.textMuted }}>Completadas</span>
                    <span style={{ fontWeight: 700, color: "#4ade80" }}>{done.length}</span>
                  </div>
                </div>

                <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${thm.borderLight}` }}>
                  <div style={{ fontSize: 10, color: thm.textMuted, marginBottom: 4 }}>🔥 Foco Actual</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: thm.text }}>{focusTask ? focusTask.text : "Sin tareas activas"}</div>
                  {focusTask && <div style={{ fontSize: 10, color: thm.textSub, marginTop: 2 }}>{focusTask.cname}</div>}
                </div>

                <button onClick={() => setExpandedWho(isExpanded ? null : m.id)} style={{ marginTop: 12, background: "transparent", border: `1px solid ${thm.border}`, borderRadius: 6, padding: "6px 12px", fontSize: 10, fontWeight: 600, color: thm.textSub, cursor: "pointer", width: "100%" }}>
                  {isExpanded ? "▲ Ocultar lista" : "▼ Ver lista completa"}
                </button>

                {isExpanded && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
                    {active.map(t => (
                      <div key={t.id} style={{ fontSize: 11, padding: "8px 10px", background: thm.inputBg, borderRadius: 6, borderLeft: `3px solid ${t.state === "blocked" ? "#f87171" : t.state === "inprogress" ? "#facc15" : mColor}`, display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12 }}>{t.category}</span>
                        <span style={{ flex: 1, color: thm.textSub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}