/* eslint-disable react/prop-types */
import React, { useState } from "react";

const PRIO_CLR = { high: "#f87171", medium: "#facc15", low: "#4ade80" };
const PRIO_LBL = { high: "Alta", medium: "Media", low: "Baja" };

export default function TaskRow({ 
  task, cid, teamMembers, onCycleState, onCycleWho, onCyclePrio, 
  onCompleteTask, onRestoreTask, onUpdateTitle, onDeleteTask, 
  onSetDl, editingDl, setEditingDl, index, isAdmin, thm 
}) {
  const isDone = task.state === "done";
  const days = task.state === "blocked" ? Math.floor((Date.now() - new Date(task.blockedSince).getTime()) / 86400000) : 0;
  const member = teamMembers.find(m => m.id === task.assigned_to);
  const [isEditing, setIsEditing] = useState(false);
  const [titleInput, setTitleInput] = useState(task.text);

  const getMemberColor = (name) => {
    const n = (name || "").toLowerCase();
    if (n.includes("diego")) return "#F47920";
    if (n.includes("artur")) return "#7F77DD";
    if (n.includes("héct") || n.includes("ek")) return "#378ADD";
    return "#60a5fa";
  };

  const handleEditSubmit = () => {
    setIsEditing(false);
    if (titleInput.trim() !== task.text) onUpdateTitle(task.id, titleInput);
  };

  const stateStyle = {
    pending:   { bg: "#161b24", text: "rgba(238,240,243,0.5)", border: "rgba(255,255,255,0.08)", label: "Pendiente" },
    inprogress:{ bg: "rgba(250,204,21,0.1)", text: "#facc15", border: "rgba(250,204,21,0.2)", label: "En proceso" },
    blocked:   { bg: "rgba(248,113,113,0.1)", text: "#f87171", border: "rgba(248,113,113,0.2)", label: "Pausado" },
    in_review: { bg: "rgba(56,189,248,0.1)", text: "#38bdf8", border: "rgba(56,189,248,0.2)", label: "En Revisión" },
    done:      { bg: "rgba(74,222,128,0.1)", text: "#4ade80", border: "rgba(74,222,128,0.2)", label: "✓ Listo" }
  };

  const s = stateStyle[task.state] || stateStyle.pending;
  const mColor = member ? getMemberColor(member.name) : "#888";
  const revOver = (task.revisions || 0) >= 2;

  return (
    <div className="task-row fade-up" style={{ 
      animationDelay: `${(index || 0) * 0.04}s`, display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 18px", 
      background: isDone ? thm.surfaceHigh : thm.surface, borderRadius: 10, border: `1px solid ${isDone ? "rgba(255,255,255,0.04)" : thm.border}`, 
      borderLeft: `4px solid ${isDone ? "rgba(255,255,255,0.04)" : (PRIO_CLR[task.priority] || "#facc15")}`, opacity: isDone ? 0.4 : 1, marginBottom: 6
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          {task.is_session && <span style={{ fontSize: 9, background: "rgba(192,132,252,0.1)", color: "#c084fc", border: "1px solid rgba(192,132,252,0.2)", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>SESIÓN</span>}
          {task.category && <span style={{ fontSize: 13 }}>{task.category}</span>}
          
          {isEditing ? (
            <input value={titleInput} onChange={e => setTitleInput(e.target.value)} onBlur={handleEditSubmit} onKeyDown={e => e.key === "Enter" && handleEditSubmit()} autoFocus style={{ background: "#0a0c10", border: `1px solid ${thm.border}`, color: thm.text, fontSize: 13, padding: "2px 8px", borderRadius: 4, width: "100%" }} />
          ) : (
            <span style={{ fontSize: 13, color: isDone ? thm.textMuted : thm.text, textDecoration: isDone ? "line-through" : "none", fontWeight: 500, lineHeight: 1.4 }}>{task.text}</span>
          )}
          {!isDone && isAdmin && !isEditing && <button onClick={() => setIsEditing(true)} style={{ background: "none", border: "none", cursor: "pointer", opacity: 0.4, fontSize: 11 }}>✏️</button>}
        </div>

        {days > 0 && <div style={{ fontSize: 10, color: days >= 3 ? "var(--red)" : "var(--yellow)", fontWeight: 600, marginBottom: 6 }}>⏱ {days}d esperando en pausa · follow-up hoy</div>}
        {revOver && <div style={{ fontSize: 10, color: "#f87171", fontWeight: 700, marginBottom: 6 }}>⚠ {task.revisions} revisiones · Escalar de inmediato a llamada</div>}

        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {!isDone && <button className="btn-action" onClick={() => onCycleState(cid, task.id)} style={{ padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: s.bg, color: s.text, border: `1px solid ${s.border}`, cursor: "pointer" }}>{s.label}</button>}
          <button className="btn-action" onClick={() => onCyclePrio(cid, task.id, task.priority)} style={{ padding: "3px 8px", borderRadius: 20, fontSize: 9, fontWeight: 700, background: `${PRIO_CLR[task.priority]}1A`, color: PRIO_CLR[task.priority], border: `1px solid ${PRIO_CLR[task.priority]}33`, cursor: "pointer" }}>{PRIO_LBL[task.priority]}</button>
          <button className="btn-action" onClick={() => onCycleWho(cid, task.id, task.assigned_to)} style={{ padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: `${mColor}1A`, color: mColor, border: `1px solid ${mColor}33`, cursor: "pointer" }}>{member ? member.name : "Sin asignar"}</button>
          
          {!isDone && <button className="btn-action" onClick={() => onCompleteTask(task.id)} style={{ padding: "3px 10px", background: "rgba(74,222,128,0.12)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.25)", borderRadius: 20, fontSize: 10, fontWeight: 700, cursor: "pointer" }}>✓ Terminar</button>}
          {isDone && <button className="btn-action" onClick={() => onRestoreTask(task.id)} style={{ padding: "3px 8px", background: "none", color: thm.textSub, border: `1px solid ${thm.border}`, borderRadius: 20, fontSize: 10, fontWeight: 600, cursor: "pointer" }}>↺ Reabrir</button>}
        </div>
      </div>
      {isAdmin && <button onClick={e => onDeleteTask(task.id, e)} style={{ fontSize: 10, color: thm.textFaint, background: "none", border: `1px solid ${thm.borderLight}`, borderRadius: 5, padding: "4px 8px", cursor: "pointer" }}>✕</button>}
    </div>
  );
}