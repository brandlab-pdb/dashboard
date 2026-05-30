// src/tabs/AnalysisTab.jsx
import React, { useState } from "react";
import { thm, getMemberColor } from "../utils";
import WeeklyChart from "../components/WeeklyChart";

export default function AnalysisTab({ clients, allDone, teamMembers }) {
  const [reportData, setReportData] = useState({ success: "", warning: "", issue: "", notes: "" });
  const [waBriefs, setWaBriefs] = useState(null);

  // Cálculos en tiempo real
  const totalCuentas = clients.filter(c => c.dbStatus !== "archived").length;
  const totalProduccion = clients.flatMap(c => c.tasks ? c.tasks.filter(t => t.state !== "done") : []).length;
  const totalPausadas = clients.flatMap(c => c.tasks ? c.tasks.filter(t => t.state === "blocked") : []).length;

  const kpiStyle = { background: thm.surface, borderRadius: 14, padding: 20, border: `1px solid ${thm.border}` };
  const inputStyle = { width: "100%", background: thm.inputBg, border: `1px solid ${thm.borderLight}`, borderRadius: 8, color: thm.text, fontSize: 13, padding: "10px 12px", outline: "none", resize: "none" };

  const generateDailyBriefs = () => {
    setWaBriefs({
      Héctor: "🔥 *Versiona Daily Brief · Héctor*\n• Actualizar flyers de Osos Flag hoy.\n• Revisar pauta Altavia (pausada).",
      Arturo: "📚 *Versiona Daily Brief · Arturo*\n• Enviar propuesta comercial JLFC.\n• Llamar a La Chula para shooting.",
      Diego: "🧠 *Versiona Daily Brief · Diego*\n• Desplegar landing SG Arquitectura.\n• Coordinar producción con Javier."
    });
  };

  return (
    <div className="fade-up" style={{ flex: 1, overflowY: "auto", padding: "32px 40px", background: thm.bg }}>
      
      {/* HEADER AUDITORÍA */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <h2 className="font-serif" style={{ margin: "0 0 6px", fontSize: 32, color: thm.text }}>📊 Auditoría Semanal</h2>
          <p style={{ fontSize: 13, color: thm.textSub, margin: 0 }}>Reporte ejecutivo · {totalCuentas} proyectos activos · {teamMembers.length} integrantes</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-action" style={{ padding: "8px 16px", borderRadius: 6, background: thm.accentBg, color: thm.accentText, fontWeight: 700, border: "none" }}>Nueva Auditoría</button>
          <button className="btn-action" style={{ padding: "8px 16px", borderRadius: 6, background: "transparent", color: thm.textSub, fontWeight: 700, border: `1px solid ${thm.border}` }}>Historial</button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        
        {/* ROW 1: KPIs AUTOMÁTICOS */}
        <div>
          <div style={{ fontSize: 10, color: thm.textMuted, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 700, marginBottom: 12 }}>Métricas en tiempo real</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
            <div style={{ ...kpiStyle, borderLeft: "3px solid #38bdf8" }}>
              <div style={{ fontSize: 9, color: thm.textMuted, fontWeight: 700, letterSpacing: 1.2 }}>CUENTAS ACTIVAS</div>
              <div className="font-serif" style={{ fontSize: 32, color: thm.text, lineHeight: 1, marginTop: 8 }}>{totalCuentas}</div>
            </div>
            <div style={{ ...kpiStyle, borderLeft: "3px solid #4ade80" }}>
              <div style={{ fontSize: 9, color: thm.textMuted, fontWeight: 700, letterSpacing: 1.2 }}>ENTREGADAS</div>
              <div className="font-serif" style={{ fontSize: 32, color: thm.text, lineHeight: 1, marginTop: 8 }}>{allDone.length}</div>
            </div>
            <div style={{ ...kpiStyle, borderLeft: "3px solid #facc15" }}>
              <div style={{ fontSize: 9, color: thm.textMuted, fontWeight: 700, letterSpacing: 1.2 }}>EN PRODUCCIÓN</div>
              <div className="font-serif" style={{ fontSize: 32, color: thm.text, lineHeight: 1, marginTop: 8 }}>{totalProduccion}</div>
            </div>
            <div style={{ ...kpiStyle, borderLeft: "3px solid #f87171" }}>
              <div style={{ fontSize: 9, color: thm.textMuted, fontWeight: 700, letterSpacing: 1.2 }}>PAUSADAS / BLOQUEOS</div>
              <div className="font-serif" style={{ fontSize: 32, color: thm.text, lineHeight: 1, marginTop: 8 }}>{totalPausadas}</div>
            </div>
          </div>
        </div>

        <WeeklyChart allDone={allDone} />

        {/* ROW 2: INDICADORES CLAVE */}
        <div style={kpiStyle}>
          <div style={{ fontSize: 10, color: thm.textMuted, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 700, marginBottom: 16 }}>Indicadores clave — Llena según tu observación</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ fontSize: 10, color: thm.textMuted, fontWeight: 700, marginBottom: 6, display: "block" }}>ADOPCIÓN REAL (%) — Dashboard vs WhatsApp</label>
              <input type="number" defaultValue="80" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 10, color: thm.textMuted, fontWeight: 700, marginBottom: 6, display: "block" }}>PREGUNTAS DE ESTATUS (# veces "¿en qué va?")</label>
              <input type="number" defaultValue="0" style={inputStyle} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: 10, color: thm.textMuted, fontWeight: 700, marginBottom: 6, display: "block" }}>SALUD EMOCIONAL DEL EQUIPO</label>
              <input placeholder="Ej: 'EK con mucha carga', 'Artur cerró propuesta, energía alta'" style={inputStyle} />
            </div>
          </div>
        </div>

        {/* ROW 3: SEMÁFORO DE LA SEMANA */}
        <div style={kpiStyle}>
          <div style={{ fontSize: 10, color: thm.textMuted, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Semáforo de la semana</div>
          <div style={{ fontSize: 12, color: thm.textSub, marginBottom: 20 }}>Los 3 momentos más importantes del periodo.</div>
          
          <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
            <span style={{ fontSize: 24 }}>🏆</span>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 11, color: "#4ade80", fontWeight: 700, letterSpacing: 1 }}>EL LOGRO DE LA SEMANA</div>
              <textarea placeholder="Describe el impacto específico (qué se entregó, a quién, resultado)..." rows="2" style={inputStyle}></textarea>
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
            <span style={{ fontSize: 24 }}>🚀</span>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 11, color: "#facc15", fontWeight: 700, letterSpacing: 1 }}>EL AVANCE DESTACADO</div>
              <textarea placeholder="¿Qué se activó o desbloqueó esta semana?" rows="2" style={inputStyle}></textarea>
            </div>
          </div>

          <div style={{ display: "flex", gap: 16 }}>
            <span style={{ fontSize: 24 }}>⚠</span>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 11, color: "#f87171", fontWeight: 700, letterSpacing: 1 }}>EL RIESGO A RESOLVER</div>
              <textarea placeholder="¿Qué lleva semanas parado? ¿Cuál es la prioridad inmediata?" rows="2" style={inputStyle}></textarea>
            </div>
          </div>
        </div>

        {/* ROW 4: WHATSAPP BRIEFING LOOP */}
        <div style={kpiStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: thm.text }}>WhatsApp Daily Briefing Loop</div>
              <div style={{ fontSize: 11, color: thm.textMuted }}>Genera la matriz de comunicación de estado para el equipo.</div>
            </div>
            <button onClick={generateDailyBriefs} style={{ background: thm.text, color: thm.bg, border: "none", padding: "8px 16px", borderRadius: 6, fontWeight: 700, cursor: "pointer", fontSize: 11 }}>
              Generar Briefings →
            </button>
          </div>

          {waBriefs && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              {Object.entries(waBriefs).map(([name, msg]) => (
                <div key={name} style={{ background: thm.inputBg, padding: 16, borderRadius: 8, border: `1px solid ${thm.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: getMemberColor(name) }}>{name}</span>
                    <button onClick={() => navigator.clipboard.writeText(msg)} style={{ background: "none", border: "none", color: "#4ade80", fontSize: 10, cursor: "pointer", fontWeight: 700 }}>Copiar</button>
                  </div>
                  <pre style={{ margin: 0, fontSize: 11, whiteSpace: "pre-wrap", color: thm.textSub, fontFamily: "inherit", lineHeight: 1.5 }}>{msg}</pre>
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="btn-action" style={{ padding: "14px", background: thm.accentBg, color: thm.accentText, border: "none", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 700, width: "100%" }}>Guardar Auditoría Definitiva</button>

      </div>
    </div>
  );
}