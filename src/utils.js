export const ORG_ID = "00000000-0000-0000-0000-000000000001";
export const WIP_LIMIT = 5;
export const MAX_TASK_LEN = 200;
export const WHO_LIST = ["Héctor", "Arturo", "Diego"];
export const TYPES = ["membresía", "proyecto", "prospecto", "admin"];
export const PRIO_ORDER = { high: 0, medium: 1, low: 2 };
export const PRIO_CYCLE = ["high", "medium", "low"];
export const font = "'DM Sans', system-ui, sans-serif";

export const CREATIVE_SERVICES_CATALOG = [
  { id: "srv_reel", name: "Edición de Reel", type: "video" },
  { id: "srv_photo", name: "Sesión de Fotos", type: "production" },
  { id: "srv_carrusel", name: "Carrusel Estratégico", type: "design" },
  { id: "srv_promo", name: "Video Promocional", type: "video" },
  { id: "srv_post", name: "Post Suelto", type: "design" },
  { id: "srv_loc", name: "Grabar Locación", type: "production" }
];

export const STATE_CYCLE = {
  pending: "inprogress",
  inprogress: "blocked",
  blocked: "in_review",
  in_review: "done",
  done: "pending",
};

export const thm = {
  bg: "#080a0e", surface: "#11141a", surfaceHigh: "#161b24", surfaceTop: "#1c222d",
  border: "rgba(255,255,255,0.08)", borderLight: "rgba(255,255,255,0.04)",
  text: "#eef0f3", textSub: "rgba(238,240,243,0.6)", textMuted: "rgba(238,240,243,0.38)", textFaint: "rgba(255,255,255,0.1)",
  accentBg: "#eef0f3", accentText: "#080a0e", inputBg: "#0a0c10", navBg: "#080a0e",
  deleteBg: "rgba(248,113,113,0.1)", deleteText: "#f87171", deleteBorder: "rgba(248,113,113,0.2)",
  wipBg: "rgba(248,113,113,0.1)", blockedBg: "rgba(248,113,113,0.05)",
  states: {
    pending: { bg: "#161b24", text: "rgba(238,240,243,0.5)", border: "rgba(255,255,255,0.08)", label: "Pendiente" },
    inprogress: { bg: "rgba(250,204,21,0.1)", text: "#facc15", border: "rgba(250,204,21,0.2)", label: "En proceso" },
    blocked: { bg: "rgba(248,113,113,0.1)", text: "#f87171", border: "rgba(248,113,113,0.2)", label: "Pausado" },
    in_review: { bg: "rgba(56,189,248,0.1)", text: "#38bdf8", border: "rgba(56,189,248,0.2)", label: "En Revisión" },
    done: { bg: "rgba(74,222,128,0.1)", text: "#4ade80", border: "rgba(74,222,128,0.2)", label: "✓ Listo" },
  },
  dlDue: { bg: "rgba(248,113,113,0.1)", text: "#f87171", border: "rgba(248,113,113,0.2)" },
  dlSoon: { bg: "rgba(250,204,21,0.1)", text: "#facc15", border: "rgba(250,204,21,0.2)" },
  dlOk: { text: "rgba(238,240,243,0.4)" },
};

export const STA_CLR = { green: "#4ade80", yellow: "#facc15", red: "#f87171" };
export const PRIO_CLR = { high: "#f87171", medium: "#facc15", low: "#4ade80" };
export const PRIO_LBL = { high: "Alta", medium: "Media", low: "Baja" };

export const ACCESS_CODES_STATIC = {
  "brandlab2025": { role: "superadmin", user: "Brand Lab" },
  "admin2025": { role: "admin", user: "Admin OS" },
  "diego2025": { role: "team", user: "Diego" },
  "versiona25": { role: "team", user: "Diego" },
  "ek2025": { role: "team", user: "Héctor" },
  "ektor25": { role: "team", user: "Héctor" },
  "hector25": { role: "team", user: "Héctor" },
  "artur2025": { role: "team", user: "Arturo" },
  "arturo25": { role: "team", user: "Arturo" },
};

export const daysSince = (iso) => !iso ? 0 : Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);

export const deadlineInfo = (dl) => {
  if (!dl) return null;
  const diff = Math.ceil((new Date(dl) - new Date().setHours(0,0,0,0)) / 86400000);
  if (diff < 0) return { label: `⏳ ${Math.abs(diff)}d atrasado`, status: "due" };
  if (diff === 0) return { label: "⏰ Se entrega HOY", status: "due" };
  if (diff === 1) return { label: "⏰ Mañana", status: "soon" };
  if (diff <= 3) return { label: `⏰ ${diff}d`, status: "soon" };
  return { label: new Date(dl).toLocaleDateString("es-MX", { day: "2-digit", month: "short" }), status: "ok" };
};

export const toWho = (name) => {
  const n = (name || "").toLowerCase();
  if (n.includes("ektor") || n.includes("héct") || n.includes("hect") || n === "ek") return "Héctor";
  if (n.includes("artur")) return "Arturo";
  return "Diego";
};

export const getMemberColor = (name) => {
  const n = (name || "").toLowerCase();
  if (n.includes("diego")) return "#F47920";
  if (n.includes("artur")) return "#7F77DD";
  if (n.includes("héct") || n.includes("ek")) return "#378ADD";
  return "#60a5fa";
};

