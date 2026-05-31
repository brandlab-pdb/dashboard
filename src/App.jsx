/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";
import { ORG_ID, WIP_LIMIT, MAX_TASK_LEN, WHO_LIST, TYPES, PRIO_ORDER, PRIO_CYCLE, TASK_CATS, CREATIVE_SERVICES_CATALOG, STATE_CYCLE, thm, STA_CLR, PRIO_CLR, PRIO_LBL, ACCESS_CODES_STATIC, daysSince, deadlineInfo, toWho, toDbName, getMemberColor, getWeekKey, groupDoneByWeek, sortProjects, injectStyles, font } from "./utils";

// ── UI SUBCOMPONENTES INTERNOS ─────────────────────────────────────────────
function WhoChip({ member, onClick }) {
  if (!member) return null;
  const color = getMemberColor(member.name);
  return (
    <button className="btn-action" onClick={onClick} style={{ padding:"3px 10px", borderRadius:20, fontSize:10, fontWeight:700, background:`${color}1A`, color:color, border:`1px solid ${color}33`, cursor:onClick?"pointer":"default" }}>
      {member.name}
    </button>
  );
}

function StatePill({ state, onClick }) {
  const s = thm.states[state] || thm.states.pending;
  return (
    <button className="btn-action" onClick={state==="done"?null:onClick} style={{ padding:"3px 10px", borderRadius:20, fontSize:10, fontWeight:700, background:s.bg, color:s.text, border:`1px solid ${s.border}`, cursor:state==="done"?"default":"pointer" }}>
      {s.label}
    </button>
  );
}

function PrioPill({ priority, onClick }) {
  const c = { high:{bg:thm.states.blocked.bg,text:thm.states.blocked.text,border:thm.states.blocked.border}, medium:{bg:thm.states.inprogress.bg,text:thm.states.inprogress.text,border:thm.states.inprogress.border}, low:{bg:thm.states.done.bg,text:thm.states.done.text,border:thm.states.done.border} }[priority] || {bg:"#222",text:"#888",border:"rgba(255,255,255,0.1)"};
  return (
    <button className="btn-action" onClick={onClick} style={{ padding:"3px 8px", borderRadius:20, fontSize:9, fontWeight:700, background:c.bg, color:c.text, border:`1px solid ${c.border}`, cursor:"pointer" }}>
      {PRIO_LBL[priority]||priority}
    </button>
  );
}

function DlBadge({ deadline }) {
  const info = deadlineInfo(deadline);
  if (!info) return null;
  const s = info.status==="due" ? thm.dlDue : info.status==="soon" ? thm.dlSoon : null;
  return (
    <span style={{ fontSize:9, fontWeight:700, color:s?s.text:thm.dlOk.text, background:s?.bg||"transparent", padding:s?"3px 8px":"0", borderRadius:20, border:s?`1px solid ${s.border}`:"none" }}>
      {info.label}
    </span>
  );
}

function WeeklyChart({ allDone }) {
  if (!allDone || !Array.isArray(allDone)) return null;
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
      <div style={{ fontSize:10, color:thm.textMuted, letterSpacing:1.5, textTransform:"uppercase", fontWeight:700, marginBottom:14 }}>Entregas completadas por semana</div>
      <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:BAR_H + 36 }}>
        {data.map(([key, w], i) => {
          const barH = Math.max(4, (w.count / max) * BAR_H);
          const opacity = 0.55 + (i / Math.max(data.length - 1, 1)) * 0.45;
          return (
            <div key={key} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4, height:"100%", justifyContent:"flex-end" }}>
              <span style={{ fontSize:9, color:"#4ade80", fontWeight:700 }}>{w.count}</span>
              <div style={{ width:"100%", borderRadius:"3px 3px 0 0", background:`rgba(74,222,128,${opacity})`, height:`${barH}px`, transition:"height 0.6s cubic-bezier(0.16,1,0.3,1)", boxShadow:`0 0 8px rgba(74,222,128,${opacity * 0.5})` }}/>
              <span style={{ fontSize:8, color:thm.textMuted, textAlign:"center", lineHeight:1.2, maxWidth:"100%", overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>{w.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TaskRow({ task, cid, teamMembers, activeProjectsList, onCycleState, onCycleWho, onCyclePrio, onCompleteTask, onRestoreTask, onUpdateTitle, onDeleteTask, onArchiveTask, onChangeTaskProject, onSetDl, editingDl, setEditingDl, index, isAdmin }) {
  const isDone = task.state === "done";
  const days = task.state === "blocked" ? daysSince(task.blockedSince) : 0;
  const member = teamMembers.find(m => m.id === task.assigned_to);
  const [isEditing, setIsEditing] = useState(false);
  const [titleInput, setTitleInput] = useState(task.text);

  const handleEditSubmit = () => { setIsEditing(false); if (titleInput.trim() !== task.text) onUpdateTitle(task.id, titleInput); };
  const revOver = (task.revisions || 0) >= 2;

  return (
    <div className="task-row fade-up" style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 18px", background:isDone ? thm.surfaceHigh : thm.surface, borderRadius:10, border:`1px solid ${isDone ? thm.borderLight : thm.border}`, borderLeft:`3px solid ${isDone ? thm.borderLight : PRIO_CLR[task.priority]||"#facc15"}`, opacity:isDone ? .4 : 1, marginBottom:6 }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
          {task.service_id && <span style={{fontSize:9, background:"rgba(192,132,252,0.1)", color:"#c084fc", border:"1px solid rgba(192,132,252,0.2)", padding:"2px 6px", borderRadius:4, fontWeight:700, textTransform:"uppercase"}}>SERVICIO</span>}
          {task.category && <span style={{ fontSize:13 }}>{task.category}</span>}
          {isEditing ? (
            <input value={titleInput} onChange={e => setTitleInput(e.target.value)} onBlur={handleEditSubmit} onKeyDown={e => { if (e.key === "Enter") handleEditSubmit(); if(e.key === "Escape") setIsEditing(false); }} autoFocus style={{ background: "#0a0c10", border: `1px solid ${thm.border}`, color: thm.text, fontSize: 13, padding: "2px 8px", borderRadius: 4, width: "100%", outline: "none" }} />
          ) : (
            <span style={{ fontSize:13, color:isDone?thm.textMuted:thm.text, textDecoration:isDone?"line-through":"none", fontWeight:500, lineHeight:1.4 }}>{task.text}</span>
          )}
          {!isDone && isAdmin && !isEditing && <button onClick={() => { setIsEditing(true); setTitleInput(task.text); }} style={{ background:"none", border:"none", cursor:"pointer", opacity:0.5, fontSize:12 }}>✏️</button>}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
          {!isDone && <StatePill state={task.state} onClick={() => onCycleState(cid, task.id)}/>}
          <PrioPill priority={task.priority} onClick={() => onCyclePrio(cid, task.id, task.priority)} />
          <WhoChip member={member} onClick={() => onCycleWho(cid, task.id, member?.id)} />
          {!isDone && <button className="btn-action" onClick={() => onCompleteTask(task.id)} style={{ padding:"3px 10px", background:"rgba(74,222,128,0.12)", color:"#4ade80", border:"1px solid rgba(74,222,128,0.25)", borderRadius:20, fontSize:10, fontWeight:700, cursor:"pointer" }}>✓ Terminar</button>}
          {isDone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize:9, color:"#4ade80", background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.2)", padding:"3px 8px", borderRadius:20, fontWeight:600 }}>✓ Listo</span>
              <button className="btn-action" onClick={() => onRestoreTask(task.id)} style={{ padding:"3px 8px", background:"none", color:thm.textSub, border:`1px solid ${thm.border}`, borderRadius:20, fontSize:10, fontWeight:600, cursor:"pointer" }}>↺ Reabrir</button>
            </div>
          )}
          {!isDone && (editingDl === task.id ? (
            <input type="date" defaultValue={task.deadline||""} autoFocus onBlur={e => onSetDl(task.id, e.target.value)} onKeyDown={e => { if(e.key==="Enter") onSetDl(task.id,e.target.value); if(e.key==="Escape") setEditingDl(null); }} style={{ fontSize:10, color:thm.text, background:thm.inputBg, border:`1px solid ${thm.border}`, borderRadius:6, padding:"2px 6px", outline:"none" }}/>
          ) : task.deadline ? (
            <button onClick={() => setEditingDl(task.id)} style={{ background:"none", border:"none", padding:0, cursor:"pointer" }}><DlBadge deadline={task.deadline}/></button>
          ) : (
            <button onClick={() => setEditingDl(task.id)} style={{ fontSize:9, color:thm.textFaint, background:"none", border:`1px dashed ${thm.border}`, borderRadius:20, padding:"2px 8px", cursor:"pointer" }}>+ fecha</button>
          ))}
          {days>0 && <span style={{ fontSize:9, color:days>=3?"#f87171":"#facc15", fontWeight:700 }}>⊘ Pausado {days}d</span>}
          {revOver && <span style={{ fontSize:9, color:"#f87171", fontWeight:700 }}>⚠ {task.revisions} rev</span>}
          
          {isAdmin && !isDone && (
            <select value={cid} onChange={e => onChangeTaskProject(task.id, e.target.value)} style={{ background: thm.surfaceHigh, border: `1px solid ${thm.border}`, color: thm.textSub, fontSize: 10, padding: "2px 6px", borderRadius: 4, cursor: "pointer" }}>
              {activeProjectsList.map(p => <option key={p.id} value={p.id}>→ {p.name}</option>)}
            </select>
          )}
        </div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginLeft:"auto", flexShrink:0 }}>
        <button className="btn-action" onClick={(e) => { e.stopPropagation(); onArchiveTask(task.id, task.text); }} style={{ background:"none", border:`1px solid ${thm.border}`, borderRadius:6, padding:"4px 8px", cursor:"pointer", fontSize:11, opacity:0.6 }} title="Archivar Actividad">📥</button>
        <button className="btn-action" onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id, task.text); }} style={{ fontSize:10, color:thm.textFaint, background:"none", border:`1px solid ${thm.borderLight}`, borderRadius:5, padding:"4px 8px", cursor:"pointer" }}>✕</button>
      </div>
    </div>
  );
}

