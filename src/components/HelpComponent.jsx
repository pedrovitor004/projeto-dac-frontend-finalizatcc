import { Heart, GraduationCap, Laptop, HelpingHand } from "lucide-react"; // Adicionei o HelpingHand

const helpCards = [
  {
    title: "Conversor PDF",
    description:
      "Olá usuário, posso te ajudar em rotinas acadêmicas com mais facilidade? se você deseja converter arquivos de Word para PDF, clique no link abaixo:",
    buttonText: "ilove PDF Convert",
    icon: <Heart size={42} fill="#C90C0F" stroke="none" />,
  },
  {
    title: "Google Acadêmico",
    description:
      "Olá usuário, posso te ajudar em rotinas acadêmicas com mais facilidade? se você deseja pesquisar artigos e referências bibliográficas, clique no link abaixo:",
    buttonText: "Google Acadêmico",
    icon: <GraduationCap size={42} strokeWidth={1.5} color="#C90C0F" />,
  },
  {
    title: "Workspace",
    description:
      "Olá usuário, posso te ajudar em rotinas acadêmicas com mais facilidade? se você deseja acessar as ferramentas do google, clique no link abaixo:",
    buttonText: "Google Workspace",
    icon: <Laptop size={42} strokeWidth={1.5} color="#C90C0F" />,
  },
];

export default function HelpComponent() {
  return (
    <div
      style={{
        padding: "0 40px 20px 40px",
        width: "100%",
        boxSizing: "border-box",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Título com o novo ícone de mãozinha */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "20px",
          paddingLeft: "35px",
        }}
      >
        <h2
          style={{
            color: "#359830",
            fontSize: "26px",
            fontWeight: "700",
            margin: 0,
          }}
        >
          Ajuda
        </h2>
        {/* Ícone de Mãos dadas substituindo o '!' */}
        <HelpingHand size={30} color="#359830" strokeWidth={2.5} />
      </div>

      {/* Grid de Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "25px",
          padding: "0 35px",
        }}
      >
        {helpCards.map((card, index) => (
          <div
            key={index}
            style={{
              backgroundColor: "#F3F4F6",
              borderRadius: "24px",
              padding: "25px 30px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              minHeight: "300px",
              transition: "all 0.3s ease",
              border: "1.5px solid #C90C0F33",
              boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.03)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#C90C0F66";
              e.currentTarget.style.boxShadow =
                "0px 4px 12px rgba(0, 0, 0, 0.06)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#C90C0F33";
              e.currentTarget.style.boxShadow =
                "0px 2px 8px rgba(0, 0, 0, 0.03)";
            }}
          >
            <div style={{ marginBottom: "15px" }}>{card.icon}</div>

            <h3
              style={{
                color: "#C90C0F",
                fontSize: "20px",
                fontWeight: "700",
                margin: "0 0 10px 0",
              }}
            >
              {card.title}
            </h3>

            <p
              style={{
                color: "#C90C0F",
                fontSize: "12px",
                lineHeight: "1.4",
                fontWeight: "500",
                margin: 0,
              }}
            >
              {card.description}
            </p>

            <button
              style={{
                backgroundColor: "#C90C0F",
                color: "white",
                border: "none",
                borderRadius: "10px",
                padding: "10px 20px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                marginTop: "auto",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: "0px 4px 8px rgba(201, 12, 15, 0.15)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#A50A0D";
                e.currentTarget.style.transform =
                  "translateY(-2px) scale(1.03)";
                e.currentTarget.style.boxShadow =
                  "0px 6px 15px rgba(201, 12, 15, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#C90C0F";
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow =
                  "0px 4px 8px rgba(201, 12, 15, 0.15)";
              }}
            >
              {card.buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
