import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  CheckSquare,
  ChevronsLeft,
  ChevronsRight,
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

function Sidebar({
  collapsed = false,
  currentPath,
  menu,
  user,
  onLogout,
  onNavigate,
  onToggleCollapse,
}) {
  return (
    <aside
      className={`flex h-full flex-col border-r border-slate-200 bg-[#f8faf7] text-slate-800 shadow-xl transition-[width] duration-200 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="border-b border-slate-200 px-3 py-4">
        <Link
          to="/"
          onClick={onNavigate}
          className={`flex min-w-0 items-center gap-3 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm">
            <img
              src={finalizaTccLogo}
              alt="Finaliza TCC"
              className="h-8 w-8 object-contain"
            />
          </span>
          <span className={`min-w-0 ${collapsed ? "hidden" : ""}`}>
            <span className="block truncate text-sm font-bold text-slate-950">
              Finaliza TCC
            </span>
            <span className="block truncate text-xs text-slate-500">
              {user?.tipo || "Sistema academico"}
            </span>
          </span>
        </Link>
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? "Expandir menu" : "Recolher menu"}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            className={`mt-4 hidden h-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[#359830]/35 hover:text-[#23731f] md:flex ${
              collapsed ? "mx-auto w-10" : "w-full gap-2 px-3"
            }`}
          >
            {collapsed ? <ChevronsRight size={17} /> : <ChevronsLeft size={17} />}
            {!collapsed && <span className="text-sm font-semibold">Recolher</span>}
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p
          className={`px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 ${
            collapsed ? "sr-only" : ""
          }`}
        >
          Navegacao
        </p>
        {menu.map((item) => {
          const Icon = item.icone;
          const active = currentPath === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              title={collapsed ? item.titulo : undefined}
              className={`flex h-10 items-center rounded-lg text-sm font-semibold transition ${
                active
                  ? "border border-[#359830]/25 bg-white text-[#1f661c] shadow-sm"
                  : "text-slate-600 hover:bg-white hover:text-slate-950 hover:shadow-sm"
              } ${collapsed ? "justify-center px-0" : "gap-3 px-3"}`}
            >
              <Icon
                size={19}
                className={`shrink-0 ${
                  active ? "text-[#2f8f2b]" : "text-slate-400"
                }`}
              />
              <span className={`truncate ${collapsed ? "hidden" : ""}`}>
                {item.titulo}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <div
          className={`mb-3 rounded-lg border border-[#359830]/25 bg-[#2f8f2b] text-white shadow-sm ${
            collapsed
              ? "flex h-11 items-center justify-center p-0"
              : "px-3 py-2"
          }`}
          title={collapsed ? user?.nome || "Usuario" : undefined}
        >
          {collapsed ? (
            <span className="text-sm font-bold">
              {user?.nome?.substring(0, 1) || "U"}
            </span>
          ) : (
            <>
              <p className="truncate text-sm font-semibold">
                {user?.nome || "Usuario"}
              </p>
              <p className="mt-0.5 text-xs capitalize text-white/75">
                {user?.tipo?.toLowerCase() || "perfil"}
              </p>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={onLogout}
          title={collapsed ? "Sair" : undefined}
          className={`flex h-10 w-full items-center rounded-lg text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-950 hover:shadow-sm ${
            collapsed ? "justify-center px-0" : "gap-3 px-3"
          }`}
        >
          <LogOut size={19} className="shrink-0 text-slate-400" />
          <span className={collapsed ? "hidden" : ""}>Sair</span>
        </button>
      </div>
    </aside>
  );
}

export default function Layout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
    <div className="flex h-screen bg-[#f6f8f5] text-slate-900">
      <div className="hidden md:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          currentPath={location.pathname}
          menu={menu}
          user={user}
          onLogout={handleLogout}
          onToggleCollapse={() => setSidebarCollapsed((current) => !current)}
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
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-[#359830]/35 hover:text-[#23731f] md:hidden"
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
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#359830]/20 bg-[#eef8ed] text-sm font-bold text-[#2a7a26]">
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
