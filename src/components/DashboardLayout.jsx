import { Outlet } from "react-router-dom";
import NavBarComponent from "./NavBarComponent";
import HelpComponent from "./HelpComponent";

const DashboardLayout = () => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole"); // Limpa o cargo ao sair
    window.location.href = "/";
  };

  // Aqui pegamos o cargo salvo no login.
  // Ex: No seu Login.jsx, você deve fazer localStorage.setItem("userRole", "ALUNO")
  const currentUserRole = localStorage.getItem("userRole") || "ALUNO";

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
      }}
    >
      {/* Menu Lateral - Passando o cargo detectado */}
      <NavBarComponent onLogout={handleLogout} userRole={currentUserRole} />

      {/* Área da Direita */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <main style={{ flex: 1, overflowY: "auto" }}>
          {/* O conteúdo da página (Aluno, Prof ou Coord) aparece aqui */}
          <Outlet />
        </main>

        {/* Ajuda comum a todos no rodapé */}
        <HelpComponent />
      </div>
    </div>
  );
};

export default DashboardLayout;
