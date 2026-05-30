/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";

// ══════════════════════════════════════════════════════════════
// CONSTANTS · VERSIONA OS
// ══════════════════════════════════════════════════════════════
const ORG_ID       = "00000000-0000-0000-0000-000000000001";
const WIP_LIMIT    = 5;
const MAX_TASK_LEN = 200;
const WHO_LIST     = ["EK", "Artur", "Diego"];
const TYPES        = ["membresía", "proyecto", "prospecto", "admin"];
const PRIO_ORDER   = { high: 0, medium: 1, low: 2 };
const PRIO_CYCLE   = ["high", "medium", "low"];
const STATE_CYCLE  = { pending: "inprogress", inprogress: "blocked", blocked: "in_review", in_review: "done", done: "pending" };
const font         = "'Plus Jakarta Sans', system-ui, sans-serif";

const TASK_CATS    = [
  { value: "🔥", label: "🔥 Rápida (<10 min)" },
  { value: "📚", label: "📚 Trabajo Profundo" },
  { value: "🧑‍🧒‍🧒", label: "🧑‍🧒‍🧒 Reunión / Prospecto" },
  { value: "🧠", label: "🧠 Aprendizaje" },
];

// ══════════════════════════════════════════════════════════════
// THEME & DESIGN SYSTEM (INDUSTRIAL PREMIUM)
// ══════════════════════════════════════════════════════════════
const thm = {
  bg:          "#080a0e",
  surface:     "#11141a",
  surfaceHigh: "#161b24",
  surfaceTop:  "#1c222d",
  border:      "rgba(255,255,255,0.08)",
  borderLight: "rgba(255,255,255,0.04)",
  text:        "#eef0f3",
  textSub:     "rgba(238,240,243,0.6)",
  textMuted:   "rgba(238,240,243,0.38)",
  textFaint:   "rgba(255,255,255,0.1)",
  accentBg:    "#eef0f3",
  accentText:  "#080a0e",
  inputBg:     "#0a0c10",
  navBg:       "#080a0e",
  deleteBg:    "rgba(248,113,113,0.1)",
  deleteText:  "#f87171",
  deleteBorder:"rgba(248,113,113,0.2)",
  states: {
    pending:   { bg:"#161b24",              text:"rgba(238,240,243,0.5)", border:"rgba(255,255,255,0.08)", label:"Pendiente"   },
    inprogress:{ bg:"rgba(250,204,21,0.1)", text:"#facc15", border:"rgba(250,204,21,0.2)",  label:"En proceso"  },
    blocked:   { bg:"rgba(248,113,113,0.1)",text:"#f87171", border:"rgba(248,113,113,0.2)", label:"Pausado"     },
    in_review: { bg:"rgba(56,189,248,0.1)", text:"#38bdf8", border:"rgba(56,189,248,0.2)",  label:"En Revisión" },
    done:      { bg:"rgba(74,222,128,0.1)", text:"#4ade80", border:"rgba(74,222,128,0.2)",  label:"✓ Listo"     },
  },
  dlDue:  { bg:"rgba(248,113,113,0.1)", text:"#f87171", border:"rgba(248,113,113,0.2)" },
  dlSoon: { bg:"rgba(250,204,21,0.1)",  text:"#facc15", border:"rgba(250,204,21,0.2)"  },
  dlOk:   { text:"rgba(238,240,243,0.4)" },
};

const STA_CLR   = { green:"#4ade80", yellow:"#facc15", red:"#f87171" };
const PRIO_CLR  = { high:"#f87171", medium:"#facc15", low:"#4ade80" };
const PRIO_LBL  = { high:"Alta", medium:"Media", low:"Baja" };

// ── UTILS CORE ─────────────────────────────────────────────────────────────
const daysSince = (iso) => !iso ? 0 : Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);

const deadlineInfo = (dl) => {
  if (!dl) return null;
  const diff = Math.ceil((new Date(dl) - new Date().setHours(0,0,0,0)) / 86400000);
  if (diff < 0)  return { label:`⏳ ${Math.abs(diff)}d atrasado`, status:"due" };
  if (diff === 0) return { label:"⏰ Se entrega HOY", status:"due" };
  if (diff === 1) return { label:"⏰ Mañana", status:"soon" };
  if (diff <= 3)  return { label:`⏰ ${diff}d`, status:"soon" };
  return { label:new Date(dl).toLocaleDateString("es-MX",{day:"2-digit",month:"short"}), status:"ok" };
};

