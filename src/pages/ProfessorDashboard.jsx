export default function ProfessorDashboard() {
  return (
    <div style={{ padding: "0 20px" }}>
      <div style={{ padding: "0 35px" }}>
        <h3 style={{ color: "#359830", fontWeight: "700", fontSize: "24px" }}>
          Trabalhos para Avaliar
        </h3>
        <div
          style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "20px",
            border: "1.5px solid #35983033",
          }}
        >
          <p style={{ color: "#666" }}>
            Nenhum trabalho pendente de correção no momento.
          </p>
        </div>
      </div>
    </div>
  );
}