// ── MAIN APP ENGINE ────────────────────────────────────────────────────────
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
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [activeClient,  setActiveClient]  = useState(null);
  const [showForm,      setShowForm]      = useState(false);
  const [showDone,      setShowDone]      = useState(false);
  const [editingDl,     setEditingDl]     = useState(null);
  const [newTask,       setNewTask]       = useState({ text:"", whoId:"", priority:"medium", category:"🔥", projectId:null, is_service:false, service_id:"" });
  const [orderCriteria, setOrderCriteria] = useState("default");
  
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectData, setNewProjectData] = useState({ name:"", type:"membresía" });
  const [newMemberName,  setNewMemberName]  = useState("");
  const [showNewMember,  setShowNewMember]  = useState(false);
  const [feedbackMsg,    setFeedbackMsg]    = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [waBriefs,       setWaBriefs]       = useState(null);
  const [projectFilterTab, setProjectFilterTab] = useState("active");
  const [securityLogs,   setSecurityLogs]   = useState([]);

  const [dbAccessCodes,  setDbAccessCodes]  = useState([]);
  const [newCodeForm,    setNewCodeForm]    = useState({ code:"", user_name:"", role:"team" });
  const [showNewCode,    setShowNewCode]    = useState(false);

  // Estados para Auditoría Semanal
  const [auditWin, setAuditWin] = useState("");
  const [auditWarn, setAuditWarn] = useState("");
  const [auditRisk, setAuditRisk] = useState("");

  const [now, setNow] = useState(new Date());
  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(timer); }, []);
  useEffect(() => { injectStyles(); }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const code = accessCode.trim().toLowerCase();
    let match = null;
    try {
      const { data: dbCode, error } = await supabase.from("access_codes").select("*").eq("code", code).eq("is_active", true).maybeSingle();
      if (dbCode && !error) {
        match = { role: dbCode.role, user: dbCode.user_name };
        await supabase.from("access_codes").update({ last_login: new Date().toISOString() }).eq("code", code);
      }
    } catch (err) { console.warn("Fallback local de login."); }

    if (!match) match = ACCESS_CODES_STATIC[code];
    if (match) {
      setSession({ loggedIn:true, ...match }); setLoginError(false);
      try { 
        await supabase.from("security_logs").insert([{ org_id: ORG_ID, user_name: match.user, role: match.role, action_type: "login" }]); 
      } catch (e) {
        try { await supabase.from("security_logs").insert([{ user_name: match.user, action_type: "login" }]); } catch(err){}
      }
    } else { setLoginError(true); }
  };

  const handleLogout = async () => {
    try { 
      await supabase.from("security_logs").insert([{ org_id: ORG_ID, user_name: session.user, role: session.role, action_type: "logout" }]); 
    } catch (e) {
      try { await supabase.from("security_logs").insert([{ user_name: session.user, action_type: "logout" }]); } catch(err){}
    }
    alert("¡Buen trabajo! Gracias por tu esfuerzo hoy en la matriz. Nos vemos en la próxima sesión. 🚀");
    setSession({ loggedIn:false, role:null, user:null }); setAccessCode(""); setLoaded(false);
  };

  const syncPipeline = useCallback(async () => {
    setSaving(true);
    try {
      const { data:dbMembers }  = await supabase.from("team_members").select("*").order("created_at");
      const { data:dbProjects } = await supabase.from("projects").select("*");
      const { data:dbTasks }    = await supabase.from("tasks").select("*");

      if (session.role === "admin" || session.role === "superadmin") {
         try {
            const { data: dbFeedback } = await supabase.from("feedback_items").select("*").order("created_at", { ascending: false });
            setFeedbackItems(dbFeedback || []);
         } catch(e) { console.warn("Módulo de feedback desconectado temporalmente"); }

         try {
            const { data: dbLogs } = await supabase.from("security_logs").select("user_name, role, action_type, created_at").order("created_at", { ascending: false }).limit(20);
            setSecurityLogs(dbLogs || []);
         } catch(e) { console.warn("Módulo de auditoría desconectado temporalmente"); }

         try {
            const { data: dbCodes } = await supabase.from("access_codes").select("*").order("created_at", { ascending: false });
            setDbAccessCodes(dbCodes || []);
         } catch(acErr) { console.warn("Bóveda de claves en fallback estático"); }
      }
      
      setTeamMembers(dbMembers || []);
      if (dbMembers && dbMembers.length > 0 && !newTask.whoId) setNewTask(prev => ({ ...prev, whoId: dbMembers[0].id }));

      const isUserAdmin = session.role === "admin" || session.role === "superadmin";

      const mapped = (dbProjects || []).map(proj => {
        let tasks = (dbTasks || []).filter(t => t.project_id === proj.id).map(t => ({
          id: t.id, text: t.title, assigned_to: t.assigned_to, state: t.status, priority: t.priority, category: t.task_type || "🔥", is_session: t.is_session || false, service_id: t.service_id || null, blockedSince: t.status === "blocked" ? t.updated_at : null, completedAt: t.status === "done" ? t.updated_at : null, deadline: t.deadline, blocked_reason: t.blocked_reason, revisions: t.revisions || 0,
        }));
        
        if (!isUserAdmin) {
          tasks = tasks.filter(t => { const m = dbMembers?.find(mem => mem.id === t.assigned_to); return m && toWho(m.name) === toWho(session.user); });
        }

        let calcStatus = "green";
        if (tasks.some(t=>t.state==="blocked")) calcStatus = "red";
        else if (tasks.some(t=>t.state==="inprogress")) calcStatus = "yellow";
        
        return { id:proj.id, name:proj.name, type:proj.client || "membresía", status:calcStatus, dbStatus:proj.status, cost: proj.service_cost || 0, cycle: proj.billing_cycle || "mensual", cutoff: proj.cutoff_date || 1, tasks };
      });

      setClients(mapped);
      if (mapped.length > 0 && !activeClient) setActiveClient(mapped.find(c=>c.dbStatus!=='archived')?.id || mapped[0].id);
    } catch (e) { console.error("sync error:", e); }
    setLoaded(true); setSaving(false);
  }, [activeClient, newTask.whoId, session.role, session.user]);

  useEffect(() => { if (session.loggedIn) syncPipeline(); }, [session.loggedIn, syncPipeline]);

  const verifyGatedAction = async (actionLabel, taskText) => {
    if (session.role === "admin" || session.role === "superadmin") return true;
    const code = prompt(`Mesa de Control: Introduce tu código de Administrador para ${actionLabel} la actividad "${taskText}":`);
    if (!code) return false;
    const match = ACCESS_CODES_STATIC[code.trim().toLowerCase()];
    if (match && (match.role === "admin" || match.role === "superadmin")) {
      try {
        await supabase.from("feedback_items").insert([{
          org_id: ORG_ID,
          user_name: session.user || "Equipo",
          message: `[Acción Protegida] Se autorizó por código la acción de [${actionLabel}] en la actividad: "${taskText}".`,
          status: "open"
        }]);
      } catch (err) {}
      return true;
    }
    alert("Código incorrecto. Acción cancelada por seguridad.");
    return false;
  };

  const cycleState = async (cid, tid) => {
    const c = clients.find(c=>c.id===cid);
    const t = c?.tasks.find(x=>x.id===tid);
    if (!t) return;
    let next = STATE_CYCLE[t.state] || "pending";
    if (next === "done") return completeTask(tid);

    let reason = null;
    if (next === "blocked") { reason = prompt("Motivo del bloqueo / pausa de contenido:"); if (!reason) return; }
    setSaving(true);
    try {
      if (next === "in_review") { await supabase.from("review_cycles").insert([{ org_id: ORG_ID, task_id: tid, project_id: cid, status: "open", submitted_by: t.assigned_to }]); }
      await supabase.from("tasks").update({ status:next, blocked_reason:reason||null }).eq("id", tid);
      await syncPipeline();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const completeTask = async (tid) => {
    setSaving(true);
    try {
      const nowTime = new Date().toISOString();
      await supabase.from("tasks").update({ status:"done", updated_at:nowTime }).eq("id", tid);
      await supabase.from("review_cycles").update({ status:"approved", reviewed_at:nowTime }).eq("task_id", tid).eq("status","open");
      await syncPipeline();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const restoreTask = async (tid) => {
    setSaving(true);
    try { await supabase.from("tasks").update({ status:"pending", updated_at: new Date().toISOString() }).eq("id", tid); await syncPipeline(); } catch (e) { console.error(e); }
    setSaving(false);
  };

  const archiveTask = async (tid, text) => {
    const authorized = await verifyGatedAction("Archivar", text);
    if (!authorized) return;
    setSaving(true);
    try {
      await supabase.from("tasks").update({ status: "archived", updated_at: new Date().toISOString() }).eq("id", tid);
      await syncPipeline();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const changeTaskProject = async (tid, newProjectId) => {
    setSaving(true);
    try {
      await supabase.from("tasks").update({ project_id: newProjectId }).eq("id", tid);
      await syncPipeline();
    } catch(e) { console.error(e); }
    setSaving(false);
  };

  const cyclePrio = async (cid, tid, cur) => {
    const next = PRIO_CYCLE[(PRIO_CYCLE.indexOf(cur)+1) % PRIO_CYCLE.length];
    setSaving(true);
    try { await supabase.from("tasks").update({ priority:next }).eq("id", tid); await syncPipeline(); } catch (e) { console.error(e); }
    setSaving(false);
  };

  const cycleWho = async (cid, tid, curMemberId) => {
    const currentIndex = teamMembers.findIndex(m => m.id === curMemberId);
    const nextMember = teamMembers[(currentIndex + 1) % teamMembers.length];
    setSaving(true);
    try { await supabase.from("tasks").update({ assigned_to: nextMember.id }).eq("id", tid); await syncPipeline(); } catch (e) { console.error(e); }
    setSaving(false);
  };

  const updateTitle = async (tid, newTitle) => {
    setSaving(true);
    try { await supabase.from("tasks").update({ title: newTitle }).eq("id", tid); await syncPipeline(); } catch (e) { console.error(e); }
    setSaving(false);
  };

  const setDl = async (tid, dl) => {
    setSaving(true);
    try { await supabase.from("tasks").update({ deadline:dl||null }).eq("id", tid); setEditingDl(null); await syncPipeline(); } catch (e) { console.error(e); }
    setSaving(false);
  };

  const addTask = async () => {
    const targetProjectId = newTask.projectId || activeClient;
    if (!targetProjectId || !newTask.text.trim()) { alert("Selecciona un proyecto primero."); return; }
    setSaving(true);
    try {
      const payload = { org_id: ORG_ID, project_id: targetProjectId, title: newTask.text.trim(), status: "pending", priority: newTask.priority, assigned_to: newTask.whoId || teamMembers[0]?.id || null, task_type: newTask.category };
      if (newTask.is_service && newTask.service_id) payload.service_id = newTask.service_id;
      await supabase.from("tasks").insert([payload]);
      setNewTask(p => ({ ...p, text:"", is_service: false, service_id:"" })); setShowForm(false); await syncPipeline();
    } catch (e) { console.error("Error al guardar:", e); }
    setSaving(false);
  };

  const deleteTask = async (tid, text) => {
    const authorized = await verifyGatedAction("Eliminar permanentemente", text);
    if (!authorized) return;
    setSaving(true);
    try { await supabase.from("tasks").delete().eq("id", tid); await syncPipeline(); } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault(); if(!feedbackMsg.trim()) return; setSaving(true);
    const msgLower = feedbackMsg.toLowerCase();
    let computedType = "Operación";
    if (msgLower.includes("falla") || msgLower.includes("bug") || msgLower.includes("error") || msgLower.includes("no carga")) {
      computedType = "Soporte Técnico";
    } else if (msgLower.includes("cliente") || msgLower.includes("marca") || msgLower.includes("cambio")) {
      computedType = "Cliente";
    }
    try { 
      // Enviando con org_id para evitar Error 400
      await supabase.from("feedback_items").insert([{ org_id: ORG_ID, user_name: session.user, message: `[${computedType}] ${feedbackMsg}`, status: "open" }]); 
      setFeedbackMsg(""); setFeedbackSuccess(true); setTimeout(() => setFeedbackSuccess(false), 3000); 
      await syncPipeline();
    } catch (err) {
      try { await supabase.from("feedback_items").insert([{ user_name: session.user, message: `[${computedType}] ${feedbackMsg}`, status: "open" }]); } catch(e){}
    }
    setSaving(false);
  };

  const handleSaveAudit = async () => {
    if (!auditWin.trim() && !auditWarn.trim() && !auditRisk.trim()) return;
    setSaving(true);
    const message = `[Auditoría Semanal]\n🏆 LOGRO: ${auditWin || 'N/A'}\n🚀 AVANCE: ${auditWarn || 'N/A'}\n⚠️ RIESGO: ${auditRisk || 'N/A'}`;
    try {
      await supabase.from("feedback_items").insert([{ org_id: ORG_ID, user_name: session.user, message, status: "open" }]);
      alert("Auditoría guardada exitosamente en el historial del buzón.");
      setAuditWin(""); setAuditWarn(""); setAuditRisk("");
      await syncPipeline();
    } catch (err) {}
    setSaving(false);
  };

  const createProject = async () => {
    if (!newProjectData.name.trim()) return; setSaving(true);
    try { await supabase.from("projects").insert([{ org_id: ORG_ID, name: newProjectData.name.trim(), client: newProjectData.type, status: "active" }]); setNewProjectData({ name:"", type:"membresía" }); setShowNewProject(false); await syncPipeline(); } catch (e) { console.error(e); }
    setSaving(false);
  };

  const archiveProject = async (projectId, projectName) => {
    if (!confirm(`¿Estás seguro de archivar el proyecto "${projectName}"? Se removerá del panel activo.`)) return; 
    setSaving(true);
    try { 
      await supabase.from("projects").update({ status:"archived" }).eq("id", projectId); 
      if (activeClient === projectId) setActiveClient(null); 
      await syncPipeline(); 
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const unarchiveProject = async (projectId) => {
    setSaving(true);
    try { await supabase.from("projects").update({ status:"active" }).eq("id", projectId); await syncPipeline(); } catch(e) { console.error(e); }
    setSaving(false);
  };

  const deleteProject = async (projectId, projectName) => {
    if (!confirm(`⚠ ALERTA MÁXIMA: ¿Estás completamente seguro de ELIMINAR permanentemente el proyecto "${projectName}" y todas sus actividades vinculadas?`)) return;
    setSaving(true);
    try {
      await supabase.from("tasks").delete().eq("project_id", projectId);
      await supabase.from("projects").delete().eq("id", projectId);
      if (activeClient === projectId) setActiveClient(null);
      await syncPipeline();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const addTeamMember = async () => {
    if (!newMemberName.trim()) return; setSaving(true);
    try { await supabase.from("team_members").insert([{ org_id: ORG_ID, name: newMemberName.trim(), role: "team" }]); setNewMemberName(""); setShowNewMember(false); await syncPipeline(); } catch (e) { console.error(e); }
    setSaving(false);
  };

  const editTeamMember = async (id, newName) => {
    if (!newName.trim()) return; setSaving(true);
    try { await supabase.from("team_members").update({ name: newName.trim() }).eq("id", id); await syncPipeline(); } catch (e) { console.error(e); }
    setSaving(false);
  };

  const deleteTeamMember = async (id) => {
    if(!confirm("¿Estás seguro de eliminar este integrante?")) return; setSaving(true);
    try { await supabase.from("team_members").delete().eq("id", id); await syncPipeline(); } catch (e) { console.error(e); }
    setSaving(false);
  };

  const createAccessCode = async (e) => {
    e.preventDefault();
    if (!newCodeForm.code.trim() || !newCodeForm.user_name.trim()) return;
    setSaving(true);
    try {
      await supabase.from("access_codes").insert([{ code: newCodeForm.code.trim().toLowerCase(), user_name: newCodeForm.user_name.trim(), role: newCodeForm.role, is_active: true }]);
      setNewCodeForm({ code:"", user_name:"", role:"team" }); setShowNewCode(false);
      await syncPipeline();
    } catch(err) { console.error(err); }
    setSaving(false);
  };

  const toggleAccessCode = async (id, currentStatus) => {
    setSaving(true);
    try { await supabase.from("access_codes").update({ is_active: !currentStatus }).eq("id", id); await syncPipeline(); } catch(err) {}
    setSaving(false);
  };

  const generateDailyBriefs = () => {
    setWaBriefs({
      Héctor: "🔥 *Versiona Daily Brief · Héctor*\n• Grabar contenido para Reels 🎬.\n• Apoyar en sesión de fotos de producto.",
      Arturo: "📚 *Versiona Daily Brief · Arturo*\n• Cerrar propuesta y estrategia comercial 🚀.\n• Revisar reportes de pauta en Meta Ads.",
      Diego: "🧠 *Versiona Daily Brief · Diego*\n• Monitorear despliegue de Dashboard OS.\n• Revisar mesa de control del equipo."
    });
  };

  // ── DATA ENGINE DERIVADA ──
  const isAdmin         = session.role === "admin" || session.role === "superadmin";
  const isSuperAdmin    = session.role === "superadmin";
  const adminProjects   = clients.filter(c => (c.type==="admin" || c.name.toLowerCase().includes("admin")) && c.dbStatus !== "archived");
  const regularProjects = clients.filter(c => !adminProjects.some(a=>a.id===c.id) && c.dbStatus !== "archived");
  const activeProjects  = regularProjects.filter(c => c.tasks && c.tasks.some(t => t.state !== "done" && t.state !== "archived"));
  const allActiveProjectsList = clients.filter(c => c.dbStatus !== "archived");
  
  const sortedActive = sortProjects(activeProjects);
  const client       = clients.find(c=>c.id===activeClient) || sortedActive[0] || adminProjects[0];
  const blockedAll   = clients.flatMap(c=>c.tasks ? c.tasks.filter(t=>t.state==="blocked").map(t=>({...t,cname:c.name,cid:c.id})) : []);
  
  const getActive = (tasks) => {
    if (!tasks || !Array.isArray(tasks)) return [];
    let list = tasks.filter(t => t.state !== "done" && t.state !== "archived");
    if (orderCriteria === "priority") { list.sort((a, b) => (PRIO_ORDER[a.priority] ?? 1) - (PRIO_ORDER[b.priority] ?? 1)); }
    else if (orderCriteria === "person") { list.sort((a, b) => { const memA = teamMembers.find(m => m.id === a.assigned_to)?.name || ""; const memB = teamMembers.find(m => m.id === b.assigned_to)?.name || ""; return memA.localeCompare(memB); }); }
    return list;
  };

  const getDone = (tasks) => tasks ? tasks.filter(t=>t.state==="done" && t.state !== "archived") : [];
  const getArchivedTasks = () => clients.flatMap(c => (c.tasks || []).filter(t => t.state === "archived").map(t => ({ ...t, cname: c.name, cid: c.id })));

  const allDone      = clients.flatMap(c => getDone(c.tasks).map(t=>({...t, cname:c.name})));
  const weekGroups   = groupDoneByWeek(allDone);
  
  const allPend      = clients.reduce((acc, c) => acc + (c.tasks ? c.tasks.filter(t => t.state !== "done" && t.state !== "archived").length : 0), 0);
  const allBlock     = blockedAll.length;
  const allOver      = clients.reduce((acc, c) => acc + (c.tasks ? c.tasks.filter(t => { const d = deadlineInfo(t.deadline); return d && d.status === "due" && t.state !== "done" && t.state !== "archived"; }).length : 0), 0);

  const navBtn = (id, label, accentColor) => (
    <button className="nav-btn" key={id} onClick={()=>setView(id)} style={{ background:view===id?(accentColor||thm.accentBg):"transparent", color:view===id?(accentColor?"#080a0e":thm.accentText):thm.textSub }}>{label}</button>
  );

  const rowProps = { teamMembers, activeProjectsList: allActiveProjectsList, onCycleState: cycleState, onCycleWho: cycleWho, onCyclePrio: cyclePrio, onCompleteTask: completeTask, onRestoreTask: restoreTask, onDeleteTask: deleteTask, onArchiveTask: archiveTask, onChangeTaskProject: changeTaskProject, onSetDl: setDl, editingDl, setEditingDl, isAdmin };
  const totalActiveTasksGlobal = clients.flatMap(c=>c.tasks ? c.tasks.filter(t=>t.state!=="done" && t.state!=="archived") : []).length;
  const timeStr = now.toLocaleDateString("es-MX", { weekday:"short", day:"2-digit", month:"short" }) + " · " + now.toLocaleTimeString("es-MX", { hour:"2-digit", minute:"2-digit" }); 
  const inpStyle = { background:thm.inputBg, border:`1px solid ${thm.border}`, borderRadius:8, color:thm.text, fontSize:12, padding:"9px 12px", outline:"none" };

  const pieGradientParts = totalActiveTasksGlobal === 0 
    ? "#4ade80 0% 100%" 
    : teamMembers.map((m) => {
        const mActive = clients.flatMap(c => c.tasks ? c.tasks.filter(t => t.assigned_to === m.id && t.state !== "done" && t.state !== "archived") : []).length;
        return { color: getMemberColor(m.name), count: mActive };
      }).reduce((acc, curr) => {
        if (curr.count === 0) return acc;
        const pct = (curr.count / totalActiveTasksGlobal) * 100;
        const start = acc.currSum;
        acc.currSum += pct;
        acc.strings.push(`${curr.color} ${start}% ${acc.currSum}%`);
        return acc;
      }, { strings: [], currSum: 0 }).strings.join(", ");

  // ── PANTALLA LOGIN PREMIUM ──
  if (!session.loggedIn) {
    const currentDate = now.toLocaleDateString("es-MX", { weekday:"long", day:"2-digit", month:"long", year:"numeric" });
    return (
      <div style={{ height:"100vh", background:thm.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:font }}>
        <div className="fade-up" style={{ background:thm.surface, padding:"40px 36px", borderRadius:16, border:`1px solid ${thm.border}`, width:"100%", maxWidth:400, textAlign:"center", boxShadow:"0 20px 40px rgba(0,0,0,0.5)" }}>
          <div className="font-serif" style={{ fontSize:32, marginBottom:10, color:"#eef0f3", letterSpacing:"1px" }}>VERSIONA<span style={{ color:"#F47920" }}>O</span><span style={{ color:"#29ABE2", fontStyle:"italic" }}>S</span></div>
          <div style={{ fontSize:10, color:thm.textMuted, letterSpacing:2, marginBottom:12, textTransform:"uppercase", fontWeight:700 }}>Workspace de Producción</div>
          <div style={{ fontSize:12, color:thm.textSub, marginBottom:32, textTransform:"capitalize" }}>{currentDate}</div>
          
          <form onSubmit={handleLogin} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ position:"relative" }}>
              <input 
                type={showPass ? "text" : "password"} 
                value={accessCode} 
                onChange={e => setAccessCode(e.target.value)} 
                placeholder="Código de acceso" 
                autoFocus 
                style={{ width:"100%", background:thm.inputBg, border:`1px solid ${loginError?"#f87171":thm.border}`, borderRadius:8, padding:"14px 44px 14px 16px", color:thm.text, fontSize:14, outline:"none", letterSpacing:"2px" }}
              />
              <button type="button" className="eye-btn" onClick={() => setShowPass(p=>!p)} style={{ position:"absolute", right:"14px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:thm.textMuted, fontSize:16 }}>
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
            {loginError && <div style={{ fontSize:11, color:"#f87171", fontWeight:700, letterSpacing:"1px", textAlign:"center", marginTop:"4px" }}>CÓDIGO INVÁLIDO</div>}
            <button type="submit" style={{ width:"100%", background:"#eef0f3", color:"#080a0e", border:"none", borderRadius:8, padding:"14px", fontSize:12, fontWeight:700, cursor:"pointer", letterSpacing:"1px", textTransform:"uppercase", transition:"all 0.15s ease", marginTop:"6px" }}>Acceder al Flujo</button>
          </form>
          
          <div style={{ marginTop:24, fontSize:11, color:thm.textMuted }}>
            ¿Sin código? → <a href="mailto:contacto.diegobeltran@gmail.com?subject=Acceso Versiona OS" style={{ color:"#F47920", textDecoration:"none", fontWeight:700 }}>Solicitar al admin</a>
          </div>
        </div>
      </div>
    );
  }

  if (!loaded) return <div style={{ height:"100vh", background:thm.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, fontFamily:font }}><div className="font-serif" style={{ fontSize:22, color:thm.text }}>VERSIONA<span style={{ color:"#F47920" }}>O</span><span style={{ color:"#29ABE2", fontStyle:"italic" }}>S</span></div><div className="pulse" style={{ fontSize:11, color:thm.textMuted, letterSpacing:2 }}>SINCRONIZANDO MATRIZ</div></div>;

  return (
    <div style={{ minHeight:"100vh", background:thm.bg, color:thm.text, display:"flex", flexDirection:"column", fontFamily:font }}>
      <div style={{ borderBottom:`1px solid ${thm.border}`, padding:"0 24px", display:"flex", alignItems:"center", height:60, flexShrink:0, background:thm.navBg, gap:16 }}>
        <div className="font-serif" style={{ fontSize:19, letterSpacing:.5, flexShrink:0 }}>VERSIONA<span style={{ color:"#F47920" }}>O</span><span style={{ color:"#29ABE2", fontStyle:"italic" }}>S</span></div>
        <div style={{ display:"flex", gap:3, background:thm.surfaceTop, borderRadius:8, padding:3, overflowX:"auto", flex:1, maxWidth:850 }}>
          {navBtn("dashboard",  "Proyectos")}
          {isAdmin ? navBtn("equipo", "Equipo", "#29ABE2") : navBtn("team", "Equipo")}
          <div style={{ width:1, background:thm.border, margin:"0 8px" }} />
          {isAdmin && navBtn("servicios", "📋 Servicios")}
          {navBtn("blocked", `Pausas (${allBlock})`)}
          {navBtn("feedback", "⚙ Soporte")}
          {isAdmin && navBtn("completadas", "✓ Análisis Semanal")}
          {isSuperAdmin && navBtn("admin-utils", "Configuraciones",  "#F47920")}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginLeft:"auto", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div className="live-dot" />
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:12, fontWeight:700, color: session.user === "Diego" ? "#F47920" : "#29ABE2" }}>{session.user} <span style={{ fontSize:9, color:thm.textMuted, fontWeight:400, background:thm.surfaceTop, padding:"2px 6px", borderRadius:4 }}>{session.role}</span></div>
              <div style={{ fontSize:9, color:thm.textMuted }}>{saving ? <span style={{ color:"#facc15" }}>guardando...</span> : <span>{timeStr}</span>}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ background:"none", border:"none", color:"#f87171", cursor:"pointer", fontSize:11, fontWeight:700 }}>Salir →</button>
        </div>
      </div>

      <div style={{ display:"flex", borderBottom:`1px solid ${thm.border}`, flexShrink:0, background:thm.navBg }}>
        {[{ l:"Activas", v:allPend, c:thm.text }, { l:"Bloqueadas", v:allBlock, c:allBlock>0?"#f87171":thm.textMuted }, { l:"Vencidas", v:allOver, c:allOver>0?"#facc15":thm.textMuted }, { l:"Listas", v:allDone.length, c:"#4ade80" }].map((k,i) => (
          <div key={i} style={{ flex:1, padding:"10px 8px", textAlign:"center", borderRight:i<3?`1px solid ${thm.border}`:"none" }}>
            <div style={{ fontSize:18, fontWeight:700, color:k.c }}>{k.v}</div>
            <div style={{ fontSize:8, color:thm.textMuted, marginTop:2 }}>{k.l}</div>
          </div>
        ))}
      </div>

      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        
        {view === "dashboard" && (
          <>
            <div style={{ width:240, borderRight:`1px solid ${thm.border}`, background:thm.surface, overflowY:"auto", flexShrink:0, display:"flex", flexDirection:"column" }}>
              {adminProjects.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ padding:"16px 18px 6px", fontSize:9, color:thm.textMuted, letterSpacing:2, textTransform:"uppercase", fontWeight:700 }}>⚙️ Operación Interna</div>
                  {adminProjects.map(c => (
                    <button key={c.id} onClick={() => { setActiveClient(c.id); setShowDone(false); }} style={{ width:"100%", textAlign:"left", padding:"11px 18px", background:c.id===activeClient?thm.surfaceHigh:"transparent", border:"none", borderLeft:c.id===activeClient?`3px solid #c49a2a`:"3px solid transparent", cursor:"pointer", color:c.id===activeClient?thm.text:thm.textMuted, fontSize:12 }}>⚙️ {c.name}</button>
                  ))}
                </div>
              )}
              {sortedActive.length > 0 && <div style={{ padding:"16px 18px 6px", fontSize:9, color:thm.textMuted, letterSpacing:2, textTransform:"uppercase", fontWeight:700 }}>Clientes Activos</div>}
              {sortedActive.map(c => {
                const total = c.tasks ? c.tasks.filter(t=>t.state!=="archived").length : 0; 
                const done = c.tasks ? c.tasks.filter(t=>t.state==="done").length : 0;
                const bl = c.tasks ? c.tasks.filter(t=>t.state==="blocked").length : 0; 
                const pd = c.tasks ? c.tasks.filter(t=>t.state!=="done" && t.state!=="archived").length : 0;
                return (
                  <button key={c.id} onClick={() => { setActiveClient(c.id); setShowDone(false); }} style={{ width:"100%", textAlign:"left", padding:"11px 18px", background:c.id===activeClient?thm.surfaceHigh:"transparent", border:"none", borderLeft:c.id===activeClient?`3px solid ${STA_CLR[c.status]}`:"3px solid transparent", cursor:"pointer", color:c.id===activeClient?thm.text:thm.textSub, fontSize:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:6, marginBottom:4 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:7, overflow:"hidden" }}><div style={{ width:7, height:7, borderRadius:"50%", background:STA_CLR[c.status], flexShrink:0 }}/><span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.name}</span></div>
                      <div style={{ display:"flex", gap:4, flexShrink:0 }}>{bl>0 && <span style={{ fontSize:8, color:"#f87171", fontWeight:700 }}>⊘{bl}</span>} {pd>0 && <span style={{ fontSize:8, color:thm.textMuted }}>{pd}</span>}</div>
                    </div>
                    {total > 0 && <div className="prog-bar"><div className="prog-fill" style={{ width:`${Math.round((done/total)*100)}%`, background:c.status==="red"?"#f87171":c.status==="yellow"?"#facc15":"#4ade80" }}/></div>}
                  </button>
                );
              })}
            </div>

            <div style={{ flex:1, overflowY:"auto", padding:"28px 36px", background:thm.bg }}>
              {client ? (
                <>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:20, paddingBottom: 16, borderBottom: `1px solid ${thm.border}` }}>
                    <h2 className="font-serif" style={{ margin:0, fontSize:28, display:"flex", alignItems:"center", gap:12 }}>
                       {client.name} <span style={{ fontSize:10, fontWeight:700, padding:"4px 8px", background:thm.surfaceTop, borderRadius:6, color:thm.textSub, letterSpacing:1, textTransform:"uppercase" }}>{client.type || "POR DEFINIR"}</span>
                    </h2>
                    <div style={{ display: "flex", alignItems: "center", gap:12 }}>
                      <select value={orderCriteria} onChange={e => setOrderCriteria(e.target.value)} style={{ background: thm.surface, border: `1px solid ${thm.border}`, color: thm.textSub, fontSize: 11, padding: "6px 10px", borderRadius: 6, cursor: "pointer", fontWeight:600 }}>
                        <option value="default">Orden Cronológico</option> <option value="priority">Agrupar Prioridad</option> <option value="person">Agrupar Persona</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
                    {getActive(client.tasks).length === 0 && <div style={{ fontSize:13, color:thm.textMuted, padding:"24px", textAlign:"center", background:thm.surface, borderRadius:10, border:`1px dashed ${thm.border}` }}>Sin tareas activas.</div>}
                    {getActive(client.tasks).map((task, idx) => <TaskRow key={task.id} task={task} cid={client.id} index={idx} teamMembers={teamMembers} {...rowProps}/> )}
                  </div>

                  {getDone(client.tasks).length > 0 && (
                    <div style={{ marginBottom:16 }}>
                      <button onClick={() => setShowDone(p=>!p)} style={{ fontSize:11, color:thm.textSub, background:"none", border:"none", cursor:"pointer", fontWeight:600, padding:0 }}>
                        {showDone ? `▼ Ocultar completadas` : `▶ Ver completadas (${getDone(client.tasks).length})`}
                      </button>
                      {showDone && (
                        <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:12 }}>
                          {getDone(client.tasks).map((task, idx) => <TaskRow key={task.id} task={task} cid={client.id} index={idx} teamMembers={teamMembers} {...rowProps}/> )}
                        </div>
                      )}
                    </div>
                  )}

                  {!showForm ? (
                    <button className="btn-action" onClick={() => { setNewTask(p => ({...p, projectId: activeClient})); setShowForm(true); }} style={{ padding:"10px 20px", background:thm.accentBg, color:thm.accentText, border:"none", borderRadius:8, cursor:"pointer", fontSize:11, fontWeight:700 }}>✦ Nueva Actividad</button>
                  ) : (
                    <div className="fade-up" style={{ display:"flex", gap:8, flexWrap:"wrap", padding:18, background:thm.surface, borderRadius:12, border:`1px solid ${thm.border}` }}>
                      <input value={newTask.text} onChange={e=>setNewTask(p=>({...p,text:e.target.value.slice(0,MAX_TASK_LEN)}))} onKeyDown={e=>e.key==="Enter"&&addTask()} placeholder="Describe la actividad..." autoFocus style={{ ...inpStyle, flex:1, minWidth:180 }}/>
                      <label style={{display:"flex", alignItems:"center", gap:8, background:thm.inputBg, padding:"0 12px", border:`1px solid ${thm.border}`, borderRadius:8, fontSize:11, color:thm.textSub, cursor:"pointer", fontWeight:600}}>
                        <input type="checkbox" checked={newTask.is_service} onChange={e=>setNewTask(p=>({...p, is_service: e.target.checked}))}/> Es Servicio
                      </label>
                      {newTask.is_service && (
                        <select value={newTask.service_id || ""} onChange={e => setNewTask(p => ({...p, service_id: e.target.value}))} style={{ ...inpStyle, fontSize:11, borderColor:"rgba(192,132,252,0.4)", color:"#c084fc" }}>
                          <option value="">Seleccionar entregable...</option>
                          {CREATIVE_SERVICES_CATALOG.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      )}
                      <select value={newTask.whoId || ""} onChange={e=>setNewTask(p=>({...p,whoId:e.target.value}))} style={{ ...inpStyle, cursor:"pointer" }}>
                        {teamMembers.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                      <select value={newTask.category} onChange={e=>setNewTask(p=>({...p, category: e.target.value}))} style={{ ...inpStyle, cursor:"pointer" }}>
                        {TASK_CATS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                      <button onClick={()=>addTask()} style={{ background:thm.accentBg, color:thm.accentText, border:"none", borderRadius:8, padding:"0 20px", fontWeight:700, cursor:"pointer", fontSize:12 }}>Agregar</button>
                      <button onClick={()=>setShowForm(false)} style={{ background:"transparent", color:thm.textMuted, border:"none", cursor:"pointer", padding:"0 10px", fontWeight:600, fontSize:12 }}>✕</button>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: thm.textMuted, fontSize: 13, border: `1px dashed ${thm.border}`, borderRadius: 12 }}>No hay proyectos activos.</div>
              )}
            </div>
          </>
        )}

        {view === "servicios" && isAdmin && (
          <div className="fade-up" style={{ flex:1, overflowY:"auto", padding:"32px 40px", background:thm.bg, maxWidth:850, margin:"0 auto", width:"100%" }}>
            <h2 className="font-serif" style={{ fontSize:30, marginBottom:6 }}>📋 Servicios</h2>
            <p style={{ fontSize:13, color:thm.textSub, marginBottom:28 }}>Mapeo de entregables activos y sesiones estructuradas.</p>
            {CREATIVE_SERVICES_CATALOG.every(srv => clients.flatMap(c => (c.tasks || []).filter(t => (t.service_id === srv.id || (srv.id === "srv_photo" && t.category === "📚")) && t.state !== "done" && t.state !== "archived")).length === 0) ? (
               <div style={{ textAlign:"center", padding:48, color:thm.textMuted, background:thm.surface, borderRadius:14, border:`1px dashed ${thm.border}` }}>No hay entregables mapeados.</div>
            ) : (
               <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
                  {CREATIVE_SERVICES_CATALOG.map(srv => {
                     const tasksForService = clients.flatMap(c => 
                        (c.tasks || []).filter(t => (t.service_id === srv.id || (srv.id === "srv_photo" && t.category === "📚")) && t.state !== "done" && t.state !== "archived").map(t => ({ ...t, cname: c.name }))
                     );
                     if (tasksForService.length === 0) return null;
                     return (
                        <div key={srv.id} style={{ background:thm.surface, borderRadius:12, border:`1px solid ${thm.border}`, overflow:"hidden" }}>
                           <div style={{ padding:"16px 20px", borderBottom:`1px solid ${thm.borderLight}`, display:"flex", justifyContent:"space-between", background:thm.surfaceHigh }}>
                              <div style={{ fontSize:16, fontWeight:700 }}>{srv.name}</div>
                              <div style={{ fontSize:11, color:"#c084fc", background:"rgba(192,132,252,0.1)", padding:"4px 10px", borderRadius:6, textTransform:"uppercase", fontWeight:700 }}>{srv.type}</div>
                           </div>
                           <div style={{ padding:"16px 20px", display:"flex", flexDirection:"column", gap:12 }}>
                              {tasksForService.map(sTask => {
                                 const member = teamMembers.find(m => m.id === sTask.assigned_to);
                                 return (
                                    <div key={sTask.id} style={{ display:"flex", alignItems:"flex-start", gap:12, paddingBottom:12, borderBottom:`1px dashed ${thm.borderLight}` }}>
                                       <span style={{ fontSize:18 }}>{srv.type === "video" ? "🎬" : srv.type === "production" ? "📸" : "🎨"}</span>
                                       <div style={{ flex:1 }}>
                                          <div style={{ fontSize:13, fontWeight:700, color:thm.text, marginBottom:4 }}>{sTask.text}</div>
                                          <div style={{ fontSize:12, color:thm.textSub }}>📁 Proyecto: {sTask.cname} · Bloque: {sTask.category}</div>
                                       </div>
                                       <div style={{ fontSize:10, color:thm.textMuted, background:thm.inputBg, padding:"4px 10px", borderRadius:20 }}>Resp: {member?.name || "Sin asignar"}</div>
                                    </div>
                                 )
                              })}
                           </div>
                        </div>
                     )
                  })}
               </div>
            )}
          </div>
        )}

        {view === "feedback" && (
          <div className="fade-up" style={{ flex:1, overflowY:"auto", padding:"32px 40px", background:thm.bg, maxWidth:isAdmin ? 800 : 600, margin:"0 auto", width:"100%" }}>
            {isAdmin ? (
               <>
                  <h2 className="font-serif" style={{ fontSize:30, marginBottom:6, color:"#F47920" }}>⚙️ Buzón de Control de Fricción</h2>
                  <p style={{ fontSize:13, color:thm.textSub, marginBottom:28 }}>Mesa unificada de tickets de optimización y alertas automáticas de seguridad.</p>
                  {(!feedbackItems || feedbackItems.length === 0) ? (
                     <div style={{ textAlign:"center", padding:48, color:thm.textMuted, background:thm.surface, borderRadius:14, border:`1px dashed ${thm.border}` }}>Sin notas de fricción o tickets de soporte pendientes. 🙌</div>
                  ) : (
                     <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                        {feedbackItems.map(fb => {
                          const isBug = fb.message.includes("[Soporte Técnico]");
                          const isClient = fb.message.includes("[Cliente]");
                          const isAudit = fb.message.includes("[Auditoría Semanal]");
                          const fbColor = isAudit ? "#4ade80" : isBug ? "#f87171" : isClient ? "#38bdf8" : "#F47920";
                          return (
                             <div key={fb.id} style={{ background:thm.surface, padding:20, borderRadius:12, border:`1px solid ${thm.border}`, borderLeft:`4px solid ${fbColor}` }}>
                                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                                   <span style={{ fontSize:12, fontWeight:700, color:fbColor }}>Remitente: {fb.user_name || "Mesa de Control"}</span>
                                   <span style={{ fontSize:10, color:thm.textMuted }}>{fb.created_at ? new Date(fb.created_at).toLocaleDateString("es-MX") : ""}</span>
                                </div>
                                <pre style={{ margin:0, fontSize:13, color:thm.text, lineHeight:1.6, fontFamily:font, whiteSpace:"pre-wrap" }}>{fb.message}</pre>
                             </div>
                          );
                        })}
                     </div>
                  )}
               </>
            ) : (
               <>
                  <h2 className="font-serif" style={{ fontSize:30, marginBottom:6 }}>⚙️ Reportar Fricción / Soporte</h2>
                  <p style={{ fontSize:13, color:thm.textSub, marginBottom:28, lineHeight:1.6 }}>¿Detectaste cuellos de botella o lentitud en el flujo? Descríbelo aquí. Llegará clasificado automáticamente a la mesa de control del Admin.</p>
                  <form onSubmit={handleFeedbackSubmit}>
                     <textarea value={feedbackMsg} onChange={e => setFeedbackMsg(e.target.value)} placeholder="Ej: No me deja archivar la tarea X..." style={{ width: "100%", minHeight: 140, background: thm.surface, border: `1px solid ${thm.border}`, borderRadius: 12, color: thm.text, fontSize: 13, padding: 20, outline: "none", lineHeight: 1.6, resize: "none", marginBottom: 16 }} />
                     <button type="submit" disabled={saving || !feedbackMsg.trim()} style={{ background: thm.text, color: thm.bg, border: "none", borderRadius: 8, padding: "12px 24px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Enviar Nota</button>
                  </form>
                  {feedbackSuccess && <div className="fade-up" style={{ marginTop: 16, background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)", color: "#4ade80", padding: "12px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>✓ Nota procesada de forma segura por la matriz.</div>}
               </>
            )}
          </div>
        )}

        {view === "blocked" && (
          <div style={{ flex:1, overflowY:"auto", padding:"32px 40px", background:thm.bg, display:"flex", flexDirection:"column", gap:8 }}>
            <h2 className="font-serif" style={{ fontSize:28, color:"#f87171", margin:"0 0 12px 0" }}>⊘ Contenidos Pausados</h2>
            {blockedAll.length === 0 ? <div style={{ color:thm.textMuted, fontSize:13 }}>Sin contenidos bloqueados. 🙌</div> : blockedAll.map(t => (
              <div key={t.id} style={{ padding:16, background:thm.surface, borderRadius:12, border:`1px solid ${thm.border}`, borderLeft:"4px solid #f87171", fontSize:13 }}>
                <div style={{ fontWeight:600, color:thm.text }}>{t.text}</div>
                <div style={{ display:"flex", gap:8, fontSize:11, color:thm.textMuted, marginTop:6 }}>
                  <span>📁 Proyecto: {t.cname}</span>
                  {t.blocked_reason && <span style={{ color:"#facc15" }}>Motivo: "{t.blocked_reason}"</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {(view === "team" || view === "equipo") && (
          <div className="fade-up" style={{ flex:1, overflowY:"auto", padding:"22px", background:thm.bg }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 36 }}>
               <div style={{
                 width: 142, height: 142, borderRadius: "50%", 
                 background: totalActiveTasksGlobal === 0 ? "#4ade80" : `conic-gradient(${pieGradientParts})`,
                 display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.6)", transition: "all 0.4s ease"
               }}>
                  <div style={{ width: 88, height: 88, background: thm.surface, borderRadius: "50%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                     <span style={{ fontSize:24, fontWeight:700, color: totalActiveTasksGlobal === 0 ? "#4ade80" : "#eef0f3" }}>{totalActiveTasksGlobal}</span>
                     <span style={{ fontSize:8, color:thm.textMuted, letterSpacing:1.5, fontWeight:700 }}>{totalActiveTasksGlobal === 0 ? "LIBRE" : "ACTIVAS"}</span>
                  </div>
               </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:14 }}>
              {teamMembers.map(m => {
                const active = clients.flatMap(c => c.tasks ? c.tasks.filter(t => t.assigned_to === m.id && t.state !== "done" && t.state !== "archived") : []);
                const done = clients.flatMap(c => c.tasks ? c.tasks.filter(t => t.assigned_to === m.id && t.state === "done") : []);
                const n = active.length; const ov = n >= WIP_LIMIT; const mColor = getMemberColor(m.name);
                return (
                  <div key={m.id} style={{ background:thm.surface, borderRadius:12, overflow:"hidden", border:`1px solid ${ov?thm.states.blocked.border:thm.border}` }}>
                    <div style={{ padding:"14px 18px", borderBottom:`1px solid ${thm.border}`, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div><div style={{ fontSize:15, fontWeight:700, color: mColor }}>{m.name}</div><div style={{ fontSize:9, color:thm.textMuted, marginTop:4 }}>{n} activas · {done.length} listas</div></div>
                      <div style={{ fontSize:26, fontWeight:700, color:ov?"#f87171":"#4ade80", lineHeight:1 }}>{n}</div>
                    </div>
                    <div style={{ maxHeight:350, overflowY:"auto" }}>
                      {active.map(t => (
                        <div key={t.id} style={{ padding:"11px 16px", borderBottom:`1px solid ${thm.borderLight}`, borderLeft:`3px solid ${t.state==="blocked"?"#f87171":"#facc15"}` }}>
                          <div style={{ fontSize:11, color:thm.text, lineHeight:1.4 }}>{t.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {view === "completadas" && isAdmin && (
          <div className="fade-up" style={{ flex:1, overflowY:"auto", padding:"32px 40px", background:thm.bg, width:"100%" }}>
            <h2 className="font-serif" style={{ fontSize:32, margin:"0 0 4px 0" }}>📊 Análisis Semanal</h2>
            <p style={{ fontSize:13, color:thm.textSub, marginBottom:24 }}>Estatus estructural y métricas correspondientes al cierre semanal.</p>

            <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
              <div style={{ background:thm.surface, borderRadius:14, padding:24, border:`1px solid ${thm.border}` }}>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:12 }}>
                  <div className="kpi-card kpi-blue"><div className="font-serif" style={{ fontSize:32, color:thm.text, lineHeight:1 }}>{clients.filter(c => c.dbStatus !== "archived").length}</div><div style={{ fontSize:9, color:thm.textMuted, fontWeight:700, letterSpacing:1.2, marginTop:8, textTransform:"uppercase" }}>CUENTAS ACTIVAS</div></div>
                  <div className="kpi-card kpi-green"><div className="font-serif" style={{ fontSize:32, color:thm.text, lineHeight:1 }}>{allDone.length}</div><div style={{ fontSize:9, color:thm.textMuted, fontWeight:700, letterSpacing:1.2, marginTop:8, textTransform:"uppercase" }}>ENTREGADAS</div></div>
                  <div className="kpi-card kpi-yellow"><div className="font-serif" style={{ fontSize:32, color:thm.text, lineHeight:1 }}>{allPend}</div><div style={{ fontSize:9, color:thm.textMuted, fontWeight:700, letterSpacing:1.2, marginTop:8, textTransform:"uppercase" }}>EN PRODUCCIÓN</div></div>
                  <div className="kpi-card kpi-red"><div className="font-serif" style={{ fontSize:32, color:thm.text, lineHeight:1 }}>{allBlock}</div><div style={{ fontSize:9, color:thm.textMuted, fontWeight:700, letterSpacing:1.2, marginTop:8, textTransform:"uppercase" }}>PAUSADAS</div></div>
                </div>
              </div>

              <WeeklyChart allDone={allDone} />

              {/* SEMÁFORO DE AUDITORÍA (CONECTADO AL BUZÓN Y GUARDABLE) */}
              <div style={{ background:thm.surface, borderRadius:14, padding:24, border:`1px solid ${thm.border}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                  <div style={{ fontSize:10, color:thm.textMuted, letterSpacing:1.5, textTransform:"uppercase", fontWeight:700 }}>Semáforo de Intención Semanal</div>
                  <button onClick={handleSaveAudit} disabled={saving} style={{ background:thm.accentBg, color:thm.accentText, border:"none", padding:"6px 14px", borderRadius:6, fontSize:10, fontWeight:700, cursor:"pointer" }}>Guardar Auditoría Definitiva</button>
                </div>
                <div className="semaforo-win" style={{ marginBottom:12 }}><span style={{ fontSize:24 }}>🏆</span><div style={{ flex:1 }}><div style={{ fontSize:11, color:"#4ade80", fontWeight:700 }}>LOGRO DE IMPACTO SEMANAL</div><textarea value={auditWin} onChange={e=>setAuditWin(e.target.value)} rows={2} placeholder="Ej: Logramos liberar la campaña." style={{ width:"100%", background:thm.inputBg, border:`1px solid ${thm.border}`, borderRadius:8, color:thm.text, padding:10, marginTop:6 }}/></div></div>
                <div className="semaforo-warn" style={{ marginBottom:12 }}><span style={{ fontSize:24 }}>🚀</span><div style={{ flex:1 }}><div style={{ fontSize:11, color:"#facc15", fontWeight:700 }}>AVANCE DESTACADO DE CONTENIDO</div><textarea value={auditWarn} onChange={e=>setAuditWarn(e.target.value)} rows={2} placeholder="Ej: Destrabamos las pautas." style={{ width:"100%", background:thm.inputBg, border:`1px solid ${thm.border}`, borderRadius:8, color:thm.text, padding:10, marginTop:6 }}/></div></div>
                <div className="semaforo-risk"><span style={{ fontSize:24 }}>⚠️</span><div style={{ flex:1 }}><div style={{ fontSize:11, color:"#f87171", fontWeight:700 }}>RIESGO / CUELLO DE BOTELLA CRÍTICO</div><textarea value={auditRisk} onChange={e=>setAuditRisk(e.target.value)} rows={2} placeholder="Ej: Falta confirmación de accesos." style={{ width:"100%", background:thm.inputBg, border:`1px solid ${thm.border}`, borderRadius:8, color:thm.text, padding:10, marginTop:6 }}/></div></div>
              </div>

              <div style={{ background:thm.surface, borderRadius:14, padding:24, border:`1px solid ${thm.border}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700 }}>WhatsApp Daily Brief Loop Matrix</div>
                  </div>
                  <button onClick={generateDailyBriefs} style={{ background:thm.text, color:thm.bg, border:"none", padding:"8px 16px", borderRadius:6, fontWeight:700, cursor:"pointer", fontSize:11 }}>Generar Briefings</button>
                </div>
                {waBriefs && (
                  <div className="fade-up" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:12 }}>
                    {Object.entries(waBriefs).map(([name, msg]) => (
                      <div key={name} style={{ background:thm.inputBg, padding:16, borderRadius:8, border: `1px solid ${thm.border}` }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                          <span style={{ fontSize:12, fontWeight:700, color:getMemberColor(name) }}>{name}</span>
                          <button onClick={() => { navigator.clipboard.writeText(msg); alert(`Briefing de ${name} copiado.`); }} style={{ background:"none", border:"none", color:"#4ade80", fontSize:10, cursor:"pointer", fontWeight:700 }}>Copiar</button>
                        </div>
                        <pre style={{ margin:0, fontSize:11, whiteSpace:"pre-wrap", color:thm.textSub, lineHeight:1.5, fontFamily:"inherit" }}>{msg}</pre>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {getArchivedTasks().length > 0 && (
                <div style={{ background:thm.surface, borderRadius:14, padding:24, border:`1px solid ${thm.border}` }}>
                  <div style={{ fontSize:11, color:thm.textMuted, fontWeight:700, letterSpacing:1.5, marginBottom:12, textTransform:"uppercase" }}>📁 Buffer de Actividades Archivadas</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    {getArchivedTasks().map(t => (
                      <div key={t.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", background:thm.inputBg, borderRadius:10, border:`1px solid ${thm.border}`, opacity:0.6 }}>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, color:thm.textSub }}>{t.text}</div>
                          <div style={{ fontSize:10, color:thm.textMuted, marginTop:2 }}>Marca Origen: {t.cname}</div>
                        </div>
                        <button className="btn-action" onClick={()=>restoreTask(t.id)} style={{ background:"none", border:`1px solid ${thm.border}`, color:thm.textSub, padding:"4px 12px", borderRadius:6, fontSize:10, cursor:"pointer" }}>Restaurar Flujo ↺</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {weekGroups.map((group) => (
                <div key={group.key} className="fade-up">
                  <div className="week-divider"><span style={{ fontSize:10, color:thm.textMuted, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase" }}>{group.label} <span style={{ marginLeft:8, color:"#4ade80" }}>· {group.tasks.length} cerradas</span></span><div className="week-divider-line"/></div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    {group.tasks.map(t => {
                      const member = teamMembers.find(m => m.id === t.assigned_to);
                      return (
                        <div key={t.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", background:thm.surface, borderRadius:10, border:`1px solid ${thm.border}`, opacity:.75 }}>
                          <span style={{ fontSize:12, color:"#4ade80" }}>✓</span>
                          <div style={{ flex:1 }}><div style={{ fontSize:13, color:thm.textSub, textDecoration:"line-through" }}>{t.text}</div><div style={{ fontSize:10, color:thm.textMuted, marginTop:2 }}>📁 {t.cname} · <span style={{ color: getMemberColor(member?.name || "")}}>{member?.name || "Sin asignar"}</span></div></div>
                          <button className="btn-action" onClick={()=>restoreTask(t.id)} style={{ background:"none", border:`1px solid ${thm.border}`, color:thm.textSub, padding:"3px 8px", borderRadius:6, fontSize:10, cursor:"pointer" }}>↺</button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ VIEW: CONFIGURACIONES (SOLO SUPERADMIN) ══ */}
        {view === "admin-utils" && isSuperAdmin && (
          <div className="fade-up" style={{ flex:1, overflowY:"auto", padding:"32px 40px", background:thm.bg }}>
            <h2 className="font-serif" style={{ margin:"0 0 8px 0", fontSize:30 }}>⚙ Configuración del Flujo Matrix</h2>
            <p style={{ fontSize:13, color:thm.textSub, marginBottom:28 }}>Panel maestro administrativo central.</p>

            <div style={{ background:thm.surface, borderRadius:14, border:`1px solid ${thm.border}`, marginBottom:24, padding:20 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}><div style={{ fontSize:14, fontWeight:700 }}>1. Integrantes del Equipo</div><button onClick={() => setShowNewMember(!showNewMember)} style={{ padding:"5px 12px", background:thm.surfaceTop, border:`1px solid ${thm.border}`, borderRadius:6, color:thm.text, fontSize:11, cursor:"pointer" }}>{showNewMember?"Cerrar":"+ Integrante"}</button></div>
              {showNewMember && (
                <div style={{ display:"flex", gap:10, background:thm.inputBg, padding:12, borderRadius:8, marginBottom:12 }}><input value={newMemberName} onChange={e=>setNewMemberName(e.target.value)} placeholder="Nombre..." style={{...inpStyle, flex:1}}/><button onClick={addTeamMember} style={{ background:"#4ade80", color:thm.bg, border:"none", borderRadius:6, padding:"0 16px", fontWeight:700, cursor:"pointer" }}>Guardar</button></div>
              )}
              {teamMembers.map(m => (
                <div key={m.id} style={{ display:"flex", gap:10, alignItems:"center", marginBottom:6 }}><input defaultValue={m.name} onBlur={e => editTeamMember(m.id, e.target.value)} style={{...inpStyle, flex:1}}/><button onClick={() => deleteTeamMember(m.id)} style={{ background:"none", border:`1px solid ${thm.deleteBorder}`, color:thm.deleteText, borderRadius:6, padding:"4px 12px", cursor:"pointer", fontSize:11 }}>Eliminar</button></div>
              ))}
            </div>

            <div style={{ background:thm.surface, borderRadius:14, border:`1px solid ${thm.border}`, marginBottom:24, padding:20 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                 <div style={{ display: "flex", gap:12, alignItems:"center" }}>
                    <div style={{ fontSize:14, fontWeight:700 }}>2. Registro de Marcas y Cuentas</div>
                    <div style={{ display:"flex", gap:4, background:thm.inputBg, padding:2, borderRadius:6 }}>
                       <button onClick={() => setProjectFilterTab("active")} style={{ fontSize:10, padding:"4px 8px", background:projectFilterTab==="active"?thm.surfaceHigh:"transparent", color:thm.text, border:"none", borderRadius:4, cursor:"pointer", fontWeight:600 }}>Activos</button>
                       <button onClick={() => setProjectFilterTab("archived")} style={{ fontSize:10, padding:"4px 8px", background:projectFilterTab==="archived"?thm.surfaceHigh:"transparent", color:thm.text, border:"none", borderRadius:4, cursor:"pointer", fontWeight:600 }}>Archivados</button>
                    </div>
                 </div>
                 <button onClick={() => setShowNewProject(!showNewProject)} style={{ padding:"5px 12px", background:thm.accentBg, color:thm.accentText, border:"none", borderRadius:6, fontSize:11, fontWeight:700, cursor:"pointer" }}>{showNewProject?"Cancelar":"+ Nueva Marca"}</button>
              </div>
              {showNewProject && (
                <div style={{ display:"flex", gap:10, background:thm.inputBg, padding:12, borderRadius:8, marginBottom:12 }}><input value={newProjectData.name} onChange={e=>setNewProjectData(p=>({...p, name:e.target.value}))} placeholder="Nombre de la marca..." style={{...inpStyle, flex:2}}/><select value={newProjectData.type} onChange={e=>setNewProjectData(p=>({...p, type:e.target.value}))} style={inpStyle}>{TYPES.map(t=><option key={t} value={t}>{t}</option>)}</select><button onClick={createProject} style={{ background:"#4ade80", color:thm.bg, border:"none", borderRadius:6, padding:"0 16px", fontWeight:700, cursor:"pointer" }}>Crear</button></div>
              )}
              
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {clients.filter(c => projectFilterTab === "active" ? c.dbStatus !== "archived" : c.dbStatus === "archived").map(c => (
                  <div key={c.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"8px 12px", background:thm.inputBg, borderRadius:8, border:`1px solid ${thm.border}` }}>
                    <div style={{ width:6, height:6, borderRadius:"50%", background:STA_CLR[c.status] }}/>
                    <div style={{ flex:1, fontSize:13 }}>{c.name} <span style={{ fontSize:9, color:thm.textMuted }}>({c.type})</span></div>
                    <div style={{ display:"flex", gap:6 }}>
                      {c.dbStatus !== "archived" ? (
                        <button onClick={() => archiveProject(c.id, c.name)} style={{ background:"none", border: `1px solid ${thm.border}`, color: thm.textSub, padding:"4px 10px", borderRadius:6, fontSize:11, cursor:"pointer" }}>Archivar</button>
                      ) : (
                        <button onClick={() => unarchiveProject(c.id)} style={{ background:"none", border: `1px solid #4ade80`, color: "#4ade80", padding:"4px 10px", borderRadius:6, fontSize:11, cursor:"pointer" }}>Desarchivar ↺</button>
                      )}
                      <button onClick={() => deleteProject(c.id, c.name)} style={{ background:"none", border: `1px solid ${thm.deleteBorder}`, color: thm.deleteText, padding:"4px 10px", borderRadius:6, fontSize:11, cursor:"pointer" }}>Eliminar ✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background:thm.surface, borderRadius:14, border:`1px solid ${thm.border}`, marginBottom:24, padding:20 }}>
               <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <div style={{ fontSize:14, fontWeight:700 }}>3. Bóveda de Códigos de Acceso (Seguridad)</div>
                  <button onClick={() => setShowNewCode(!showNewCode)} style={{ padding:"5px 12px", background:thm.surfaceTop, border:`1px solid ${thm.border}`, borderRadius:6, color:thm.text, fontSize:11, cursor:"pointer" }}>{showNewCode ? "Cerrar" : "+ Código Nuevo"}</button>
               </div>
               {showNewCode && (
                  <form onSubmit={createAccessCode} style={{ display:"flex", gap:8, background:thm.inputBg, padding:12, borderRadius:8, marginBottom:12, flexWrap:"wrap" }}>
                     <input value={newCodeForm.code} onChange={e=>setNewCodeForm(p=>({...p, code:e.target.value}))} placeholder="Código (ej: arturo2026)" required style={inpStyle} />
                     <input value={newCodeForm.user_name} onChange={e=>setNewCodeForm(p=>({...p, user_name:e.target.value}))} placeholder="Nombre de la Persona" required style={inpStyle} />
                     <select value={newCodeForm.role} onChange={e=>setNewCodeForm(p=>({...p, role:e.target.value}))} style={inpStyle}>
                        <option value="team">Team Member (Colaborador)</option>
                        <option value="admin">Admin OS (Administrador)</option>
                     </select>
                     <button type="submit" style={{ background:"#4ade80", color:thm.bg, border:"none", padding:"0 16px", borderRadius:6, fontWeight:700, cursor:"pointer", fontSize:11 }}>Inyectar Bóveda</button>
                  </form>
               )}
               <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))", gap:8 }}>
                  {dbAccessCodes.map(ac => (
                     <div key={ac.id} style={{ padding:"10px 14px", background:thm.inputBg, borderRadius:8, border:`1px solid ${thm.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div>
                           <div style={{ fontSize:12, fontWeight:700, color:"#60a5fa" }}>{ac.user_name} <span style={{ fontSize:9, color:thm.textMuted, background:thm.surfaceHigh, padding:"1px 4px", borderRadius:3 }}>{ac.role}</span></div>
                           <div style={{ fontSize:11, color:thm.textSub, letterSpacing:1, marginTop:2 }}>Clave: {ac.code}</div>
                        </div>
                        <button type="button" onClick={() => toggleAccessCode(ac.id, ac.is_active)} style={{ background:"none", border: `1px solid ${ac.is_active ? thm.border : "rgba(74,222,128,0.3)"}`, color: ac.is_active ? thm.deleteText : "#4ade80", padding:"3px 8px", borderRadius:4, fontSize:10, cursor:"pointer", fontWeight:600 }}>
                           {ac.is_active ? "Revocar" : "Activar"}
                        </button>
                     </div>
                  ))}
               </div>
            </div>

            <div style={{ background:thm.surface, borderRadius:14, padding:20 }}>
               <div style={{ fontSize:14, fontWeight:700, marginBottom:12 }}>4. Registro de Auditoría de Puertos (`security_logs`)</div>
               <div style={{ maxHeight:200, overflowY:"auto", display:"flex", flexDirection:"column", gap:6 }}>
                  {securityLogs.map(log => (
                     <div key={log.id} style={{ display:"flex", justifyContent:"space-between", padding:"6px 12px", background:thm.inputBg, borderRadius:6, fontSize:11, borderBottom:`1px solid ${thm.borderLight}` }}>
                        <span style={{ color:"#4ade80" }}>● [{log.action_type.toUpperCase()}] {log.user_name}</span>
                        <span style={{ color:thm.textMuted }}>{new Date(log.created_at).toLocaleString("es-MX")}</span>
                     </div>
                  ))}
               </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
