// src/components/TaskRow.jsx
import React, { useState } from 'react';

export default function TaskRow({ task, cid, teamMembers, onCycleState, onCycleWho, onCyclePrio, onCompleteTask, onRestoreTask, onUpdateTitle, onDeleteTask, onApproveTask, onSetDl, editingDl, setEditingDl, index, isAdmin, thm, PRIO_CLR, PRIO_LBL }) {
  const isDone = task.state === 'done';
  const [isEditing, setIsEditing] = useState(false);
  const [titleInput, setTitleInput] = useState(task.text);

  return (
    <div style={{ padding:"12px", background:isDone ? thm.surfaceHigh : thm.surface, borderRadius:8, border:`1px solid ${thm.border}`, borderLeft:`4px solid ${isDone ? thm.border : PRIO_CLR[task.priority]}` }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        {isEditing ? (
          <input value={titleInput} onChange={e=>setTitleInput(e.target.value)} onBlur={()=>{setIsEditing(false); onUpdateTitle(task.id, titleInput);}} autoFocus />
        ) : (
          <span style={{ fontSize:13, fontWeight:500, color:isDone ? thm.textMuted : thm.text }}>{task.text}</span>
        )}
        {isAdmin && !isDone && <button onClick={()=>setIsEditing(true)} style={{background:'none',border:'none',cursor:'pointer'}}>✏️</button>}
      </div>
      {/* ... Botones de estado, prioridad y eliminar ... */}
    </div>
  );
}