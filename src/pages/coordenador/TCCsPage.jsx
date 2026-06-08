import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  FileText,
  Clock,
  ExternalLink,
  Info,
  Download,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { getAllTccs, ApiError } from "../../services/api";
import { downloadCsv } from "../../lib/csv";

function errMessage(e, fallback) {
  if (e instanceof ApiError) return e.message;
  return e?.message || fallback;
}

function statusLabel(status) {
  switch (status) {
    case "EM_DESENVOLVIMENTO":
      return "Em desenvolvimento";
    case "EM_BANCA":
      return "Em banca";
    case "APROVADO":
      return "Aprovado";
    case "REPROVADO":
      return "Reprovado";
    case "ARQUIVADO":
      return "Arquivado";
    default:
      return status ? String(status) : "â€”";
  }
}

function parseMaybeLocalDate(value) {
  if (!value) return null;
  if (typeof value === "string") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (Array.isArray(value)) {
    const [y, m, d] = value;
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }
  return null;
}

function formatDateBR(d) {
  if (!d) return "â€”";
  return d.toLocaleDateString("pt-BR");
}

export default function TCCsPage() {
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroFase, setFiltroFase] = useState("Todas");
  const [tccs, setTccs] = useState([]);
  const [tccDetalhe, setTccDetalhe] = useState(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        const t = await getAllTccs();
        if (!alive) return;
        setTccs(Array.isArray(t) ? t : []);
      } catch (e) {
        toast.error(errMessage(e, "Erro ao carregar TCCs."));
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const rows = useMemo(() => {
    return tccs.map((t) => {
      const fase = statusLabel(t.status);
      const ultima =
        parseMaybeLocalDate(t.dataFim) || parseMaybeLocalDate(t.dataInicio);

      let uiStatus = "No Prazo";
      if (t.status === "REPROVADO") uiStatus = "Reprovado";
      else if (t.status === "EM_BANCA") uiStatus = "Em banca";
      else if (!t.orientadorId) uiStatus = "PendÃªncias";

      const progresso =
        t.status === "APROVADO"
          ? 100
          : t.status === "REPROVADO"
            ? 35
            : t.status === "EM_BANCA"
              ? 85
              : t.status === "ARQUIVADO"
                ? 10
                : 60;

      return {
        id: t.id,
        titulo: t.titulo || "Sem tÃ­tulo",
        aluno: t.alunoNome || "â€”",
        orientador: t.orientadorNome || "â€”",
        fase,
        ultimaEntrega: formatDateBR(ultima),
        status: uiStatus,
        progresso,
        raw: t,
      };
    });
  }, [tccs]);

  const tccsFiltrados = rows.filter((tcc) => {
    const termo = busca.toLowerCase();
    const passaBusca =
      tcc.titulo.toLowerCase().includes(termo) ||
      tcc.aluno.toLowerCase().includes(termo);
    const passaFase = filtroFase === "Todas" || tcc.fase === filtroFase;
    return passaBusca && passaFase;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-10 text-center text-slate-500">
        Carregando TCCs...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Projetos de TCC</h1>
          <p className="text-slate-500 mt-1">
            Lista real vinda de `GET /api/tccs`.
          </p>
        </div>
        <button
          type="button"
          className="flex items-center px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors text-sm shadow-sm"
          onClick={() => {
            const ok = downloadCsv(
              "tccs.csv",
              rows.map((tcc) => ({
                titulo: tcc.titulo,
                aluno: tcc.aluno,
                orientador: tcc.orientador,
                fase: tcc.fase,
                ultimaEntrega: tcc.ultimaEntrega,
                status: tcc.status,
              })),
            );
            if (ok) toast.success("Relatorio de TCCs exportado.");
            else toast.error("Nao ha TCCs para exportar.");
          }}
        >
          <Download size={18} className="mr-2 text-[#359830]" />
          RelatÃ³rio de Temas
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar por tÃ­tulo do trabalho ou nome do aluno..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#359830] outline-none transition-all text-sm"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#359830] outline-none text-sm bg-white"
          value={filtroFase}
          onChange={(e) => setFiltroFase(e.target.value)}
        >
          <option value="Todas">Todas as Fases</option>
          <option value="Em desenvolvimento">Em desenvolvimento</option>
          <option value="Em banca">Em banca</option>
          <option value="Aprovado">Aprovado</option>
          <option value="Reprovado">Reprovado</option>
          <option value="Arquivado">Arquivado</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {tccsFiltrados.map((tcc) => (
          <div
            key={tcc.id}
            className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                      tcc.status === "No Prazo"
                        ? "bg-green-100 text-green-700"
                        : tcc.status === "Reprovado"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {tcc.status}
                  </span>
                  <span className="text-slate-300 text-xs">â€¢</span>
                  <span className="text-xs font-medium text-slate-500 flex items-center">
                    <Clock size={12} className="mr-1" /> Ãšltima data:{" "}
                    {tcc.ultimaEntrega}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-800 leading-snug">
                  {tcc.titulo}
                </h3>

                <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm">
                  <div className="flex items-center text-slate-600">
                    <span className="font-semibold text-slate-400 mr-2">
                      ALUNO:
                    </span>
                    {tcc.aluno}
                  </div>
                  <div className="flex items-center text-slate-600">
                    <span className="font-semibold text-slate-400 mr-2">
                      ORIENTADOR:
                    </span>
                    {tcc.orientador}
                  </div>
                </div>
              </div>

              <div className="lg:w-72 flex flex-col justify-center space-y-4 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {tcc.fase}
                    </span>
                    <span className="text-sm font-bold text-[#359830]">
                      {tcc.progresso}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-[#359830] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${tcc.progresso}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center"
                    onClick={() => setTccDetalhe(tcc)}
                  >
                    <Info size={14} className="mr-1.5" /> DETALHES
                  </button>
                  <button
                    type="button"
                    className="flex-1 bg-[#359830]/10 hover:bg-[#359830]/10 text-[#359830] text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center"
                    onClick={() => setTccDetalhe(tcc)}
                  >
                    <ExternalLink size={14} className="mr-1.5" /> ACESSAR TCC
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {tccsFiltrados.length === 0 && (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-slate-800 font-bold">
              Nenhum projeto encontrado
            </h3>
            <p className="text-slate-500 text-sm">
              Tente mudar os filtros ou o termo de busca.
            </p>
          </div>
        )}
      </div>

      {tccDetalhe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-900">
                Detalhes do TCC
              </h2>
              <button
                type="button"
                onClick={() => setTccDetalhe(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-5 p-6">
              <div>
                <span className="rounded-full bg-[#359830]/10 px-3 py-1 text-xs font-bold text-[#2a7725]">
                  {tccDetalhe.fase}
                </span>
                <h3 className="mt-3 text-xl font-bold text-slate-900">
                  {tccDetalhe.titulo}
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase text-slate-400">
                    Aluno
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {tccDetalhe.aluno}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase text-slate-400">
                    Orientador
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {tccDetalhe.orientador}
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-slate-100 p-4">
                <p className="text-xs font-bold uppercase text-slate-400">
                  Resumo
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {tccDetalhe.raw?.resumo || "Resumo nao informado."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


