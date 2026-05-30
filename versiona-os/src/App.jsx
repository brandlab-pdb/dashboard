/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";

// ── IMPORTACIÓN ESTRUCTURADA DESDE UTILS ──
import { ORG_ID, WIP_LIMIT, MAX_TASK_LEN, WHO_LIST, TYPES, PRIO_ORDER, PRIO_CYCLE, TASK_CATS, STATE_CYCLE, thm, STA_CLR, PRIO_CLR, PRIO_LBL, ACCESS_CODES_STATIC, daysSince, deadlineInfo, toWho, toDbName, getMemberColor, getWeekKey, groupDoneByWeek, sortProjects, injectStyles, font } from "./utils";

// ══════════════════════════════════════════════════════════════
// SECCIÓN 1: COMPONENTES DE VISTA (TABS & ROWS)
// ══════════════════════════════════════════════════════════════

function WeeklyChart({ allDone }) {
  const weeks = {};
  allDone.forEach(t => {
    if (!t.completedAt) return;
    const { key, label } = getWeekKey(t.completedAt);
    const shortLabel = label.split("·")[1].replace("Inicia el ", "").trim();
    if (!weeks[key]) weeks[key] = { label: shortLabel, count:0 };
    weeks[key].count++;
  });
  const data = Object.entries(weeks).sort((a,b) => a[0].localeCompare(b[0])).slice(-8);
  if (!data.length) return null;
  const max = Math.max(...data.map(([,w])=>w.count), 1);
  const BAR_H = 60;

  return (
    <div className="fade-up" style={{ background:thm.surface, borderRadius:12, padding:"18px 20px", border:`1px solid ${thm.border}`, marginBottom:28 }}>
      <div style={{ fontSize:10, color:thm.textMuted, letterSpacing:1.5, textTransform:"uppercase", fontWeight:700, marginBottom:14 }}>Volumen de Entregas por Semana</div>
      <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:BAR_H + 36 }}>
        {data.map(([key, w], i) => {
          const barH = Math.max(4, (w.count / max) * BAR_H);
          const opacity = 0.55 + (i / Math.max(data.length - 1, 1)) * 0.45;
          return (
            <div key={key} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4, height:"100%", justifyContent:"flex-end" }}>
              <span style={{ fontSize:10, color:"#4ade80", fontWeight:700 }}>{w.count}</span>
              <div style={{ width:"100%", borderRadius:"3px 3px 0 0", background:`rgba(74,222,128,${opacity})`, height:`${barH}px`, transition:"height 0.6s", boxShadow:`0 0 8px rgba(74,222,128,${opacity * 0.5})` }}/>
              <span style={{ fontSize:8, color:thm.textMuted, textAlign:"center", lineHeight:1.2, whiteSpace:"nowrap" }}>{w.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TaskRow({ task, cid, teamMembers, onCycleState, onCycleWho, onCyclePrio, onCompleteTask, onRestoreTask, onUpdateTitle, onDeleteTask, isAdmin }) {
  const isDone = task.state === "done";
  const days = task.state === "blocked" ? daysSince(task.blockedSince) : 0;
  const [isEditing, setIsEditing] = useState(false);
  const [titleInput, setTitleInput] = useState(task.text);

  const handleEditSubmit = () => {
    setIsEditing(false);
    if (titleInput.trim() !== task.text) onUpdateTitle(task.id, titleInput);
  };

  const s = thm.states[task.state] || thm.states.pending;
  const mColor = getMemberColor(task.who);
  const revOver = (task.revisions || 0) >= 2;

  return (
    <div className="task-row fade-up" style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"12px 14px", background:isDone ? thm.surfaceHigh : thm.surface, borderRadius:10, border:`1px solid ${isDone ? thm.borderLight : thm.border}`, borderLeft:`4px solid ${isDone ? thm.borderLight : PRIO_CLR[task.priority] || "#c49a2a"}`, opacity:isDone ? .5 : 1, marginBottom: 6 }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:7 }}>
          {task.category && <span style={{ fontSize:13 }}>{task.category}</span>}
          {isEditing ? (
            <input value={titleInput} onChange={e => setTitleInput(e.target.value)} onBlur={handleEditSubmit} onKeyDown={e => e.key==="Enter" && handleEditSubmit()} autoFocus style={{ background: "#0a0c10", border: `1px solid ${thm.border}`, color: thm.text, fontSize: 13, padding: "2px 8px", borderRadius: 4, width: "100%" }} />
          ) : (
            <span style={{ fontSize:13, color:isDone?thm.textMuted:thm.text, textDecoration:isDone?"line-through":"none", fontWeight:500, lineHeight:1.5 }}>{task.text}</span>
          )}
          {!isDone && isAdmin && !isEditing && <button onClick={() => { setIsEditing(true); setTitleInput(task.text); }} style={{ background:"none", border:"none", cursor:"pointer", opacity:0.5, fontSize:11 }}>✏️</button>}
        </div>
        {days > 0 && <div style={{ fontSize:10, color:days>=3?"#f87171":"#facc15", fontWeight:600, marginBottom:4 }}>⏱ {days}d esperando · follow-up hoy</div>}
        <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
          <button className="btn-action" onClick={() => onCycleState(cid, task.id)} style={{ padding:"3px 10px", borderRadius:20, fontSize:10, fontWeight:600, background:s.bg, color:s.text, border:`1px solid ${s.border}`, cursor:"pointer" }}>{s.label}</button>
          <button className="btn-action" onClick={() => onCyclePrio(cid, task.id, task.priority)} style={{ padding:"3px 8px", borderRadius:20, fontSize:9, fontWeight:600, background:`${PRIO_CLR[task.priority]}1A`, color:PRIO_CLR[task.priority], border:`1px solid ${PRIO_CLR[task.priority]}33`, cursor:"pointer" }}>{PRIO_LBL[task.priority] || task.priority}</button>
          <button className="btn-action" onClick={() => onCycleWho(cid, task.id, task.who)} style={{ padding:"3px 10px", borderRadius:20, fontSize:10, fontWeight:600, background:`${mColor}1A`, color:mColor, border:`1px solid ${mColor}33`, cursor:"pointer" }}>{task.who}</button>
          {!isDone && <button className="btn-action" onClick={() => onCompleteTask(task.id)} style={{ padding:"3px 10px", background:"rgba(74,222,128,0.12)", color:"#4ade80", border:"1px solid rgba(74,222,128,0.25)", borderRadius:20, fontSize:10, fontWeight:700, cursor:"pointer" }}>✓ Terminar</button>}
        </div>
      </div>
      {isAdmin && <button onClick={e => onDeleteTask(task.id, e)} style={{ fontSize:10, color:thm.textFaint, background:"none", border:`1px solid ${thm.borderLight}`, borderRadius:6, padding:"3px 7px", cursor:"pointer" }}>✕</button>}
    </div>
  );
}

