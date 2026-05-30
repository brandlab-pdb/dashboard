// src/utils.js
export const thm = {
  bg: "#080a0e", surface: "#11141a", surfaceHigh: "#161b24", surfaceTop: "#1c222d",
  border: "rgba(255,255,255,0.08)", borderLight: "rgba(255,255,255,0.04)",
  text: "#eef0f3", textSub: "rgba(238,240,243,0.6)", textMuted: "rgba(238,240,243,0.38)", textFaint: "rgba(255,255,255,0.1)",
  accentBg: "#eef0f3", accentText: "#080a0e", inputBg: "#0a0c10", navBg: "#080a0e",
  states: {
    pending:   { bg:"#161b24",              text:"rgba(238,240,243,0.5)", border:"rgba(255,255,255,0.08)", label:"Pendiente"   },
    inprogress:{ bg:"rgba(250,204,21,0.1)", text:"#facc15", border:"rgba(250,204,21,0.2)",  label:"En proceso"  },
    blocked:   { bg:"rgba(248,113,113,0.1)",text:"#f87171", border:"rgba(248,113,113,0.2)", label:"Pausado"     },
    in_review: { bg:"rgba(56,189,248,0.1)", text:"#38bdf8", border:"rgba(56,189,248,0.2)",  label:"En Revisión" },
    done:      { bg:"rgba(74,222,128,0.1)", text:"#4ade80", border:"rgba(74,222,128,0.2)",  label:"✓ Listo"     },
  }
};

export const getMemberColor = (name) => {
  const n = (name || "").toLowerCase();
  if (n.includes("diego")) return "#F47920";
  if (n.includes("artur")) return "#7F77DD";
  if (n.includes("héct") || n.includes("ek")) return "#378ADD";
  return "#60a5fa";
};

export const PRIO_ORDER = { high: 0, medium: 1, low: 2 };