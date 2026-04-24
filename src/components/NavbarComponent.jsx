import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Power, ChevronLeft, ChevronRight } from "lucide-react";

import logoImg from "../assets/logo.png";
import inicioIcon from "../assets/inicio.png";
import clipIcon from "../assets/clip.png";
import studentIcon from "../assets/student.png";
import feedbackIcon from "../assets/feedback.png";
import ajustesIcon from "../assets/ajustes.png";

const menuByRole = {
  ALUNO: [
    { label: "Início", icon: inicioIcon, path: "/dashboard/aluno" },
    { label: "Meu TCC", icon: clipIcon, path: "/meu-tcc" },
    { label: "Submissões", icon: clipIcon, path: "/submissoes" },
    { label: "Resultados", icon: studentIcon, path: "/resultados" },
    { label: "Feedback", icon: feedbackIcon, path: "/feedback" },
    { label: "Ajustes", icon: ajustesIcon, path: "/ajustes" },
  ],
  PROFESSOR: [
    { label: "Início", icon: inicioIcon, path: "/dashboard/professor" },
    { label: "Orientações", icon: studentIcon, path: "/orientacoes" },
    { label: "Avaliações", icon: clipIcon, path: "/avaliacoes" },
    { label: "Ajustes", icon: ajustesIcon, path: "/ajustes" },
  ],
  COORDENACAO: [
    { label: "Início", icon: inicioIcon, path: "/dashboard/coordenacao" },
    { label: "Gerenciar Cursos", icon: studentIcon, path: "/gerenciar-cursos" },
    { label: "Relatórios", icon: clipIcon, path: "/relatorios" },
    { label: "Configurações", icon: ajustesIcon, path: "/configuracoes" },
  ],
};

export default function NavBarComponent({ onLogout, userRole }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Define os itens do menu baseados no cargo (fallback para ALUNO)
  const navItems = menuByRole[userRole] || menuByRole.ALUNO;

  return (
    <nav
      style={{
        width: collapsed ? "64px" : "220px",
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #359830, #113210)",
        display: "flex",
        flexDirection: "column",
        alignItems: collapsed ? "center" : "flex-start",
        padding: "16px 0",
        transition: "width 0.3s ease",
        boxShadow: "2px 0 8px rgba(0,0,0,0.4)",
        position: "relative",
        flexShrink: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          padding: "8px 0 16px",
          borderBottom: "1px solid rgba(255,255,255,0.15)",
          marginBottom: "8px",
        }}
      >
        <img
          src={logoImg}
          alt="Logo"
          style={{
            width: collapsed ? "36px" : "52px",
            height: collapsed ? "36px" : "52px",
            objectFit: "contain",
            transition: "all 0.3s",
          }}
        />
      </div>

      {/* Nav Items Dinâmicos */}
      <div
        style={{
          flex: 1,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          padding: "0 8px",
        }}
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.label : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                width: "100%",
                padding: collapsed ? "12px 0" : "12px 14px",
                justifyContent: collapsed ? "center" : "flex-start",
                background: isActive ? "rgba(255,255,255,0.2)" : "transparent",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                color: "white",
                fontSize: "14px",
                fontWeight: isActive ? "600" : "400",
                transition: "all 0.2s",
              }}
            >
              <img
                src={item.icon}
                alt={item.label}
                style={{
                  width: "20px",
                  height: "20px",
                  filter: isActive ? "brightness(1.2)" : "brightness(1)",
                }}
              />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Botão Collapse */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: "absolute",
          top: "40px",
          right: "-12px",
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          background: "#359830",
          border: "1px solid rgba(255,255,255,0.3)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Logout */}
      <div
        style={{
          width: "100%",
          padding: "12px 8px",
          borderTop: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        <button
          onClick={onLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            width: "100%",
            padding: collapsed ? "10px 0" : "10px 12px",
            justifyContent: collapsed ? "center" : "flex-start",
            background: "transparent",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            color: "rgba(255,255,255,0.7)",
          }}
        >
          <Power size={18} />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </nav>
  );
}
