// src/utils.js
export const WHO_LIST = ["EK", "Artur", "Diego"];
export const PRIO_ORDER = { high: 0, medium: 1, low: 2 };

export const getMemberColor = (name) => {
  const n = (name || "").toLowerCase();
  if (n.includes("diego")) return "#F47920";
  if (n.includes("artur")) return "#7F77DD";
  if (n.includes("héct") || n.includes("ek")) return "#378ADD";
  const palette = ["#f472b6", "#34d399", "#fbbf24", "#60a5fa", "#a78bfa", "#f87171"];
  let hash = 0; for(let i=0; i<name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
};

export const daysSince = (iso) => !iso ? 0 : Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);

export const toWho = (name) => {
  const n = (name || "").toLowerCase();
  if (n.includes("ektor") || n.includes("héct") || n.includes("hect") || n === "ek") return "EK";
  if (n.includes("artur")) return "Artur";
  return "Diego";
};