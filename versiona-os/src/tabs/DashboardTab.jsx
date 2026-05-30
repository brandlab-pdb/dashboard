import React, { useState } from "react";
import TaskRow from "../components/TaskRow";

const STA_CLR = { green: "#4ade80", yellow: "#facc15", red: "#f87171" };

export default function DashboardTab({ 
  clients, 
  activeClient, 
  setActiveClient, 
  teamMembers, 
  isAdmin,
  thm,
  rowProps, // Contiene las funciones de cycleState, deleteTask, etc.
  newTask,
  setNewTask,
  addTask,
  showForm,
  setShowForm
}) {
  const [showDone, setShowDone] = useState(false);
  const [orderCriteria, setOrderCriteria] = useState("default");

  // Filtrado de proyectos
  const adminProjects = clients.filter(c => (c.type === "admin" || c.name.toLowerCase().includes("admin")) && c.dbStatus !== "archived");
  const regularProjects = clients.filter(c => !adminProjects.some(a => a.id === c.id) && c.dbStatus !== "archived");
  const activeProjects = regularProjects.filter(c => c.tasks && c.tasks.some(t => t.state !== "done"));
  
  const client = clients.find(c => c.id === activeClient) || activeProjects[0] || adminProjects[0];

  const getDone = (tasks) => tasks ? tasks.filter(t => t.state === "done") : [];
  
  const getActive = (tasks) => {
    if (!tasks || !Array.isArray(tasks)) return [];
    let list = tasks.filter(t => t.state !== "done");
    if (orderCriteria === "priority") {
      const PRIO_ORDER = { high: 0, medium: 1, low: 2 };
      list.sort((a, b) => (PRIO_ORDER[a.priority] ?? 1) - (PRIO_ORDER[b.priority] ?? 1));
    }
    return list;
  };

  const inpStyle = { background:thm.inputBg, border:`1px solid ${thm.border}`, borderRadius:8, color:thm.text, fontSize:12, padding:"9px 12px", outline:"none" };

  return (
    <div style={{ display: "flex", width: "100%", height: "100%", overflow: "hidden" }}>
      
      {/* ── BARRA LATERAL: CLIENTES ── */}
      <div style={{ width: 260, borderRight: `1px solid ${thm.border}`, background: thm.surface, overflowY: "auto", flexShrink: 0, display: "flex", flexDirection: "column" }}>
        {adminProjects.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ padding: "16px 18px 6px", fontSize: 9, color: thm.textMuted, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700 }}>⚙️ Operación Interna</div>
            {adminProjects.map(c => (
              <button key={c.id} onClick={() => { setActiveClient(c.id); setShowDone(false); }} style={{ width: "100%", textAlign: "left", padding: "11px 18px", background: c.id === client?.id ? thm.surfaceHigh : "transparent", border: "none", borderLeft: c.id === client?.id ? `3px solid #c49a2a` : "3px solid transparent", cursor: "pointer", color: c.id === client?.id ? thm.text : thm.textSub, fontWeight: c.id === client?.id ? 600 : 400, fontSize: 13 }}>
                ⚙️ {c.name}
              </button>
            ))}
          </div>
        )}
        
        {activeProjects.length > 0 && <div style={{ padding: "16px 18px 6px", fontSize: 9, color: thm.textMuted, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700 }}>Clientes Activos</div>}
        {activeProjects.map(c => {
          const total = c.tasks ? c.tasks.length : 0;
          const done = c.tasks ? c.tasks.filter(t => t.state === "done").length : 0;
          const bl = c.tasks ? c.tasks.filter(t => t.state === "blocked").length : 0;
          const pd = c.tasks ? c.tasks.filter(t => t.state !== "done").length : 0;
          
          return (
            <button key={c.id} onClick={() => { setActiveClient(c.id); setShowDone(false); }} style={{ width: "100%", textAlign: "left", padding: "11px 18px", background: c.id === client?.id ? thm.surfaceHigh : "transparent", border: "none", borderLeft: c.id === client?.id ? `3px solid ${STA_CLR[c.status]}` : "3px solid transparent", cursor: "pointer", color: c.id === client?.id ? thm.text : thm.textSub, fontWeight: c.id === client?.id ? 600 : 400, fontSize: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, overflow: "hidden" }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: STA_CLR[c.status], flexShrink: 0 }} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                </div>
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  {bl > 0 && <span style={{ fontSize: 9, color: "#f87171", fontWeight: 700 }}>⊘{bl}</span>}
                  {pd > 0 && <span style={{ fontSize: 9, color: thm.textMuted }}>{pd}</span>}
                </div>
              </div>
              {total > 0 && <div style={{ height: 3, background: "#1c222d", borderRadius: 2, overflow: "hidden" }}><div style={{ height: "100%", width: `${Math.round((done / total) * 100)}%`, background: c.status === "red" ? "#f87171" : c.status === "yellow" ? "#facc15" : "#4ade80", transition: "width 0.4s" }} /></div>}
            </button>
          );
        })}
      </div>

      {/* ── PANEL PRINCIPAL: TAREAS ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px", background: thm.bg }}>
        {client ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${thm.border}` }}>
              <h2 className="font-serif" style={{ margin: 0, fontSize: 32, display: "flex", alignItems: "center", gap: 12 }}>
                {client.name}
                <span style={{ fontSize: 10, fontWeight: 700, padding: "4px 8px", background: thm.surfaceTop, borderRadius: 6, color: thm.textSub, letterSpacing: 1, textTransform: "uppercase" }}>{client.type || "POR DEFINIR"}</span>
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <select value={orderCriteria} onChange={e => setOrderCriteria(e.target.value)} style={{ background: thm.surface, border: `1px solid ${thm.border}`, color: thm.textSub, fontSize: 11, padding: "6px 10px", borderRadius: 6, outline: "none", cursor: "pointer", fontWeight: 600 }}>
                  <option value="default">Orden Cronológico</option>
                  <option value="priority">Agrupar por Prioridad</option>
                </select>
                <span style={{ fontSize: 11, color: thm.textMuted }}>{getActive(client.tasks).length} activas</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
              {getActive(client.tasks).length === 0 && <div style={{ fontSize: 13, color: thm.textMuted, padding: "32px", textAlign: "center", background: thm.surface, borderRadius: 10, border: `1px dashed ${thm.border}` }}>Sin tareas activas.</div>}
              {getActive(client.tasks).map((task, idx) => (
                <TaskRow key={task.id} task={task} cid={client.id} index={idx} teamMembers={teamMembers} isAdmin={isAdmin} {...rowProps} />
              ))}
            </div>

            {!showForm ? (
              <button className="btn-action fade-up" onClick={() => { setNewTask(p => ({ ...p, projectId: client.id })); setShowForm(true); }} style={{ padding: "10px 20px", background: thm.accentBg, color: thm.accentText, border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, letterSpacing: .5 }}>✦ Nueva Actividad</button>
            ) : (
              <div className="fade-up" style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: 20, background: thm.surface, borderRadius: 12, border: `1px solid ${thm.border}` }}>
                <input value={newTask.text} onChange={e => setNewTask(p => ({ ...p, text: e.target.value }))} onKeyDown={e => e.key === "Enter" && addTask()} placeholder="Describe la actividad..." autoFocus style={{ ...inpStyle, flex: 1, minWidth: 200 }} />
                <select value={newTask.whoId || ""} onChange={e => setNewTask(p => ({ ...p, whoId: e.target.value }))} style={{ ...inpStyle, cursor: "pointer" }}>
                  {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <button onClick={addTask} style={{ background: thm.accentBg, color: thm.accentText, border: "none", borderRadius: 8, padding: "0 20px", fontWeight: 700, cursor: "pointer", fontSize: 12 }}>Agregar</button>
                <button onClick={() => setShowForm(false)} style={{ background: "transparent", color: thm.textMuted, border: "none", cursor: "pointer", padding: "0 12px", fontWeight: 600, fontSize: 14 }}>✕</button>
              </div>
            )}
          </>
        ) : (
          <div style={{ color: thm.textMuted, textAlign: "center", paddingTop: 100 }}>Selecciona un proyecto de la lista.</div>
        )}
      </div>
    </div>
  );
}