const toWho = (name) => {
  const n = (name || "").toLowerCase();
  if (n.includes("ektor") || n.includes("héct") || n.includes("hect") || n === "ek") return "EK";
  if (n.includes("artur")) return "Artur";
  return "Diego";
};

const toDbName = (who) => who === "EK" ? "Ektor" : who === "Artur" ? "Arturo Macías" : "Diego Beltrán";

const sortProjects = (list) => [...list].sort((a, b) => {
  const pendA = a.tasks ? a.tasks.filter(t=>t.state!=="done").length : 0;
  const pendB = b.tasks ? b.tasks.filter(t=>t.state!=="done").length : 0;
  if (pendB !== pendA) return pendB - pendA;
  const colorOrder = { red: 0, yellow: 1, green: 2 };
  return (colorOrder[a.status] ?? 2) - (colorOrder[b.status] ?? 2);
});

const getWeekKey = (dateString) => {
  if (!dateString) return { key: "zzz", label: "Sin fecha" };
  const d = new Date(dateString); d.setHours(0, 0, 0, 0);
  const day = d.getDay() || 7; d.setDate(d.getDate() + 4 - day);
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  const monday = new Date(d); monday.setDate(d.getDate() - 3);
  return { key: `${d.getFullYear()}-W${weekNo.toString().padStart(2, '0')}`, label: `Semana ${weekNo} · Inicia el ${monday.toLocaleDateString("es-MX", {day:"2-digit", month:"short"})}` };
};

const groupDoneByWeek = (tasks) => {
  if (!tasks) return [];
  const groups = {};
  tasks.forEach(t => {
    const { key, label } = getWeekKey(t.completedAt);
    if (!groups[key]) groups[key] = { label, key, tasks:[] };
    groups[key].tasks.push(t);
  });
  return Object.entries(groups).sort((a,b) => b[0].localeCompare(a[0])).map(([,g]) => g);
};

// ── COMPONENTE CARD DE TAREA ───────────────────────────────────────────────
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
    <div className="task-row fade-up" style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"12px 14px", background:isDone ? thm.surfaceHigh : thm.surface, borderRadius:10, border:`1px solid ${isDone ? thm.borderLight : thm.border}`, borderLeft:`4px solid ${isDone ? thm.border : PRIO_CLR[task.priority] || "#c49a2a"}`, opacity:isDone ? .5 : 1, marginBottom: 6 }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:7 }}>
          {task.category && <span style={{ fontSize:13 }}>{task.category}</span>}
          {isEditing ? (
            <input value={titleInput} onChange={e => setTitleInput(e.target.value)} onBlur={handleEditSubmit} onKeyDown={e => e.key==="Enter" && handleEditSubmit()} autoFocus style={{ background: "#0a0c10", border: `1px solid ${thm.border}`, color: thm.text, fontSize: 13, padding: "2px 8px", borderRadius: 4, width: "100%" }} />
          ) : (
            <span style={{ fontSize:13, color:isDone?thm.textMuted:thm.text, textDecoration:isDone?"line-through":"none", fontWeight:500, lineHeight:1.5 }}>{task.text}</span>
          )}
          {!isDone && isAdmin && !isEditing && <button onClick={() => setIsEditing(true)} style={{ background:"none", border:"none", cursor:"pointer", opacity:0.5, fontSize:11 }}>✏️</button>}
        </div>

        {days > 0 && <div style={{ fontSize:10, color:days>=3?"#f87171":"#facc15", fontWeight:600, marginBottom:4 }}>⏱ {days}d esperando · follow-up hoy</div>}
        {revOver && <div style={{ fontSize:10, color:"#f87171", fontWeight:700, marginBottom:4 }}>⚠ {task.revisions} rev · escalar a llamada</div>}

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

