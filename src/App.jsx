import React from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

import Layout from "./components/Layout";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

import DashboardAluno from "./pages/aluno/DashboardAluno";
import MeuTccPage from "./pages/aluno/MeutccPage";
import SubmissoesPage from "./pages/aluno/SubmissoesPage";
import BancaPageAluno from "./pages/aluno/BancaPage";
import PerfilAlunoPage from "./pages/aluno/PerfilPage";
import FeedbackPageAluno from "./pages/aluno/FeedbackPage";

import DashboardProfessor from "./pages/professor/DashboardProfessor";
import OrientandosPage from "./pages/professor/OrientandosPage";
import AvaliacoesPage from "./pages/professor/AvaliacoesPage";
import BancasPageProfessor from "./pages/professor/BancasPage";
import PerfilProfessorPage from "./pages/professor/PerfilPage";

import DashboardCoordenador from "./pages/coordenador/DashboardCoordenador";
import AlunosPage from "./pages/coordenador/AlunosPage";
import ProfessoresPage from "./pages/coordenador/ProfessoresPage";
import TCCsPage from "./pages/coordenador/TCCsPage";
import BancasPageCoord from "./pages/coordenador/BancasPage";
import RelatoriosPage from "./pages/coordenador/RelatoriosPage";
import AreasPage from "./pages/coordenador/AreasPage";

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-b-[#359830]" />
        <p className="text-sm font-medium text-slate-500">Carregando...</p>
      </div>
    </div>
  );
}

function HomeRedirect({ user }) {
  const tipo = user?.tipo?.toLowerCase();
  return <Navigate to={tipo ? `/${tipo}/dashboard` : "/login"} replace />;
}

function AppRoutes() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomeRedirect user={user} />} />

        {user?.tipo === "ALUNO" && (
          <>
            <Route path="/aluno/dashboard" element={<DashboardAluno />} />
            <Route path="/aluno/meu-tcc" element={<MeuTccPage />} />
            <Route path="/aluno/submissoes" element={<SubmissoesPage />} />
            <Route path="/aluno/banca" element={<BancaPageAluno />} />
            <Route path="/aluno/perfil" element={<PerfilAlunoPage />} />
            <Route path="/aluno/feedbacks" element={<FeedbackPageAluno />} />
          </>
        )}

        {user?.tipo === "PROFESSOR" && (
          <>
            <Route path="/professor/dashboard" element={<DashboardProfessor />} />
            <Route path="/professor/orientandos" element={<OrientandosPage />} />
            <Route path="/professor/avaliacoes" element={<AvaliacoesPage />} />
            <Route path="/professor/bancas" element={<BancasPageProfessor />} />
            <Route path="/professor/perfil" element={<PerfilProfessorPage />} />
          </>
        )}

        {user?.tipo === "COORDENADOR" && (
          <>
            <Route path="/coordenador/dashboard" element={<DashboardCoordenador />} />
            <Route path="/coordenador/alunos" element={<AlunosPage />} />
            <Route path="/coordenador/professores" element={<ProfessoresPage />} />
            <Route path="/coordenador/tccs" element={<TCCsPage />} />
            <Route path="/coordenador/bancas" element={<BancasPageCoord />} />
            <Route path="/coordenador/relatorios" element={<RelatoriosPage />} />
            <Route path="/coordenador/areas" element={<AreasPage />} />
          </>
        )}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
