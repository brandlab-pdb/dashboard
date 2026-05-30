/* eslint-disable react/prop-types */
import React, { useState } from "react";
import WeeklyChart from "../components/WeeklyChart";

export default function AnalysisTab({ allDone, weekGroups, teamMembers, thm, clients }) {
  const [reportData, setReportData] = useState({ success: "", warning: "", issue: "", focus: "" });
  const [waBriefs, setWaBriefs] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const getMemberColor = (name) => {
    const n = (name || "").toLowerCase();
    if (n.includes("diego")) return "#F47920";
    if (n.includes("artur")) return "#7F77DD";
    if (n.includes("héct") || n.includes("ek")) return "#378ADD";
    return "#60a5fa";
  };

  const generateDailyBriefs = async () => {
    setLoadingAI(true);
    // Simulación del motor Claude/Supabase para WhatsApp loops
    setTimeout(() => {
      setWaBriefs({
        Héctor: "🔥 *Versiona Daily Brief · Héctor*\n• Terminar los flyers de Osos Flag hoy.\n• Reactivar stories en Plaza Altavia (Lleva 4 días parado ⏸).",
        Arturo: "📚 *Versiona Daily Brief · Arturo*\n• Enviar propuesta JLFC $5k/mes.\n• Llamar a La Chula para cerrar shooting.",
        Diego: "🧠 *Versiona Daily Brief · Diego*\n• Desplegar landing de SG Arquitectura.\n• Coordinar shoot en Karola con Javier."
      });
      setLoadingAI(false);
    }, 1500);
  };

  return (
    <div className="fade-up" style={{ padding: "32px 40px", background: thm.bg, width: "100%", height: "100%", overflowY: "auto" }}>
      <h2 className="font-serif" style={{ fontSize: 32, marginBottom: 6 }}>📊 Centro de Auditoría y Reporte Semanal</h2>
      <p style={{ fontSize: 13, color: thm.textSub, marginBottom: 28 }}>Monitoreo de momentum operativo, distribución de cierre e ingeniería de fricciones.</p>

      {/* MÉTRICAS SUPERIORES TIPO IPHONE STORAGE */}
      <div style={{ background: thm.surface, padding: 24, borderRadius: 14, border: `1px solid ${thm.border}`, marginBottom: 28, display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 10, color: thm.textMuted, fontWeight: 700, letterSpacing: 1 }}>EFICIENCIA GLOBAL</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#4ade80", marginTop: 4 }}>{allDone.length} <span style={{ fontSize: 13, color: thm.textMuted, fontWeight: 400 }}>Cerradas con éxito</span></div>
        </div>
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ fontSize: 11, color: thm.textSub, marginBottom: 8 }}>Distribución de Cierre en este Ciclo</div>
          <div style={{ display: "flex", height: 12, borderRadius: 6, overflow: "hidden", background: thm.inputBg, gap: 1 }}>
            {teamMembers.map(m => {
              const count = allDone.filter(t => t.assigned_to === m.id).length;
              const pct = (count / (allDone.length || 1)) * 100;
              return pct > 0 ? <div key={m.id} style={{ width: `${pct}%`, background: getMemberColor(m.name), transition: "width 0.5s" }} title={`${m.name}: ${count}`} /> : null;
            })}
          </div>
        </div>
      </div>

      <WeeklyChart allDone={allDone} />

      {/* FORMULARIO DE SEMÁFORO DE INCIDENCIAS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, marginBottom: 28 }}>
        <div style={{ background: thm.surface, padding: 20, borderRadius: 12, border: `1px solid ${thm.border}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#4ade80", marginBottom: 12 }}>🏆 COMPLETADO CON ÉXITO (Semaforo Verde)</div>
          <textarea value={reportData.success} onChange={e => setReportData({...reportData, success: e.target.value})} placeholder="Ej: Smash Burger — 4 reels + galería listos antes del deadline..." style={{ width: "100%", height: 80, background: thm.inputBg, border: `1px solid ${thm.border}`, borderRadius: 8, color: thm.text, padding: 10, fontSize: 12, resize: "none" }} />
        </div>
        <div style={{ background: thm.surface, padding: 20, borderRadius: 12, border: `1px solid ${thm.border}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#facc15", marginBottom: 12 }}>⚠ TRABAS OPERATIVAS (Semáforo Amarillo)</div>
          <textarea value={reportData.warning} onChange={e => setReportData({...reportData, warning: e.target.value})} placeholder="Ej: Altavia — stories paradas esperando respuesta del cliente..." style={{ width: "100%", height: 80, background: thm.inputBg, border: `1px solid ${thm.border}`, borderRadius: 8, color: thm.text, padding: 10, fontSize: 12, resize: "none" }} />
        </div>
      </div>

      {/* GENERADOR DE DAILY BRIEF PARA WHATSAPP */}
      <div style={{ background: thm.surface, padding: 24, borderRadius: 12, border: `1px solid ${thm.border}`, marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>WhatsApp Daily Briefing Generator</div>
            <div style={{ fontSize: 11, color: thm.textMuted, marginTop: 2 }}>Copia los bloques unificados por persona con el tono premium de Versiona.</div>
          </div>
          <button onClick={generateDailyBriefs} style={{ background: thm.text, color: thm.bg, border: "none", padding: "8px 16px", borderRadius: 6, fontWeight: 700, cursor: "pointer", fontSize: 11 }}>{loadingAI ? "Procesando matriz..." : "Generar Mensajes →"}</button>
        </div>

        {waBriefs && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 16 }}>
            {Object.entries(waBriefs).map(([name, msg]) => (
              <div key={name} style={{ background: thm.inputBg, padding: 16, borderRadius: 8, border: `1px solid ${thm.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: getMemberColor(name) }}>{name}</span>
                  <button onClick={() => navigator.clipboard.writeText(msg)} style={{ background: "none", border: "none", color: "#4ade80", fontSize: 10, cursor: "pointer", fontWeight: 700 }}>Copiar</button>
                </div>
                <pre style={{ margin: 0, fontVeriariable: "monospace", fontSize: 11, whiteSpace: "pre-wrap", color: thm.textSub, lineHeight: 1.5 }}>{msg}</pre>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* REPETIDOR DE HISTORIAL POR SEMANAS */}
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: thm.textMuted, marginBottom: 16 }}>Semanas Archivadas</div>
      {weekGroups.map(group => (
        <div key={group.key} style={{ marginBottom: 20 }}>
          <div className="week-divider">
            <span style={{ fontSize: 11, color: thm.textMuted, fontWeight: 700, letterSpacing: 1.5 }}>{group.label} <span style={{ color: "#4ade80" }}>· {group.tasks.length} cerradas</span></span>
            <div className="week-divider-line" />
          </div>
          {group.tasks.map(t => (
            <div key={t.id} style={{ display: "flex", padding: "10px 14px", background: thm.surface, borderRadius: 8, border: `1px solid ${thm.border}`, fontSize: 12, marginBottom: 4, opacity: 0.7 }}>
              <span style={{ color: "#4ade80", marginRight: 10 }}>✓</span>
              <div style={{ flex: 1 }}>{t.text} <span style={{ color: thm.textMuted, fontSize: 10 }}>📁 {t.cname}</span></div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}