import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Clock,
  FileEdit,
  Filter,
  Mail,
  Search,
  User,
  X,
} from "lucide-react";
import { getTccsByProfessor, getUsuario } from "../../services/api.js";

const STATUS_LABELS = {
  EM_DESENVOLVIMENTO: "Em Andamento",
  EM_BANCA: "Em Banca",
  APROVADO: "Aprovado",
  REPROVADO: "Reprovado",
  ARQUIVADO: "Arquivado",
};

function formatDate(value, fallback = "-") {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function OrientandosPage() {
  const usuario = getUsuario();
  const usuarioId = usuario?.id;

  const [orientandos, setOrientandos] = useState([]);
  const [loading, setLoading] = useState(Boolean(usuarioId));
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [projetoSelecionado, setProjetoSelecionado] = useState(null);

  useEffect(() => {
    if (!usuarioId) return;

    getTccsByProfessor(usuarioId)
      .then((tccs) => {
        const mapped = (Array.isArray(tccs) ? tccs : []).map((tcc) => ({
          id: tcc.id,
          nome: tcc.alunoNome || "Aluno",
          email: tcc.alunoEmail || "",
          alunoId: tcc.alunoId,
          tema: tcc.titulo,
          resumo: tcc.resumo,
          areaNome: tcc.areaNome,
          orientadorNome: tcc.orientadorNome,
          coorientadorNome: tcc.coorientadorNome,
          status: STATUS_LABELS[tcc.status] || tcc.status,
          statusRaw: tcc.status,
          dataInicio: formatDate(tcc.dataInicio),
          prazo:
            tcc.status === "APROVADO"
              ? "Concluido"
              : formatDate(tcc.dataFim),
        }));
        setOrientandos(mapped);
      })
      .catch(() => setErro("Erro ao carregar orientandos."))
      .finally(() => setLoading(false));
  }, [usuarioId]);

  const orientandosFiltrados = orientandos.filter((orientando) => {
    const termo = busca.toLowerCase();
    const passaBusca =
      orientando.nome.toLowerCase().includes(termo) ||
      orientando.tema.toLowerCase().includes(termo);
    const passaStatus =
      filtroStatus === "Todos" || orientando.status === filtroStatus;
    return passaBusca && passaStatus;
  });

  const renderStatusBadge = (status) => {
    switch (status) {
      case "Aprovado":
        return "bg-green-100 text-green-700 border-green-200";
      case "Em Banca":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Reprovado":
        return "bg-red-100 text-red-700 border-red-200";
      case "Arquivado":
        return "bg-slate-100 text-slate-600 border-slate-200";
      case "Em Andamento":
      default:
        return "bg-[#359830]/10 text-[#2a7725] border-[#359830]/20";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Meus Orientandos</h1>
        <p className="text-slate-500 mt-1">
          Acompanhe os projetos de TCC sob sua orientacao e acesse o contexto
          antes de emitir pareceres sobre submissoes.
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nome ou tema..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#359830] focus:border-[#359830] text-sm text-slate-900 outline-none transition-colors"
          />
        </div>

        <div className="flex items-center w-full sm:w-auto space-x-3">
          <div className="flex items-center text-slate-500">
            <Filter size={18} className="mr-2" />
            <span className="text-sm font-medium">Filtrar:</span>
          </div>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="block w-full sm:w-auto pl-3 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#359830] focus:border-[#359830] text-sm text-slate-900 outline-none transition-colors bg-white"
          >
            <option value="Todos">Todos os status</option>
            <option value="Em Andamento">Em Andamento</option>
            <option value="Em Banca">Em Banca</option>
            <option value="Aprovado">Aprovado</option>
            <option value="Reprovado">Reprovado</option>
            <option value="Arquivado">Arquivado</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
          Carregando orientandos...
        </div>
      )}

      {erro && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700 text-sm">
          {erro}
        </div>
      )}

      <div className="space-y-4">
        {!loading && !erro && orientandosFiltrados.length > 0 ? (
          orientandosFiltrados.map((orientando) => (
            <div
              key={orientando.id}
              className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col md:flex-row"
            >
              <div className="p-6 flex-1 flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${renderStatusBadge(orientando.status)}`}
                    >
                      {orientando.status}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-slate-800 mb-1">
                    {orientando.nome}
                  </h2>
                  <div className="flex items-center text-sm text-slate-500 mb-4">
                    <User size={14} className="mr-1.5" />
                    Orientando
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 flex items-center">
                      <BookOpen size={14} className="mr-1.5" /> Tema do TCC
                    </p>
                    <p className="text-sm text-slate-700 font-medium line-clamp-2">
                      {orientando.tema}
                    </p>
                  </div>
                </div>

                <div className="w-full md:w-64 flex flex-col justify-center space-y-4 md:border-l md:border-slate-100 md:pl-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 flex items-center">
                        <FileEdit size={14} className="mr-1.5" /> Inicio:
                      </span>
                      <span className="font-medium text-slate-800">
                        {orientando.dataInicio}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 flex items-center">
                        <Clock size={14} className="mr-1.5" /> Prazo:
                      </span>
                      <span className="font-medium text-slate-800">
                        {orientando.prazo}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-auto flex flex-row md:flex-col justify-end gap-2 md:border-l md:border-slate-100 md:pl-6">
                  <button
                    type="button"
                    onClick={() => setProjetoSelecionado(orientando)}
                    className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 bg-[#359830] hover:bg-[#2a7725] text-white font-medium rounded-lg transition-colors text-sm shadow-sm"
                  >
                    Ver Projeto
                  </button>
                  <a
                    href={orientando.email ? `mailto:${orientando.email}` : undefined}
                    aria-disabled={!orientando.email}
                    className={`flex-1 md:flex-none flex items-center justify-center px-4 py-2 bg-white border border-slate-300 font-medium rounded-lg transition-colors text-sm ${
                      orientando.email
                        ? "text-slate-700 hover:bg-slate-50"
                        : "pointer-events-none text-slate-300 opacity-60"
                    }`}
                  >
                    <Mail size={16} className="mr-2 text-slate-400" />
                    Contato
                  </a>
                </div>
              </div>
            </div>
          ))
        ) : (
          !loading &&
          !erro && (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <User size={32} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                Nenhum orientando encontrado
              </h3>
              <p className="text-slate-500 mt-1 max-w-md">
                Nao encontramos resultados para os filtros aplicados.
              </p>
              <button
                onClick={() => {
                  setBusca("");
                  setFiltroStatus("Todos");
                }}
                className="mt-6 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors text-sm"
              >
                Limpar filtros
              </button>
            </div>
          )
        )}
      </div>

      {projetoSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Projeto do orientando
                </h2>
                <p className="text-sm text-slate-500">
                  {projetoSelecionado.nome}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setProjetoSelecionado(null)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <span
                  className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${renderStatusBadge(projetoSelecionado.status)}`}
                >
                  {projetoSelecionado.status}
                </span>
                <h3 className="mt-3 text-xl font-bold leading-tight text-slate-900">
                  {projetoSelecionado.tema}
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Area
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {projetoSelecionado.areaNome || "Nao informada"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Periodo
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {projetoSelecionado.dataInicio} ate {projetoSelecionado.prazo}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Resumo
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {projetoSelecionado.resumo || "Resumo nao informado."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
