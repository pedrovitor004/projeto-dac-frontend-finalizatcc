import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  CheckSquare,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  UploadCloud,
  UserCircle,
  Users,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import finalizaTccLogo from "../assets/Group (1).png";

const menus = {
  ALUNO: [
    { titulo: "Dashboard", icone: LayoutDashboard, path: "/aluno/dashboard" },
    { titulo: "Meu TCC", icone: BookOpen, path: "/aluno/meu-tcc" },
    { titulo: "Submissoes", icone: UploadCloud, path: "/aluno/submissoes" },
    { titulo: "Minha Banca", icone: Calendar, path: "/aluno/banca" },
    { titulo: "Perfil", icone: UserCircle, path: "/aluno/perfil" },
  ],
  PROFESSOR: [
    {
      titulo: "Dashboard",
      icone: LayoutDashboard,
      path: "/professor/dashboard",
    },
    { titulo: "Meus Orientandos", icone: Users, path: "/professor/orientandos" },
    { titulo: "Avaliar Submissoes", icone: CheckSquare, path: "/professor/avaliacoes" },
    { titulo: "Bancas", icone: Calendar, path: "/professor/bancas" },
    { titulo: "Perfil", icone: UserCircle, path: "/professor/perfil" },
  ],
  COORDENADOR: [
    {
      titulo: "Visao Geral",
      icone: LayoutDashboard,
      path: "/coordenador/dashboard",
    },
    { titulo: "Alunos", icone: Users, path: "/coordenador/alunos" },
    { titulo: "Professores", icone: Users, path: "/coordenador/professores" },
    { titulo: "Gerenciar TCCs", icone: BookOpen, path: "/coordenador/tccs" },
    { titulo: "Bancas", icone: Calendar, path: "/coordenador/bancas" },
    { titulo: "Relatorios", icone: FileText, path: "/coordenador/relatorios" },
    { titulo: "Areas", icone: Settings, path: "/coordenador/areas" },
  ],
};

function Sidebar({ currentPath, menu, user, onLogout, onNavigate }) {
  return (
    <aside className="flex h-full w-64 flex-col bg-[#23731f] text-white shadow-xl">
      <div className="flex h-16 items-center border-b border-white/10 bg-[#1f661c] px-4">
        <Link
          to="/"
          onClick={onNavigate}
          className="flex min-w-0 items-center gap-3"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
            <img
              src={finalizaTccLogo}
              alt="Finaliza TCC"
              className="h-7 w-7 object-contain"
            />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold">
              Finaliza TCC
            </span>
            <span className="block truncate text-xs text-white/65">
              {user?.tipo || "Sistema"}
            </span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {menu.map((item) => {
          const Icon = item.icone;
          const active = currentPath === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={`flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${
                active
                  ? "bg-white text-[#23731f] shadow-sm"
                  : "text-white/82 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={19} className="shrink-0" />
              <span className="truncate">{item.titulo}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 bg-[#1f661c] p-3">
        <button
          type="button"
          onClick={onLogout}
          className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold text-white/85 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut size={19} className="shrink-0" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menu = menus[user?.tipo] || [];
  const currentPage = menu.find((item) => item.path === location.pathname);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900">
      <div className="hidden md:block">
        <Sidebar
          currentPath={location.pathname}
          menu={menu}
          user={user}
          onLogout={handleLogout}
        />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            className="absolute inset-0 bg-slate-950/35"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative h-full w-72 max-w-[85vw]">
            <Sidebar
              currentPath={location.pathname}
              menu={menu}
              user={user}
              onLogout={handleLogout}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu size={19} />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-slate-900">
                {currentPage?.titulo || "Inicio"}
              </h1>
              <p className="hidden text-xs text-slate-500 sm:block">
                Finaliza TCC
              </p>
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden min-w-0 text-right sm:block">
              <p className="truncate text-sm font-semibold text-slate-800">
                {user?.nome || "Usuario"}
              </p>
              <p className="text-xs capitalize text-slate-500">
                {user?.tipo?.toLowerCase()}
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#eef8ed] text-sm font-bold text-[#2a7a26]">
              {user?.tipo?.substring(0, 2) || "FT"}
            </div>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 md:hidden"
              onClick={handleLogout}
              aria-label="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
