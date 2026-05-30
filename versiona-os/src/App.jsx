// src/App.jsx
import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";
import { WHO_LIST, WIP_LIMIT, ACCESS_CODES } from "./constants";
import TaskRow from "./components/TaskRow";
import WeeklyChart from "./components/WeeklyChart";

export default function App() {
  const [session, setSession] = useState({ loggedIn: false, role: null, user: null });
  const [clients, setClients] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [view, setView] = useState("dashboard");
  const [activeClient, setActiveClient] = useState(null);

  // Lógica de carga y sync (Aquí irá tu lógica real de Supabase)
  const sync = useCallback(async () => {
    // Tu lógica de fetch que ya tenías
  }, [session]);

  if (!session.loggedIn) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Aquí va tu formulario de login con el enlace al admin */}
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Tu navegación, KPIs y renderizado de vistas */}
      {view === "dashboard" && clients.map(c => (
        <div key={c.id}>
           {c.tasks.map((t, i) => (
             <TaskRow key={t.id} task={t} cid={c.id} index={i} />
           ))}
        </div>
      ))}
      
      {view === "completadas" && (
         <WeeklyChart allDone={clients.flatMap(c => c.tasks.filter(t => t.state === "done"))} thm={{}} />
      )}
    </div>
  );
}