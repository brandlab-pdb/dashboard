/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";
import { thm, getMemberColor, PRIO_ORDER, PRIO_CYCLE, STATE_CYCLE } from "./utils"; // Todo viene de Utils!
import TaskRow from "./components/TaskRow";
import TeamTab from "./tabs/TeamTab";
import AnalysisTab from "./tabs/AnalysisTab";

const ORG_ID = "00000000-0000-0000-0000-000000000001";
const WHO_LIST = ["EK", "Artur", "Diego"];
const TASK_CATS = [{ value: "🔥", label: "🔥 Rápida" }, { value: "📚", label: "📚 Profunda" }, { value: "🧑‍🧒‍🧒", label: "🧑‍🧒‍🧒 Reunión" }, { value: "🧠", label: "🧠 Aprendizaje" }];

const ACCESS_CODES_STATIC = {
  "brandlab2025": { role: "superadmin", user: "Brand Lab" },
  "admin2025": { role: "admin", user: "Admin OS" },
  "versiona25": { role: "team", user: "Diego" },
  "hector25": { role: "team", user: "Héctor" },
  "arturo25": { role: "team", user: "Arturo" },
};

const toDbName = (who) => who === "EK" ? "Ektor" : who === "Artur" ? "Arturo Macías" : "Diego Beltrán";
const toWho = (name) => {
  const n = (name || "").toLowerCase();
  if (n.includes("ektor") || n.includes("héct")) return "EK";
  if (n.includes("artur")) return "Artur";
  return "Diego";
};

