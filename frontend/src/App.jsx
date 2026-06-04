import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./components/Toast";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Equipos from "./pages/Equipos";
import Tecnicos from "./pages/Tecnicos";
import Mantenciones from "./pages/Mantenciones";
import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/"             element={<Dashboard />} />
              <Route path="/equipos"      element={<Equipos />} />
              <Route path="/tecnicos"     element={<Tecnicos />} />
              <Route path="/mantenciones" element={<Mantenciones />} />
            </Routes>
          </main>
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}
