import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  UserPlus,
  Mail,
  Users,
  BookOpen,
  Settings,
  AlertCircle,
  MoreVertical,
} from "lucide-react";
import toast from "react-hot-toast";
import { getAllProfessores, getAllTccs, ApiError } from "../../services/api";

function errMessage(e, fallback) {
  if (e instanceof ApiError) return e.message;
  return e?.message || fallback;
}

export default function ProfessoresPage() {
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroVagas, setFiltroVagas] = useState("Todos");

  const [professores, setProfessores] = useState([]);
  const [tccs, setTccs] = useState([]);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        const [p, t] = await Promise.all([getAllProfessores(), getAllTccs()]);
        if (!alive) return;
        setProfessores(Array.isArray(p) ? p : []);
        setTccs(Array.isArray(t) ? t : []);
      } catch (e) {
        toast.error(errMessage(e, "Erro ao carregar professores."));
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const orientandosCount = useMemo(() => {
    const map = new Map();
    for (const p of professores) map.set(p.id, 0);

    for (const t of tccs) {
      if (!t?.orientadorId) continue;
      if (!map.has(t.orientadorId)) map.set(t.orientadorId, 0);
      map.set(t.orientadorId, (map.get(t.orientadorId) || 0) + 1);
    }
    return map;
  }, [professores, tccs]);

  const cards = useMemo(() => {
    // UI antiga tinha “limite”; como o backend não fornece, usamos default 8
    const defaultLimite = 8;

    return professores.map((p) => {
      const atuais = orientandosCount.get(p.id) || 0;
      const limite = defaultLimite;
      return {
        id: p.id,
        nome: p.nome,
        email: p.email,
        departamento: "—",
        areas: [p.areaAtuacao].filter(Boolean),
        orientandosAtuais: atuais,
        limiteOrientandos: limite,
        status: "Ativo",
      };
    });
  }, [professores, orientandosCount]);

  const professoresFiltrados = cards.filter((prof) => {
    const termoBusca = busca.toLowerCase();
    const passaBusca =
      prof.nome.toLowerCase().includes(termoBusca) ||
      prof.areas.some((area) => area.toLowerCase().includes(termoBusca));

    let passaVagas = true;
    if (filtroVagas === "Com Vagas")
      passaVagas =
        prof.orientandosAtuais < prof.limiteOrientandos &&
        prof.status === "Ativo";
    else if (filtroVagas === "Sem Vagas")
      passaVagas = prof.orientandosAtuais >= prof.limiteOrientandos;
    else if (filtroVagas === "Afastados") passaVagas = prof.status !== "Ativo";

    return passaBusca && passaVagas;
  });

  const calcularOcupacao = (atuais, limite) => {
    if (limite === 0) return 100;
    return Math.round((atuais / limite) * 100);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-10 text-center text-slate-500">
        Carregando professores...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Corpo Docente</h1>
          <p className="text-slate-500 mt-1">
            Professores reais. “Orientandos” é contagem de TCCs onde o professor
            é orientador.
          </p>
        </div>
        <button
          type="button"
          className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-[#359830] text-white font-medium rounded-lg hover:bg-[#2a7725] transition-colors text-sm shadow-sm"
          onClick={() =>
            toast("Cadastro público de professor já existe em /register.", {
              icon: "ℹ️",
            })
          }
        >
          <UserPlus size={18} className="mr-2" /> Novo Professor
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nome ou área de atuação..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#359830] focus:border-[#359830] sm:text-sm text-slate-900 outline-none transition-colors"
          />
        </div>

        <div className="flex items-center w-full md:w-auto">
          <Filter size={18} className="mr-2 text-slate-400 shrink-0" />
          <select
            value={filtroVagas}
            onChange={(e) => setFiltroVagas(e.target.value)}
            className="block w-full sm:w-48 pl-3 pr-8 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#359830] focus:border-[#359830] sm:text-sm text-slate-900 outline-none transition-colors bg-white"
          >
            <option value="Todos">Todos os Professores</option>
            <option value="Com Vagas">Com Vagas Disponíveis</option>
            <option value="Sem Vagas">Sem Vagas (Lotados)</option>
            <option value="Afastados">Afastados / Licença</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {professoresFiltrados.length > 0 ? (
          professoresFiltrados.map((prof) => {
            const ocupacao = calcularOcupacao(
              prof.orientandosAtuais,
              prof.limiteOrientandos,
            );
            const lotado = prof.orientandosAtuais >= prof.limiteOrientandos;
            const inativo = prof.status !== "Ativo";

            return (
              <div
                key={prof.id}
                className={`bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col transition-shadow hover:shadow-md ${
                  inativo
                    ? "border-slate-200 opacity-75"
                    : lotado
                      ? "border-red-100"
                      : "border-slate-200"
                }`}
              >
                <div className="p-5 flex items-start justify-between border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        inativo
                          ? "bg-slate-100 text-slate-400"
                          : "bg-[#359830]/10 text-[#2a7725]"
                      }`}
                    >
                      {prof.nome.split(" ")[1]?.charAt(0)}
                      {prof.nome.split(" ").pop()?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 leading-tight">
                        {prof.nome}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {prof.departamento}
                      </p>
                      <p
                        className="text-[11px] text-slate-400 mt-1 truncate max-w-[240px]"
                        title={prof.email}
                      >
                        {prof.email}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-50 transition-colors"
                  >
                    <MoreVertical size={18} />
                  </button>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <div className="mb-5">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                        <Users size={14} className="mr-1.5" /> Orientandos
                        (TCCs)
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          inativo
                            ? "bg-slate-100 text-slate-600"
                            : lotado
                              ? "bg-red-50 text-red-700"
                              : "bg-green-50 text-green-700"
                        }`}
                      >
                        {inativo
                          ? "Indisponível"
                          : `${prof.orientandosAtuais} / ${prof.limiteOrientandos} (limite UI)`}
                      </span>
                    </div>

                    {!inativo && (
                      <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            lotado
                              ? "bg-red-500"
                              : ocupacao > 75
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                          style={{ width: `${ocupacao}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                      <BookOpen size={14} className="mr-1.5" /> Área / Titulação
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {prof.areas.map((area, index) => (
                        <span
                          key={index}
                          className="inline-block px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-medium rounded-md"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-3">
                      Titulação:{" "}
                      <span className="font-semibold text-slate-700">
                        {professores.find((x) => x.id === prof.id)?.titulacao ||
                          "—"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors text-xs shadow-sm"
                    onClick={() => {
                      if (prof.email)
                        navigator.clipboard?.writeText(prof.email);
                      toast.success("E-mail copiado (se permitido).");
                    }}
                  >
                    <Mail size={14} className="mr-1.5 text-slate-400" /> Contato
                  </button>
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors text-xs shadow-sm"
                    onClick={() =>
                      toast("Ajuste de vagas precisa de campo no backend.", {
                        icon: "ℹ️",
                      })
                    }
                  >
                    <Settings size={14} className="mr-1.5 text-slate-400" />{" "}
                    Ajustar Vagas
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full bg-white rounded-xl border border-slate-200 p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <AlertCircle size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              Nenhum professor encontrado
            </h3>
            <p className="text-slate-500 mt-1 max-w-md">
              Não encontramos resultados para os filtros aplicados.
            </p>
            <button
              type="button"
              onClick={() => {
                setBusca("");
                setFiltroVagas("Todos");
              }}
              className="mt-6 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors text-sm"
            >
              Limpar Filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
