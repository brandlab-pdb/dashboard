// src/components/TaskRow.jsx
import React, { useState } from 'react';
import { getMemberColor } from '../utils';

export default function TaskRow({ task, cid, onCycleState, onCycleWho, onCyclePrio, onCompleteTask, onUpdateTitle, onDeleteTask, isAdmin, thm }) {
  const [isEditing, setIsEditing] = useState(false);
  const [titleInput, setTitleInput] = useState(task.text);

  return (
    <div style={{ padding:"12px", background:task.state === 'done' ? thm.surfaceHigh : thm.surface, borderRadius:8, border:`1px solid ${thm.border}`, marginBottom:5 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        {isEditing ? (
          <input 
            value={titleInput} 
            onChange={e => setTitleInput(e.target.value)} 
            onBlur={() => {setIsEditing(false); onUpdateTitle(task.id, titleInput);}}
            autoFocus
            style={{ background:thm.inputBg, border:`1px solid ${thm.border}`, color:thm.text, padding:"4px", width:"100%" }}
          />
        ) : (
          <span style={{ fontSize:13, color:task.state === 'done' ? thm.textMuted : thm.text }}>{task.text}</span>
        )}
        {isAdmin && <button onClick={() => setIsEditing(true)}>✏️</button>}
        <button onClick={() => onDeleteTask(task.id, task.text)}>✕</button>
      </div>
      {/* Aquí integrarías los estados y botones de acción que ya tenemos */}
    </div>
  );
}