// ── RENDER PRINCIPAL DEL CORE OS ───────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState({ loggedIn: false, role: null, user: null });
  const [accessCode, setAccessCode] = useState("");
  const [view, setView] = useState("dashboard");
  const [clients, setClients] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [activeClient, setActiveClient] = useState(null);
  const [newTask, setNewTask] = useState({ text: "", who: "EK", priority: "medium", category: "🔥" });

  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, []);

  const syncPipeline = useCallback(async () => {
    try {
      const { data: dbMembers } = await supabase.from("team_members").select("*");
      const { data: dbProjects } = await supabase.from("projects").select("*");
      const { data: dbTasks } = await supabase.from("tasks").select("*");
      
      setTeamMembers(dbMembers || []);
      const mapped = (dbProjects || []).map(proj => {
        let tasks = (dbTasks || []).filter(t => t.project_id === proj.id).map(t => {
          const member = (dbMembers || []).find(m => m.id === t.assigned_to);
          return { id: t.id, text: t.title, who: member ? toWho(member.name) : "EK", state: t.status, priority: t.priority, category: t.task_type || "🔥", blockedSince: t.status === "blocked" ? t.updated_at : null, completedAt: t.status === "done" ? t.updated_at : null, deadline: t.deadline, blocked_reason: t.blocked_reason, revisions: t.revisions || 0 };
        });
        let calcStatus = "green";
        if (tasks.some(t => t.state === "blocked")) calcStatus = "red";
        else if (tasks.some(t => t.state === "inprogress")) calcStatus = "yellow";
        return { id: proj.id, name: proj.name, type: proj.client || "proyecto", status: calcStatus, dbStatus: proj.status, tasks };
      });
      setClients(mapped);
      if (mapped.length > 0 && !activeClient) setActiveClient(mapped.find(c => c.dbStatus !== 'archived')?.id || mapped[0].id);
    } catch (e) { console.error(e); }
  }, [activeClient]);

  useEffect(() => { if (session.loggedIn) syncPipeline(); }, [session.loggedIn, syncPipeline]);

  const handleLogin = (e) => {
    e.preventDefault();
    const match = ACCESS_CODES_STATIC[accessCode.trim().toLowerCase()];
    if (match) setSession({ loggedIn: true, ...match });
    else alert("Código inválido");
  };

  const navBtn = (id, label, accentColor) => (
    <button className="nav-btn" onClick={() => setView(id)} style={{ background: view === id ? (accentColor || thm.accentBg) : "transparent", color: view === id ? (accentColor ? "#080a0e" : thm.accentText) : thm.textSub, padding: "8px 16px", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>{label}</button>
  );

  const isAdmin = session.role === "admin" || session.role === "superadmin";
  const allPend = clients.reduce((acc, c) => acc + (c.tasks ? c.tasks.filter(t => t.state !== "done").length : 0), 0);
  const blockedAll = clients.flatMap(c => c.tasks ? c.tasks.filter(t => t.state === "blocked") : []);
  const allDone = clients.flatMap(c => c.tasks ? c.tasks.filter(t => t.state === "done") : []);
  const client = clients.find(c => c.id === activeClient) || clients[0];
  const inpStyle = { background: thm.inputBg, border: `1px solid ${thm.border}`, borderRadius: 8, color: thm.text, fontSize: 12, padding: "10px 14px", outline: "none" };

  if (!session.loggedIn) {
    return (
      <div style={{ height: "100vh", background: thm.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <form onSubmit={handleLogin} style={{ background: thm.surface, padding: 40, borderRadius: 16, border: `1px solid ${thm.border}`, width: 360, textAlign: "center" }}>
          <div className="font-serif" style={{ fontSize: 26, color: thm.text, marginBottom: 20 }}>VERSIONA<span style={{ color: "#F47920" }}>O</span><span style={{ color: "#29ABE2" }}>S</span></div>
          <input type="password" value={accessCode} onChange={e => setAccessCode(e.target.value)} placeholder="Código de acceso" style={{ width: "100%", background: thm.inputBg, border: `1px solid ${thm.border}`, borderRadius: 8, padding: "12px", color: thm.text, marginBottom: 20, textAlign: "center" }} />
          <button type="submit" style={{ width: "100%", background: thm.text, color: thm.bg, padding: 12, borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>Entrar</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: thm.bg, color: thm.text, display: "flex", flexDirection: "column" }}>
      {/* HEADER ORIGINAL CIRCULAR */}
      <div style={{ borderBottom: `1px solid ${thm.border}`, padding: "0 24px", display: "flex", alignItems: "center", height: 60, flexShrink: 0, background: thm.navBg }}>
        <div className="font-serif" style={{ fontSize: 19, letterSpacing: .5 }}>VERSIONA<span style={{ color: "#F47920" }}>O</span><span style={{ color: "#29ABE2" }}>S</span></div>
        <div style={{ display: "flex", gap: 3, background: thm.surfaceTop, borderRadius: 10, padding: 3, marginLeft: 20 }}>
          {navBtn("dashboard", "Proyectos")}
          {isAdmin && navBtn("equipo", "Equipo", "#29ABE2")}
          {isAdmin && navBtn("completadas", "✓ Análisis Semanal", "#4ade80")}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: "auto" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: session.user === "Diego" ? "#F47920" : "#29ABE2" }}>{session.user}</div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: thm.surfaceHigh, border: `1px solid ${session.user === "Diego" ? "#F47920" : "#29ABE2"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: session.user === "Diego" ? "#F47920" : "#29ABE2" }}>
            {(session.user || "U").charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", borderBottom: `1px solid ${thm.border}`, background: thm.navBg }}>
        {[{ l: "Activas", v: allPend, c: thm.text }, { l: "Bloqueadas", v: blockedAll.length, c: "#f87171" }, { l: "Listas", v: allDone.length, c: "#4ade80" }].map((k, i) => (
          <div key={i} style={{ flex: 1, padding: "10px 8px", textAlign: "center", borderRight: i < 2 ? `1px solid ${thm.border}` : "none" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: k.c }}>{k.v}</div>
            <div style={{ fontSize: 8, color: thm.textMuted, marginTop: 2 }}>{k.l}</div>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {view === "dashboard" && client && (
          <div style={{ display: "flex", width: "100%" }}>
            {/* AQUÍ VA EL SIDEBAR Y EL TASKROW NORMAL QUE YA TE FUNCIONA */}
            <div style={{ width: 240, borderRight: `1px solid ${thm.border}`, background: thm.surface, padding: 20 }}>
               <h3 style={{ fontSize: 12, color: thm.textMuted, textTransform: "uppercase" }}>Clientes Activos</h3>
               {clients.map(c => <button key={c.id} onClick={() => setActiveClient(c.id)} style={{ width: "100%", textAlign: "left", padding: 10, background: c.id === client.id ? thm.surfaceHigh : "transparent", border: "none", color: thm.text, cursor: "pointer", borderRadius: 8 }}>{c.name}</button>)}
            </div>
            <div style={{ flex: 1, padding: 40, background: thm.bg, overflowY: "auto" }}>
               <h2 className="font-serif">{client.name}</h2>
               {/* Aquí renderizas tus <TaskRow /> */}
               <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
                  <input value={newTask.text} onChange={e => setNewTask({...newTask, text: e.target.value})} style={{...inpStyle, flex: 1}} placeholder="Nueva tarea..." />
                  <button style={{ padding: "10px 20px", background: thm.accentBg, color: thm.accentText, borderRadius: 8, fontWeight: 700, border: "none" }}>+</button>
               </div>
            </div>
          </div>
        )}
        
        {view === "equipo" && isAdmin && <TeamTab teamMembers={teamMembers} clients={clients} />}
        {view === "completadas" && isAdmin && <AnalysisTab allDone={allDone} clients={clients} teamMembers={teamMembers} />}
      </div>
    </div>
  );
}