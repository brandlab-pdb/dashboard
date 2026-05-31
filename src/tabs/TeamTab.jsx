// Cálculo exacto del peso y saturación operativa por rol del equipo
  const totalActiveGlobal = clients.flatMap(c => c.tasks ? c.tasks.filter(t => t.state !== "done" && t.state !== "archived") : []).length;

  const pieGradientParts = totalActiveGlobal === 0 
    ? "#4ade80 0% 100%" // Si no hay nada, el pastel completo pasa a verde brillante de victoria
    : teamMembers.map((m) => {
         const mActive = clients.flatMap(c => c.tasks ? c.tasks.filter(t => t.state !== "done" && t.state !== "archived" && t.assigned_to === m.id) : []).length;
         const pct = (mActive / totalActiveGlobal) * 100;
         if (pct === 0) return null;
         const color = getMemberColor(m.name);
         const start = currentDeg;
         currentDeg += pct;
         return `${color} ${start}% ${currentDeg}%`;
      }).filter(Boolean).join(", ");

  const pieStyle = {
     width: 140, height: 140, borderRadius: "50%",
     background: `conic-gradient(${pieGradientParts})`,
     display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 24px rgba(0,0,0,0.5)"
  };