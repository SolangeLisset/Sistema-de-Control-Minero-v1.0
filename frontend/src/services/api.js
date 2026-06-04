import axios from "axios";

// URL base del backend — en desarrollo apunta a localhost
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  headers: { "Content-Type": "application/json" },
});

// ── EQUIPOS ──────────────────────────────────────────────────
export const getEquipos = () => API.get("/equipos");
export const getEquipoById = (id) => API.get(`/equipos/${id}`);
export const createEquipo = (data) => API.post("/equipos", data);
export const updateEquipo = (id, data) => API.put(`/equipos/${id}`, data);
export const deleteEquipo = (id) => API.delete(`/equipos/${id}`);
export const getEquipoMantenciones = (id) => API.get(`/equipos/${id}/mantenciones`);

// ── TÉCNICOS ─────────────────────────────────────────────────
export const getTecnicos = () => API.get("/tecnicos");
export const getTecnicoById = (id) => API.get(`/tecnicos/${id}`);
export const createTecnico = (data) => API.post("/tecnicos", data);
export const updateTecnico = (id, data) => API.put(`/tecnicos/${id}`, data);
export const deleteTecnico = (id) => API.delete(`/tecnicos/${id}`);

// ── MANTENCIONES ─────────────────────────────────────────────
export const getMantenciones = () => API.get("/mantenciones");
export const getMantencionById = (id) => API.get(`/mantenciones/${id}`);
export const createMantencion = (data) => API.post("/mantenciones", data);
export const updateMantencion = (id, data) => API.put(`/mantenciones/${id}`, data);
export const deleteMantencion = (id) => API.delete(`/mantenciones/${id}`);

// ── DASHBOARD ────────────────────────────────────────────────
export const getDashboard = () => API.get("/mantenciones/dashboard");

export default API;