function TeamTab({ teamMembers, clients, totalActiveEquipo, pieStyle }) {
  const [expandedWho, setExpandedWho] = useState(null);
  return (
    <div className="fade-up" style={{ flex:1, overflowY:"auto", padding:"32px 40px", background:thm.bg, width:"100%" }}>
      <h2 className="font-serif" style={{ fontSize:30, marginBottom:24 }}>Gestión de Equipo</h2>
      <div style={{ display:"flex", gap:32, alignItems:"center", marginBottom:32, background:thm.surface, padding:"24px", borderRadius:14, border:`1px solid ${thm.border}` }}>
        <div style={pieStyle}>
           <div style={{ width: 85, height: 85, background: thm.surface, borderRadius: "50%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:22, fontWeight:700, color:"#eef0f3" }}>{totalActiveEquipo}</span>
              <span style={{ fontSize:9, color:thm.textMuted, letterSpacing:1 }}>ACTIVAS</span>
           </div>
        </div>
        <div style={{ flex:1 }}>
           <h2 className="font-serif" style={{ fontSize:26, margin:"0 0 12px 0" }}>Distribución de Carga del Equipo</h2>
           <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
              {teamMembers.map(m => {
                 const mActive = clients.flatMap(c=>c.tasks ? c.tasks.filter(t=>t.state!=="done" && t.who === toWho(m.name)) : []).length;
                 return (
                    <div key={m.id} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:thm.textSub, background:thm.inputBg, padding:"6px 12px", borderRadius:20 }}>
                       <div style={{ width:10, height:10, borderRadius:"50%", background:getMemberColor(m.name) }}/> 
                       <span style={{ fontWeight:700, color:thm.text }}>{m.name}</span> ({mActive})
                    </div>
                 )
              })}
           </div>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:18 }}>
        {teamMembers.map(m => {
          const allTasks = clients.flatMap(c => c.tasks ? c.tasks.filter(t => t.who === toWho(m.name)) : []);
          const active = allTasks.filter(t => t.state !== "done");
          const done = allTasks.filter(t => t.state === "done");
          const n = active.length; const ov = n >= WIP_LIMIT;
          const isExpanded = expandedWho === m.id;
          const mColor = getMemberColor(m.name);
          return (
            <div key={m.id} className="team-card" style={{ background:thm.surface, border:`1px solid ${thm.border}` }}>
              <div style={{ position:"absolute", top:0, left:0, width:3, height:"100%", background:mColor }}/>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                <div style={{ width:38, height:38, borderRadius:"50%", background:mColor, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:600, fontSize:14, flexShrink:0 }}>{m.name.charAt(0).toUpperCase()}</div>
                <div>
                  <div style={{ fontSize:14, fontWeight:600, color:mColor }}>{m.name}</div>
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:11 }}><span style={{ color:thm.textMuted }}>Pendientes</span><span style={{ fontWeight:600, color:ov?"#f87171":thm.text }}>{n}</span></div>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:11 }}><span style={{ color:thm.textMuted }}>Completadas</span><span style={{ fontWeight:600, color:"#4ade80" }}>{done.length}</span></div>
                <button className="btn-action" onClick={() => setExpandedWho(isExpanded ? null : m.id)} style={{ marginTop:8, background:"transparent", border:`1px solid ${thm.border}`, borderRadius:6, padding:"4px 10px", fontSize:10, fontWeight:600, color:thm.textSub, cursor:"pointer" }}>{isExpanded ? "▲ Ocultar tareas" : "▼ Ver tareas"}</button>
                {isExpanded && (
                  <div style={{ display:"flex", flexDirection:"column", gap:4, marginTop:8 }}>
                    {active.length === 0 && <div style={{ fontSize:11, color:thm.textMuted }}>Sin tareas activas</div>}
                    {active.map(t => (
                      <div key={t.id} style={{ fontSize:11, padding:"6px 8px", background:thm.inputBg, borderRadius:6, borderLeft:`3px solid ${t.state==="blocked"?"#f87171":t.state==="inprogress"?"#facc15":mColor}`, display:"flex", alignItems:"center", gap:6 }}>
                        <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.text}</span>
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

function AnalysisTab({ clients, allDone, teamMembers, weekGroups }) {
  const [waBriefs, setWaBriefs] = useState(null);
  const totalCuentas = clients.filter(c => c.dbStatus !== "archived").length;
  const inputStyle = { width:"100%", background:thm.inputBg, border:`1px solid ${thm.border}`, borderRadius:8, color:thm.text, fontSize:13, padding:"10px 12px", outline:"none", resize:"none" };

  const generateDailyBriefs = () => {
    setWaBriefs({
      Héctor: "🔥 *Versiona Daily Brief · Héctor*\n• Terminar el 4to video para cierre 🎬.",
      Arturo: "📚 *Versiona Daily Brief · Arturo*\n• Cerrar propuesta comercial 🚀.",
      Diego: "🧠 *Versiona Daily Brief · Diego*\n• Validar código de la landing page."
    });
  };

  return (
    <div className="fade-up" style={{ flex:1, overflowY:"auto", padding:"32px 40px", background:thm.bg, width:"100%" }}>
      <h2 className="font-serif" style={{ margin:"0 0 20px 0", fontSize:32 }}>📊 Análisis Semanal</h2>
      <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
        <WeeklyChart allDone={allDone} />
        <div style={{ background:thm.surface, borderRadius:14, padding:24, border:`1px solid ${thm.border}` }}>
          <div style={{ fontSize:10, color:thm.textMuted, letterSpacing:1.5, textTransform:"uppercase", marginBottom:4, fontWeight:700 }}>Semáforo de la semana</div>
          <div className="semaforo-win" style={{ marginBottom:12 }}><span style={{ fontSize:24, flexShrink:0 }}>🏆</span><div style={{ flex:1 }}><div style={{ fontSize:11, color:"#4ade80", fontWeight:700 }}>LOGRO</div><textarea rows={2} style={inputStyle}/></div></div>
          <div className="semaforo-warn" style={{ marginBottom:12 }}><span style={{ fontSize:24, flexShrink:0 }}>🚀</span><div style={{ flex:1 }}><div style={{ fontSize:11, color:"#facc15", fontWeight:700 }}>AVANCE</div><textarea rows={2} style={inputStyle}/></div></div>
          <div className="semaforo-risk"><span style={{ fontSize:24, flexShrink:0 }}>⚠️</span><div style={{ flex:1 }}><div style={{ fontSize:11, color:"#f87171", fontWeight:700 }}>RIESGO</div><textarea rows={2} style={inputStyle}/></div></div>
        </div>
        <div style={{ background:thm.surface, borderRadius:14, padding:24, border:`1px solid ${thm.border}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div><div style={{ fontSize:14, fontWeight:700 }}>WhatsApp Daily Brief</div></div>
            <button onClick={generateDailyBriefs} style={{ background:thm.text, color:thm.bg, border:"none", padding:"8px 16px", borderRadius:6, fontWeight:700, cursor:"pointer", fontSize:11 }}>Generar</button>
          </div>
          {waBriefs && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:12 }}>
              {Object.entries(waBriefs).map(([name, msg]) => (
                <div key={name} style={{ background:thm.inputBg, padding:16, borderRadius:8, border: `1px solid ${thm.border}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}><span style={{ fontSize:12, fontWeight:700, color:getMemberColor(name) }}>{name}</span><button onClick={() => navigator.clipboard.writeText(msg)} style={{ background:"none", border:"none", color:"#4ade80", fontSize:10, cursor:"pointer", fontWeight:700 }}>Copiar</button></div>
                  <pre style={{ margin:0, fontSize:11, whiteSpace:"pre-wrap", color:thm.textSub, lineHeight:1.5, fontFamily:"inherit" }}>{msg}</pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SECCIÓN 2: APP CEREBRO PRINCIPAL
// ══════════════════════════════════════════════════════════════

export default function App() {
  const [session,       setSession]       = useState({ loggedIn:false, role:null, user:null });
  const [accessCode,    setAccessCode]    = useState("");
  const [showPass,      setShowPass]      = useState(false);
  const [loginError,    setLoginError]    = useState(false);
  const [loaded,        setLoaded]        = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [view,          setView]          = useState("dashboard");
  const [clients,       setClients]       = useState([]);
  const [teamMembers,   setTeamMembers]   = useState([]);
  const [activeClient,  setActiveClient]  = useState(null);
  const [showDone,      setShowDone]      = useState(false);
  const [newTask,       setNewTask]       = useState({ text:"", who:"EK", priority:"medium", category:"🔥" });

  const [now, setNow] = useState(new Date());
  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(timer); }, []);
  useEffect(() => { injectStyles(); }, []);

  const syncPipeline = useCallback(async () => {
    setSaving(true);
    try {
      const { data:dbMembers }  = await supabase.from("team_members").select("*");
      const { data:dbProjects } = await supabase.from("projects").select("*");
      const { data:dbTasks }    = await supabase.from("tasks").select("*");
      
      setTeamMembers(dbMembers || []);
      const isUserAdmin = session.role === "admin" || session.role === "superadmin";

      const mapped = (dbProjects || []).map(proj => {
        let tasks = (dbTasks || []).filter(t => t.project_id === proj.id).map(t => {
          const member = (dbMembers || []).find(m => m.id === t.assigned_to);
          return { id: t.id, text: t.title, who: member ? toWho(member.name) : "EK", state: t.status, priority: t.priority, category: t.task_type || "🔥", blockedSince: t.status === "blocked" ? t.updated_at : null, completedAt: t.status === "done" ? t.updated_at : null, deadline: t.deadline, blocked_reason: t.blocked_reason, revisions: t.revisions || 0 };
        });
        let calcStatus = "green";
        if (tasks.some(t=>t.state==="blocked")) calcStatus = "red";
        else if (tasks.some(t=>t.state==="inprogress")) calcStatus = "yellow";
        return { id:proj.id, name:proj.name, type:proj.client||"proyecto", status:calcStatus, dbStatus:proj.status, tasks };
      });

      setClients(mapped);
      if (mapped.length > 0 && !activeClient) setActiveClient(mapped.find(c=>c.dbStatus!=='archived')?.id || mapped[0].id);
    } catch (e) { console.error("sync error:", e); }
    setLoaded(true); setSaving(false);
  }, [activeClient, session.role, session.user]);

  useEffect(() => { if (session.loggedIn) syncPipeline(); }, [session.loggedIn, syncPipeline]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const match = ACCESS_CODES_STATIC[accessCode.trim().toLowerCase()];
    if (match) { setSession({ loggedIn:true, ...match }); setLoginError(false); } else { setLoginError(true); }
  };

  const cycleState = async (cid, tid) => {
    const t = clients.find(c => c.id === cid)?.tasks.find(x => x.id === tid);
    if (!t) return;
    let next = STATE_CYCLE[t.state] || "pending";
    let reason = null;
    if (next === "blocked") { reason = prompt("Motivo del bloqueo:"); if (!reason) return; }
    setSaving(true);
    try { await supabase.from("tasks").update({ status:next, blocked_reason:reason||null }).eq("id", tid); await syncPipeline(); } catch (e) { console.error(e); }
  };

  const completeTask = async (tid) => {
    setSaving(true);
    try { await supabase.from("tasks").update({ status:"done", updated_at: new Date().toISOString() }).eq("id", tid); await syncPipeline(); } catch (e) { console.error(e); }
  };

  const restoreTask = async (tid) => {
    setSaving(true);
    try { await supabase.from("tasks").update({ status:"pending", updated_at: new Date().toISOString() }).eq("id", tid); await syncPipeline(); } catch (e) { console.error(e); }
  };

  const cyclePrio = async (cid, tid, cur) => {
    const next = PRIO_CYCLE[(PRIO_CYCLE.indexOf(cur)+1) % PRIO_CYCLE.length];
    setSaving(true);
    try { await supabase.from("tasks").update({ priority:next }).eq("id", tid); await syncPipeline(); } catch (e) { console.error(e); }
  };

  const cycleWho = async (cid, tid, cur) => {
    const nextWho = WHO_LIST[(WHO_LIST.indexOf(cur)+1) % WHO_LIST.length];
    const member = teamMembers.find(m => m.name === toDbName(nextWho));
    setSaving(true);
    try { await supabase.from("tasks").update({ assigned_to: member?.id }).eq("id", tid); await syncPipeline(); } catch (e) { console.error(e); }
  };

  const updateTitle = async (tid, newTitle) => {
    setSaving(true);
    try { await supabase.from("tasks").update({ title: newTitle }).eq("id", tid); await syncPipeline(); } catch (e) { console.error(e); }
  };

  const deleteTask = async (tid, e) => {
    e.stopPropagation(); if (!confirm("¿Eliminar tarea permanentemente?")) return;
    setSaving(true); try { await supabase.from("tasks").delete().eq("id", tid); await syncPipeline(); } catch (e) { console.error(e); }
  };

  const addTask = async (cid) => {
    if (!newTask.text.trim()) return; setSaving(true);
    try {
      const member = teamMembers.find(m => m.name === toDbName(newTask.who));
      await supabase.from("tasks").insert([{ org_id: ORG_ID, project_id: cid, title: newTask.text.trim(), status: "pending", priority: newTask.priority, assigned_to: member?.id, task_type: newTask.category }]);
      setNewTask({ text:"", who:"EK", priority:"medium", category:"🔥" }); await syncPipeline();
    } catch (e) { console.error(e); }
  };

  const isAdmin = session.role === "admin" || session.role === "superadmin";
  const allPend = clients.reduce((acc, c) => acc + (c.tasks ? c.tasks.filter(t => t.state !== "done").length : 0), 0);
  const blockedAll = clients.flatMap(c => c.tasks ? c.tasks.filter(t => t.state === "blocked").map(t => ({ ...t, cname: c.name, cid: c.id })) : []);
  const allDone = clients.flatMap(c => c.tasks ? c.tasks.filter(t => t.state === "done").map(t => ({ ...t, cname: c.name })) : []);
  const weekGroups = groupDoneByWeek([...allDone]);

  const adminProjects   = clients.filter(c => c.type === "admin" || c.name.toLowerCase().includes("admin"));
  const regularProjects = clients.filter(c => !adminProjects.some(a => a.id === c.id));
  const client          = clients.find(c => c.id === activeClient) || regularProjects[0] || adminProjects[0];

  const rowProps = { teamMembers, onCycleState: cycleState, onCycleWho: cycleWho, onCyclePrio: cyclePrio, onCompleteTask: completeTask, onRestoreTask: restoreTask, onDeleteTask: deleteTask, onUpdateTitle: updateTitle, isAdmin };
  const inpStyle = { background:thm.inputBg, border:`1px solid ${thm.border}`, borderRadius:8, color:thm.text, fontSize:12, padding:"9px 12px", outline:"none" };
  const navBtn = (id, label, accentColor) => ( <button className="nav-btn" key={id} onClick={()=>setView(id)} style={{ background:view===id?(accentColor||thm.accentBg):"transparent", color:view===id?(accentColor?"#080a0e":thm.accentText):thm.textSub }}>{label}</button> );

  const totalActiveEquipo = clients.flatMap(c=>c.tasks ? c.tasks.filter(t=>t.state!=="done") : []).length || 1;
  let currentDeg = 0;
  const pieGradientParts = teamMembers.map(m => {
     const mActive = clients.flatMap(c=>c.tasks ? c.tasks.filter(t=>t.state!=="done" && t.who === toWho(m.name)) : []).length;
     const pct = (mActive / totalActiveEquipo) * 100; if (pct === 0) return null;
     const color = getMemberColor(m.name); const start = currentDeg; currentDeg += pct;
     return `${color} ${start}% ${currentDeg}%`;
  }).filter(Boolean).join(", ");
  const pieStyle = { width: 140, height: 140, borderRadius: "50%", background: pieGradientParts ? `conic-gradient(${pieGradientParts})` : thm.border, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 24px rgba(0,0,0,0.5)" };
  const timeStr = now.toLocaleDateString("es-MX", { weekday:"short", day:"2-digit", month:"short" }) + " · " + now.toLocaleTimeString("es-MX", { hour:"2-digit", minute:"2-digit" });

  // ── PANTALLA LOGIN v24 ──
  if (!session.loggedIn) {
    const currentDate = now.toLocaleDateString("es-MX", { weekday:"long", day:"2-digit", month:"long", year:"numeric" });
    return (
      <div style={{ height:"100vh", background:thm.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:font }}>
        <form onSubmit={handleLogin} className="fade-up" style={{ background:thm.surface, padding:40, borderRadius:16, border:`1px solid ${thm.border}`, width:"100%", maxWidth:360, textAlign:"center" }}>
          <div className="font-serif" style={{ fontSize:26, marginBottom:6, color:"#eef0f3" }}>VERSIONA<span style={{ color:"#F47920" }}>O</span><span style={{ color:"#29ABE2", fontStyle:"italic" }}>S</span></div>
          <div style={{ fontSize:10, color:thm.textMuted, letterSpacing:2, marginBottom:6, textTransform:"uppercase" }}>Workspace de Producción</div>
          <div style={{ fontSize:11, color:thm.textMuted, marginBottom:32, textTransform:"capitalize" }}>{currentDate}</div>
          <div style={{ position:"relative", marginBottom:10 }}>
            <input type={showPass ? "text" : "password"} value={accessCode} onChange={e => setAccessCode(e.target.value)} placeholder="Código de acceso" autoFocus style={{ width:"100%", background:thm.inputBg, border:`1px solid ${loginError?"#f87171":thm.border}`, borderRadius:8, padding:"12px 40px 12px 12px", color:thm.text, fontSize:14, outline:"none", textAlign:"center", letterSpacing:2 }}/>
            <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>{showPass ? "🙈" : "👁"}</button>
          </div>
          {loginError && <div style={{ fontSize:11, color:"#f87171", marginBottom:12, fontWeight:700 }}>CÓDIGO INVÁLIDO</div>}
          <button type="submit" style={{ width:"100%", background:thm.text, color:thm.bg, border:"none", borderRadius:8, padding:12, fontSize:12, fontWeight:700, cursor:"pointer", letterSpacing:1, textTransform:"uppercase" }}>Acceder al Flujo</button>
          <div style={{ marginTop:20, fontSize:10, color:thm.textMuted }}>
            ¿Sin código? → <a href="mailto:contacto.diegobeltran@gmail.com?subject=Acceso Versiona OS" style={{ color:"#F47920", textDecoration:"none", fontWeight:700 }}>Solicitar al admin</a>
          </div>
        </form>
      </div>
    );
  }

  if (!loaded) return <div style={{ height:"100vh", background:thm.bg, display:"flex", alignItems:"center", justifyContent:"center", color:thm.textMuted, fontSize:12, letterSpacing:3, fontFamily:font }}>SISTEMA INICIADO...</div>;

  return (
    <div style={{ minHeight:"100vh", background:thm.bg, color:thm.text, display:"flex", flexDirection:"column", fontFamily:font }}>
      {/* ── HEADER ORIGINAL v24 ── */}
      <div style={{ borderBottom: `1px solid ${thm.border}`, padding: "0 24px", display:"flex", alignItems:"center", height: 60, flexShrink: 0, background: thm.navBg, gap: 16 }}>
        <div className="font-serif" style={{ fontSize: 19, letterSpacing: .5, flexShrink: 0 }}>VERSIONA<span style={{ color: "#F47920" }}>O</span><span style={{ color: "#29ABE2", fontStyle: "italic" }}>S</span></div>
        <div style={{ display: "flex", gap: 3, background: thm.surfaceTop, borderRadius: 10, padding: 3, overflowX: "auto", flex: 1, maxWidth: 850 }}>
          {navBtn("dashboard", "Proyectos")}
          {isAdmin && navBtn("equipo", "Equipo", "#29ABE2")}
          {isAdmin && navBtn("completadas", "✓ Análisis Semanal", "#4ade80")}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginLeft: "auto", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className="live-dot" />
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: session.user === "Diego" ? "#F47920" : "#29ABE2" }}>
                {session.user} <span style={{ fontSize: 9, color: thm.textMuted, fontWeight: 400, background: thm.surfaceTop, padding: "2px 6px", borderRadius: 4, border: `1px solid ${thm.border}`, textTransform: "uppercase", letterSpacing: 1 }}>{session.role}</span>
              </div>
              <div style={{ fontSize: 9, color: thm.textMuted }}>{saving ? <span style={{ color: "#facc15" }}>guardando...</span> : <span>{timeStr}</span>}</div>
            </div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: thm.surfaceHigh, border: `1px solid ${session.user === "Diego" ? "#F47920" : "#29ABE2"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: session.user === "Diego" ? "#F47920" : "#29ABE2", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
            {(session.user || "U").charAt(0).toUpperCase()}
          </div>
          <button onClick={() => setSession({ loggedIn:false, role:null, user:null })} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>Salir →</button>
        </div>
      </div>

      {/* STRIP CONTADORES */}
      <div style={{ display:"flex", borderBottom:`1px solid ${thm.border}`, background:thm.navBg }}>
        {[{ l:"Activas", v:allPend, c:thm.text }, { l:"Bloqueadas", v:blockedAll.length, c:"#f87171" }, { l:"Listas", v:allDone.length, c:"#4ade80" }].map((k,i) => (
          <div key={i} style={{ flex:1, padding:"10px 8px", textAlign:"center", borderRight:i<2?`1px solid ${thm.border}`:"none" }}>
            <div style={{ fontSize:18, fontWeight:700, color:k.c }}>{k.v}</div>
            <div style={{ fontSize:8, color:thm.textMuted, marginTop:2 }}>{k.l}</div>
          </div>
        ))}
      </div>

      {/* CORE VIEWPORT */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        {view === "dashboard" && (
          <>
            <div style={{ width:"240px", borderRight:`1px solid ${thm.border}`, overflowY:"auto", background:thm.surface, flexShrink:0 }}>
              {adminProjects.length > 0 && (
                <div style={{ borderBottom:`1px solid ${thm.border}`, paddingBottom:8, marginBottom:4 }}>
                  <div style={{ padding:"10px 15px 4px", fontSize:8, color:thm.textMuted, letterSpacing:1.5, textTransform:"uppercase", fontWeight:600 }}>⚙️ operación interna</div>
                  {adminProjects.map(c => (
                    <button key={c.id} onClick={() => { setActiveClient(c.id); setShowDone(false); }} style={{ width:"100%", textAlign:"left", padding:"9px 15px", background:c.id===client?.id?thm.surfaceHigh:"transparent", border:"none", borderLeft:c.id===client?.id?"3px solid #c49a2a":"3px solid transparent", cursor:"pointer", color:c.id===client?.id?thm.text:thm.textMuted, fontSize:12 }}>⚙️ {c.name}</button>
                  ))}
                </div>
              )}
              <div style={{ padding:"10px 15px 4px", fontSize:8, color:thm.textMuted, letterSpacing:1.5, textTransform:"uppercase", fontWeight:600 }}>Clientes Activos</div>
              {regularProjects.map(c => (
                <button key={c.id} onClick={() => { setActiveClient(c.id); setShowDone(false); }} style={{ width:"100%", textAlign:"left", padding:"9px 15px", background:c.id===client?.id?thm.surfaceHigh:"transparent", border:"none", borderLeft:c.id===client?.id?`3px solid ${STA_CLR[c.status]}`:"3px solid transparent", cursor:"pointer", color:c.id===client?.id?thm.text:thm.textSub, fontSize:12 }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <span>{c.name}</span>
                    {c.tasks.filter(t=>t.state!=="done").length > 0 && <span style={{ fontSize:9, color:thm.textMuted }}>{c.tasks.filter(t=>t.state!=="done").length}</span>}
                  </div>
                </button>
              ))}
            </div>

            <div style={{ flex:1, overflowY:"auto", padding:"28px 36px", background:thm.bg }}>
              {client ? (
                <>
                  <h2 className="font-serif" style={{ margin:"0 0 20px 0", fontSize:28 }}>{client.name}</h2>
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    {client.tasks.filter(t => t.state !== "done").map((task, idx) => <TaskRow key={task.id} task={task} cid={client.id} index={idx} {...rowProps}/>)}
                  </div>
                  <div style={{ display:"flex", gap:6, marginTop:20 }}>
                    <input value={newTask.text} onChange={e => setNewTask(p => ({ ...p, text: e.target.value.slice(0, MAX_TASK_LEN) }))} onKeyDown={e => e.key === "Enter" && addTask(client.id)} placeholder="Añadir nueva actividad..." style={{ ...inpStyle, flex:1 }}/>
                    <select value={newTask.who} onChange={e => setNewTask(p => ({ ...p, who: e.target.value }))} style={inpStyle}>
                      {WHO_LIST.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                    <select value={newTask.priority} onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))} style={inpStyle}>
                      <option value="high">Alta</option> <option value="medium">Media</option> <option value="low">Baja</option>
                    </select>
                    <button onClick={() => addTask(client.id)} style={{ background:thm.accentBg, color:thm.accentText, border:"none", borderRadius:8, padding:"9px 18px", fontWeight:700, cursor:"pointer" }}>+</button>
                  </div>
                </>
              ) : (
                <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: thm.textMuted, fontSize: 13, border: `1px dashed ${thm.border}`, borderRadius: 12 }}>
                  No hay proyectos activos. Verifica la sincronización.
                </div>
              )}
            </div>
          </>
        )}

        {view === "equipo" && isAdmin && <TeamTab teamMembers={teamMembers} clients={clients} totalActiveEquipo={totalActiveEquipo} pieStyle={pieStyle} />}
        {view === "completadas" && isAdmin && <AnalysisTab clients={clients} allDone={allDone} teamMembers={teamMembers} weekGroups={weekGroups} />}
      </div>
    </div>
  );
}