// ── RENDER PRINCIPAL DEL CORE OS ───────────────────────────────────────────
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
  const [waBriefs,      setWaBriefs]      = useState(null);
  const [loadingBrief,  setLoadingBrief]  = useState(false);

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

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
    const code = accessCode.trim().toLowerCase();
    let match = ACCESS_CODES_STATIC[code];
    if (match) {
      setSession({ loggedIn:true, ...match });
      setLoginError(false);
    } else { setLoginError(true); }
  };

  const cycleState = async (cid, tid) => {
    const t = clients.find(c => c.id === cid)?.tasks.find(x => x.id === tid);
    if (!t) return;
    let next = STATE_CYCLE[t.state] || "pending";
    let reason = null;
    if (next === "blocked") {
      reason = prompt("Motivo del bloqueo (Requerido para el Decision Ledger):");
      if (!reason) return;
    }
    setSaving(true);
    try {
      await supabase.from("tasks").update({ status:next, blocked_reason:reason||null }).eq("id", tid);
      await syncPipeline();
    } catch (e) { console.error(e); }
  };

  const completeTask = async (tid) => {
    setSaving(true);
    try {
      await supabase.from("tasks").update({ status:"done", updated_at: new Date().toISOString() }).eq("id", tid);
      await syncPipeline();
    } catch (e) { console.error(e); }
  };

  const restoreTask = async (tid) => {
    setSaving(true);
    try {
      await supabase.from("tasks").update({ status:"pending", updated_at: new Date().toISOString() }).eq("id", tid);
      await syncPipeline();
    } catch (e) { console.error(e); }
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
    e.stopPropagation();
    if (!confirm("¿Eliminar tarea permanentemente?")) return;
    setSaving(true);
    try { await supabase.from("tasks").delete().eq("id", tid); await syncPipeline(); } catch (e) { console.error(e); }
  };

  const addTask = async (cid) => {
    if (!newTask.text.trim()) return;
    setSaving(true);
    try {
      const member = teamMembers.find(m => m.name === toDbName(newTask.who));
      await supabase.from("tasks").insert([{ org_id: ORG_ID, project_id: cid, title: newTask.text.trim(), status: "pending", priority: newTask.priority, assigned_to: member?.id, task_type: newTask.category }]);
      setNewTask({ text:"", who:"EK", priority:"medium", category:"🔥" });
      await syncPipeline();
    } catch (e) { console.error(e); }
  };

  const generateWhatsAppBriefs = () => {
    setLoadingBrief(true);
    setTimeout(() => {
      setWaBriefs({
        EK: "🔥 *Versiona Brief · Héctor*\n• Desarrollar flyers de Osos Basquetbol.\n• Modificar entregables de Osos Flag.",
        Artur: "📚 *Versiona Brief · Arturo*\n• Enviar propuesta JLFC.\n• Seguimiento cobros y pagos Admin.",
        Diego: "🧠 *Versiona Brief · Diego*\n• Montar formulario para cliente SG.\n• Revisar videos locación Karola."
      });
      setLoadingBrief(false);
    }, 1000);
  };

  const isAdmin = session.role === "admin" || session.role === "superadmin";
  const allPend = clients.reduce((acc, c) => acc + (c.tasks ? c.tasks.filter(t => t.state !== "done").length : 0), 0);
  const blockedAll = clients.flatMap(c => c.tasks ? c.tasks.filter(t => t.state === "blocked").map(t => ({ ...t, cname: c.name, cid: c.id })) : []);
  const allDone = clients.flatMap(c => c.tasks ? c.tasks.filter(t => t.state === "done").map(t => ({ ...t, cname: c.name })) : []);
  const weekGroups = groupDoneByWeek([...allDone]);

  const adminProjects   = clients.filter(c => c.type === "admin" || c.name.toLowerCase().includes("admin"));
  const regularProjects = clients.filter(c => !adminProjects.some(a => a.id === c.id));
  const client          = clients.find(c => c.id === activeClient) || regularProjects[0] || adminProjects[0];

  const getActiveTasks = (tasks) => {
    return tasks.filter(t => t.state !== "done");
  };

  const rowProps = { teamMembers, onCycleState: cycleState, onCycleWho: cycleWho, onCyclePrio: cyclePrio, onCompleteTask: completeTask, onRestoreTask: restoreTask, onDeleteTask: deleteTask, onUpdateTitle: updateTitle, isAdmin };

  if (!session.loggedIn) {
    const currentDate = now.toLocaleDateString("es-MX", { weekday:"long", day:"2-digit", month:"long", year:"numeric" });
    return (
      <div style={{ height:"100vh", background:thm.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
        <form onSubmit={handleLogin} className="fade-up" style={{ background:thm.surface, padding:40, borderRadius:16, border:`1px solid ${thm.border}`, width:"100%", maxWidth:360, textAlign:"center" }}>
          <div className="font-serif" style={{ fontSize:26, marginBottom:6, color:thm.text }}>VERSIONA<span style={{ color:"#F47920" }}>O</span><span style={{ color:"#29ABE2", fontStyle:"italic" }}>S</span></div>
          <div style={{ fontSize:10, color:thm.textMuted, letterSpacing:2, marginBottom:6, textTransform:"uppercase" }}>Workspace de Producción</div>
          <div style={{ fontSize:11, color:thm.textMuted, marginBottom:32, textTransform:"capitalize" }}>{currentDate}</div>
          <div style={{ position:"relative", marginBottom:10 }}>
            <input type={showPass ? "text" : "password"} value={accessCode} onChange={e => setAccessCode(e.target.value)} placeholder="Código de acceso al equipo" autoFocus style={{ width:"100%", background:thm.inputBg, border:`1px solid ${loginError?"#f87171":thm.border}`, borderRadius:8, padding:"12px 40px 12px 12px", color:thm.text, fontSize:14, outline:"none", textAlign:"center", letterSpacing:2 }}/>
            <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>{showPass ? "🙈" : "👁"}</button>
          </div>
          {loginError && <div style={{ fontSize:11, color:"#f87171", marginBottom:12, fontWeight:700 }}>CÓDIGO INVÁLIDO</div>}
          <button type="submit" style={{ width:"100%", background:thm.text, color:thm.bg, border:"none", borderRadius:8, padding:12, fontSize:12, fontWeight:700, cursor:"pointer", letterSpacing:1, textTransform:"uppercase" }}>Acceder al Flujo</button>
        </form>
      </div>
    );
  }

  if (!loaded) return <div style={{ height:"100vh", background:"#0e0d0c", display:"flex", alignItems:"center", justifyContent:"center", color:"#4a4845", fontSize:12, letterSpacing:3 }}>SISTEMA INICIADO...</div>;

  const timeStr = now.toLocaleDateString("es-MX", { weekday:"short", day:"2-digit", month:"short" }) + " · " + now.toLocaleTimeString("es-MX", { hour:"2-digit", minute:"2-digit" });

  return (
    <div style={{ minHeight:"100vh", background:thm.bg, color:thm.text, display:"flex", flexDirection:"column", fontFamily:font }}>
      {/* ── HEADER ── */}
      <div style={{ borderBottom: `1px solid ${thm.border}`, padding: "0 24px", display:"flex", alignItems:"center", height: 60, flexShrink: 0, background: thm.navBg, justifyContent:"space-between" }}>
        <div className="font-serif" style={{ fontSize: 19, letterSpacing: .5 }}>VERSIONA<span style={{ color: "#F47920" }}>O</span><span style={{ color: "#29ABE2", fontStyle: "italic" }}>S</span></div>
        <div style={{ display: "flex", gap: 3, background: thm.surfaceTop, borderRadius: 10, padding: 3 }}>
          {navBtn("dashboard", "Proyectos")}
          {isAdmin && navBtn("equipo", "Equipo", "#29ABE2")}
          {isAdmin && navBtn("completadas", "✓ Análisis Semanal", "#4ade80")}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: session.user === "Diego" ? "#F47920" : "#29ABE2" }}>{session.user}</div>
            <div style={{ fontSize: 9, color: thm.textMuted }}>{timeStr}</div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: thm.surfaceHigh, border: `1px solid ${session.user === "Diego" ? "#F47920" : "#29ABE2"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: session.user === "Diego" ? "#F47920" : "#29ABE2" }}>
            {(session.user || "U").charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* STRIP KPIs */}
      <div style={{ display:"flex", borderBottom:`1px solid ${thm.border}`, background:thm.navBg }}>
        {[{ l:"Activas", v:allPend, c:thm.text }, { l:"Bloqueadas", v:blockedAll.length, c:"#f87171" }, { l:"Listas", v:allDone.length, c:"#4ade80" }].map((k,i) => (
          <div key={i} style={{ flex:1, padding:"10px 8px", textAlign:"center", borderRight:i<2?`1px solid ${thm.border}`:"none" }}>
            <div style={{ fontSize:18, fontWeight:700, color:k.c }}>{k.v}</div>
            <div style={{ fontSize:8, color:thm.textMuted, marginTop:2 }}>{k.l}</div>
          </div>
        ))}
      </div>

      {/* RENDER CUERPO VISTAS */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        {view === "dashboard" && client && (
          <>
            {/* SIDEBAR */}
            <div style={{ width:"240px", borderRight:`1px solid ${thm.border}`, overflowY:"auto", background:thm.surface, flexShrink:0 }}>
              {adminProjects.length > 0 && (
                <div style={{ borderBottom:`1px solid ${thm.border}`, paddingBottom:8, marginBottom:4 }}>
                  <div style={{ padding:"10px 15px 4px", fontSize:8, color:thm.textMuted, letterSpacing:1.5, textTransform:"uppercase", fontWeight:600 }}>⚙️ operación interna</div>
                  {adminProjects.map(c => (
                    <button key={c.id} onClick={() => { setActiveClient(c.id); setShowDone(false); }} style={{ width:"100%", textAlign:"left", padding:"9px 15px", background:c.id===client.id?thm.surfaceHigh:"transparent", border:"none", borderLeft:c.id===client.id?"3px solid #c49a2a":"3px solid transparent", cursor:"pointer", color:c.id===client.id?thm.text:thm.textMuted, fontSize:12 }}>⚙️ {c.name}</button>
                  ))}
                </div>
              )}
              <div style={{ padding:"10px 15px 4px", fontSize:8, color:thm.textMuted, letterSpacing:1.5, textTransform:"uppercase", fontWeight:600 }}>Clientes Activos</div>
              {regularProjects.map(c => (
                <button key={c.id} onClick={() => { setActiveClient(c.id); setShowDone(false); }} style={{ width:"100%", textAlign:"left", padding:"9px 15px", background:c.id===client.id?thm.surfaceHigh:"transparent", border:"none", borderLeft:c.id===client.id?`3px solid ${STA_CLR[c.status]}`:"3px solid transparent", cursor:"pointer", color:c.id===client.id?thm.text:thm.textSub, fontSize:12 }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <span>{c.name}</span>
                    {c.tasks.filter(t=>t.state!=="done").length > 0 && <span style={{ fontSize:9, color:thm.textMuted }}>{c.tasks.filter(t=>t.state!=="done").length}</span>}
                  </div>
                </button>
              ))}
            </div>

            {/* CONTENEDOR TAREAS */}
            <div style={{ flex:1, overflowY:"auto", padding:"28px 36px", background:thm.bg }}>
              <h2 className="font-serif" style={{ margin:"0 0 20px 0", fontSize:28 }}>{client.name}</h2>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {getActiveTasks(client.tasks).map((task, idx) => <TaskRow key={task.id} task={task} cid={client.id} index={idx} {...rowProps}/>)}
              </div>

              {/* CONTROLES CREACIÓN */}
              <div style={{ display:"flex", gap:6, marginTop:20 }}>
                <input value={newTask.text} onChange={e => setNewTask(p => ({ ...p, text: e.target.value.slice(0, MAX_TASK_LEN) }))} onKeyDown={e => e.key === "Enter" && addTask(client.id)} placeholder="Añadir nueva actividad..." style={{ ...inpStyle, flex:1 }}/>
                <select value={newTask.who} onChange={e => setNewTask(p => ({ ...p, who: e.target.value }))} style={inpStyle}>
                  {WHO_LIST.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
                <select value={newTask.priority} onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))} style={inpStyle}>
                  <option value="high">Alta</option>
                  <option value="medium">Media</option>
                  <option value="low">Baja</option>
                </select>
                <button onClick={() => addTask(client.id)} style={{ background:thm.accentBg, color:thm.accentText, border:"none", borderRadius:8, padding:"9px 18px", fontWeight:700, cursor:"pointer" }}>+</button>
              </div>
            </div>
          </>
        )}

        {/* ANÁLISIS TABULA */}
        {view === "completadas" && isAdmin && (
          <AnalysisTab allDone={allDone} weekGroups={weekGroups} teamMembers={teamMembers} clients={clients} />
        )}
      </div>
    </div>
  );
}