export const getWeekKey = (dateString) => {
  if (!dateString) return { key: "zzz", label: "Sin fecha" };
  const d = new Date(dateString); d.setHours(0, 0, 0, 0);
  const day = d.getDay() || 7; d.setDate(d.getDate() + 4 - day);
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  const monday = new Date(d); monday.setDate(d.getDate() - 3);
  return { key: `${d.getFullYear()}-W${weekNo.toString().padStart(2, '0')}`, label: `Semana ${weekNo} · Inicia el ${monday.toLocaleDateString("es-MX", {day:"2-digit", month:"short"})}` };
};

export const groupDoneByWeek = (tasks) => {
  if (!tasks) return [];
  const groups = {};
  tasks.forEach(t => {
    const { key, label } = getWeekKey(t.completedAt);
    if (!groups[key]) groups[key] = { label, key, tasks: [] };
    groups[key].tasks.push(t);
  });
  return Object.entries(groups).sort((a,b) => b[0].localeCompare(a[0])).map(([,g]) => g);
};

export const sortProjects = (list) => [...list].sort((a, b) => {
  const pendA = a.tasks ? a.tasks.filter(t=>t.state!=="done").length : 0;
  const pendB = b.tasks ? b.tasks.filter(t=>t.state!=="done").length : 0;
  if (pendB !== pendA) return pendB - pendA;
  const colorOrder = { red: 0, yellow: 1, green: 2 };
  return (colorOrder[a.status] ?? 2) - (colorOrder[b.status] ?? 2);
});

export const injectStyles = () => {
  if (document.getElementById("versiona-styles")) return;
  const s = document.createElement("style");
  s.id = "versiona-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
    *{font-family:'DM Sans',system-ui,sans-serif!important;box-sizing:border-box;}
    .font-serif{font-family:'DM Serif Display',Georgia,serif!important;font-weight:normal;}
    ::-webkit-scrollbar{width:3px;height:3px}
    ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px}
    input,select,textarea{font-family:'DM Sans',sans-serif!important; outline:none;}
    input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(0.5);cursor:pointer;}
    select option{background:#11141a;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
    .fade-up{animation:fadeUp 0.3s ease-out forwards;}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
    .pulse{animation:pulse 2s ease-in-out infinite;}
    @keyframes livepulse{0%,100%{transform:scale(1);opacity:0.4;}50%{transform:scale(1.4);opacity:0.1;}}
    .prog-bar{height:3px;background:#1c222d;border-radius:2px;overflow:hidden;border:1px solid rgba(255,255,255,0.06);}
    .prog-fill{height:100%;border-radius:2px;transition:width 0.4s;}
    .nav-btn{padding:8px 16px;border:none;border-radius:6px;cursor:pointer;font-size:11px;font-weight:700;transition:all .2s;white-space:nowrap;}
    .task-row{transition:all .15s;} .task-row:hover{transform:translateY(-1px);}
    .btn-action{transition:all .15s;} .btn-action:hover{filter:brightness(1.15);}
    .eye-btn{background:none;border:none;cursor:pointer;color:rgba(238,240,243,0.4);padding:0 4px;font-size:16px;transition:color .15s;position:absolute;right:12px;top:50%;transform:translateY(-50%);}
    .kpi{background:#11141a;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:16px;position:relative;overflow:hidden;}
    .kpi::before{content:'';position:absolute;top:0;left:0;width:3px;height:100%;}
    .kpi.k-green::before{background:#4ade80;} .kpi.k-red::before{background:#f87171;} .kpi.k-blue::before{background:#38bdf8;}
    .kpi-val{font-family:'DM Serif Display',serif;font-size:26px;line-height:1;}
    .kpi-lbl{font-size:10px;color:rgba(238,240,243,0.38);margin-top:6px;}
    .semaforo-win{background:rgba(74,222,128,0.05);border:1px solid rgba(74,222,128,0.2);border-radius:10px;padding:14px 16px;display:flex;gap:12px;align-items:flex-start;}
    .semaforo-warn{background:rgba(250,204,21,0.05);border:1px solid rgba(250,204,21,0.2);border-radius:10px;padding:14px 16px;display:flex;gap:12px;align-items:flex-start;}
    .semaforo-risk{background:rgba(248,113,113,0.05);border:1px solid rgba(248,113,113,0.2);border-radius:10px;padding:14px 16px;display:flex;gap:12px;align-items:flex-start;}
    .week-divider{display:flex;align-items:center;gap:12px;margin:20px 0 10px;}
    .week-divider-line{flex:1;height:1px;background:rgba(255,255,255,0.06);}

    /* AVATAR GLOW CSS */
    .avatar-container { position:relative; display:inline-flex; align-items:center; justify-content:center; width:38px; height:38px; cursor:pointer; }
    .avatar-glow { position:absolute; width:100%; height:100%; border-radius:50%; animation:livepulse 2.5s infinite ease-in-out; z-index:0; transition:all 0.3s; opacity:0.4; }
    .avatar-container:hover .avatar-glow { transform:scale(1.4); opacity:0.8; animation:none; box-shadow:0 0 15px currentColor; }
    .avatar-circle { position:relative; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:700; z-index:1; background:#161b24; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
  `;
  document.head.appendChild(s);
};