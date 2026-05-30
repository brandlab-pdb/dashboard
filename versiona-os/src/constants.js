// src/constants.js
export const TEAM_MEMBERS = ["Héctor", "Arturo", "Diego"];
export const ACCESS_CODES = {
  "superadmin25": { role: "superadmin", user: "Diego" },
  "admin25":      { role: "admin",      user: "Admin" },
  "hector25":     { role: "team",       user: "Héctor" },
  "arturo25":     { role: "team",       user: "Arturo" },
  "diego25":      { role: "team",       user: "Diego" }
};

export const CREATIVE_SERVICES_CATALOG = [
  { id: "srv_reel", name: "Edición de Reel", type: "video" },
  { id: "srv_photo", name: "Sesión de Fotos", type: "production" },
  { id: "srv_carrusel", name: "Carrusel Estratégico", type: "design" },
  { id: "srv_promo", name: "Video Promocional", type: "video" },
  { id: "srv_post", name: "Post Suelto", type: "design" },
  { id: "srv_loc", name: "Grabar Locación", type: "production" }
];