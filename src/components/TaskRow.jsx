/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { thm, getMemberColor, PRIO_CLR, PRIO_LBL, ACCESS_CODES_STATIC } from "../utils";

export default function TaskRow({ 
  task, cid, teamMembers, onCycleState, onCycleWho, onCyclePrio, 
  onCompleteTask, onRestoreTask, onUpdateTitle, onDeleteTask, 
  onSetDl, editingDl, setEditingDl, index, isAdmin, clients, onChangeTaskProject, onArchiveTask 
}) {
  const isDone = task.state === "done";
  const member = teamMembers.find(m => m.id === task.assigned_to);

  // Puente de validación para proteger el flujo operativo del equipo
  const runProtectedAction = async (actionLabel, executeFn) => {
    if (isAdmin) {
      executeFn();
      return;
    }
    const code = prompt(`Acción Protegida: Introduce un código de Administrador para ${actionLabel}:`);
    if (!code) return;
    const match = ACCESS_CODES_STATIC[code.trim().toLowerCase()];
    if (match && (match.role === "admin" || match.role === "superadmin")) {
      // El callback ejecutará la función nativa conectada a tu App.jsx
      executeFn();
    } else {
      alert("Código inválido. Mesa de control canceló la acción.");
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px", background: thm.surface, borderRadius: 8, marginBottom: 6 }}>
      {/* ... (Todo tu bloque de texto, StatePill, PrioPill y WhoChip se queda exactamente igual) ... */}
      
      {/* MEJORA 1: SELECTOR DE CAMBIO DE MARCA INTERACTIVO EN CALIENTE (SOLO VISIBLE PARA ADMIN) */}
      {isAdmin && !isDone && (
        <select 
          value={cid} 
          onChange={(e) => onChangeTaskProject(task.id, e.target.value)}
          style={{ background: thm.surfaceHigh, border: `1px solid ${thm.border}`, color: thm.textSub, fontSize: 10, padding: "2px 6px", borderRadius: 4, cursor: "pointer" }}
        >
          {clients.filter(c => c.dbStatus !== "archived").map(p => (
            <option key={p.id} value={p.id}>→ {p.name}</option>
          ))}
        </select>
      )}

      {/* MEJORA 2: BOTONES DE ARCHIVO Y ELIMINACIÓN CONTROLADOS POR ACCESO GATED */}
      <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
        <button 
          onClick={() => runProtectedAction("Archivar Actividad", () => onArchiveTask(task.id))}
          style={{ background: "none", border: `1px solid ${thm.border}`, borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 11 }}
          title="Archivar"
        >
          📥
        </button>
        <button 
          onClick={() => runProtectedAction("Eliminar Actividad", () => onDeleteTask(task.id))}
          style={{ background: "none", border: `1px solid ${thm.borderLight}`, color: thm.textMuted, borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 11 }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}