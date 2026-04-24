import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Paperclip,
  Send,
  GraduationCap,
  MessageSquare,
} from "lucide-react";

const cards = [
  {
    label: "Meu TCC",
    description:
      "Realize o cadastro do seu Tcc para iniciar o ciclo de correções",
    color: "#359830",
    icon: <Paperclip size={30} />,
    route: "/dashboard/meu-tcc",
  },
  {
    label: "Submissões",
    description: "Realize novas submissões de versões do seu Trabalho",
    color: "#C90C0F",
    icon: <Send size={30} />,
    route: "/dashboard/submissoes",
  },
  {
    label: "Resultados",
    description: "Acompanhe seus resultados, marcação de defesa e sua banca",
    color: "#359830",
    icon: <GraduationCap size={30} />,
    route: "/dashboard/resultados",
  },
  {
    label: "Feedback",
    description: "Visualize cronologicamente suas submissões e feedbacks",
    color: "#C90C0F",
    icon: <MessageSquare size={30} />,
    route: "/dashboard/feedback",
  },
];

export default function TopBarComponent({
  userName = "User",
  notifications = [],
}) {
  const navigate = useNavigate();

  return (
    <div
      style={{ padding: "20px 40px", width: "100%", boxSizing: "border-box" }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          padding: "30px 35px",
          boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.03)",
          display: "flex",
          flexDirection: "column",
          gap: "25px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h1
            style={{
              color: "#359830",
              fontSize: "26px",
              fontWeight: "700",
              margin: 0,
              fontFamily: "Inter, sans-serif",
            }}
          >
            Bem vindo {`{{${userName}}}`}
          </h1>
          <button
            style={{
              background: "#fff",
              border: "1px solid #F1F1F1",
              borderRadius: "10px",
              padding: "8px",
              cursor: "pointer",
              color: "#6B7280",
            }}
          >
            <Bell size={20} />
          </button>
        </div>

        {/* Grid de Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "20px",
          }}
        >
          {cards.map((card) => (
            <div
              key={card.label}
              onClick={() => navigate(card.route)}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "22px",
                backgroundColor: "#ffffff",
                borderRadius: "18px",
                minHeight: "180px",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.05)",
                // Ajuste inicial: borda transparente nas laterais/topo e sólida embaixo
                border: "2px solid transparent",
                borderBottom: `6px solid ${card.color}`,
                position: "relative",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                // CORREÇÃO AQUI: Em vez de borderColor (que afeta os 4 lados igualmente),
                // mantemos a diferenciação da borda de baixo.
                e.currentTarget.style.borderTopColor = `${card.color}33`;
                e.currentTarget.style.borderLeftColor = `${card.color}33`;
                e.currentTarget.style.borderRightColor = `${card.color}33`;
                e.currentTarget.style.borderBottomWidth = "6px"; // Garante que continue grossa
                e.currentTarget.style.boxShadow = `0px 12px 20px ${card.color}15`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderTopColor = "transparent";
                e.currentTarget.style.borderLeftColor = "transparent";
                e.currentTarget.style.borderRightColor = "transparent";
                e.currentTarget.style.boxShadow =
                  "0px 4px 15px rgba(0, 0, 0, 0.05)";
              }}
            >
              {/* Topo */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "auto",
                }}
              >
                <div style={{ color: card.color, display: "flex" }}>
                  {card.icon}
                </div>
                <span
                  style={{
                    color: card.color,
                    fontWeight: "700",
                    fontSize: "14px",
                  }}
                >
                  {card.label}
                </span>
              </div>

              {/* Descrição */}
              <p
                style={{
                  margin: "20px 0 0 0",
                  fontSize: "12px",
                  color: card.color,
                  opacity: 0.8,
                  lineHeight: "1.5",
                  fontWeight: "500",
                }}
              >
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
