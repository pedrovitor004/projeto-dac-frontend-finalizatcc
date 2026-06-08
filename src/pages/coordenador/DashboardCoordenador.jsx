import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  BookOpen,
  GraduationCap,
  Award,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
  Clock,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import CardStats from "../../components/shared/CardStats";
import {
  getAllAlunos,
  getAllProfessores,
  getAllTccs,
  getAllBancas,
  ApiError,
} from "../../services/api";

function errMessage(e, fallback) {
  if (e instanceof ApiError) return e.message;
  return e?.message || fallback;
}

function parseMaybeLocalDateTime(value) {
  if (!value) return null;
  if (typeof value === "string") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (Array.isArray(value)) {
    const [y, m, d, hh = 0, mm = 0, ss = 0] = value;
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d, hh, mm, ss);
  }
  return null;
}

function formatDateTimeBR(dt) {
  if (!dt) return "—";
  return dt.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
      return status ? String(status) : "—";
  }
}

export default function DashboardCoordenador() {
  const [loading, setLoading] = useState(true);
  const [alunos, setAlunos] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [tccs, setTccs] = useState([]);
  const [bancas, setBancas] = useState([]);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        const [a, p, t, b] = await Promise.all([
          getAllAlunos(),
          getAllProfessores(),
          getAllTccs(),
          getAllBancas(),
        ]);
        if (!alive) return;
        setAlunos(Array.isArray(a) ? a : []);
        setProfessores(Array.isArray(p) ? p : []);
        setTccs(Array.isArray(t) ? t : []);
        setBancas(Array.isArray(b) ? b : []);
      } catch (e) {
        toast.error(errMessage(e, "Erro ao carregar painel."));
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const estatisticas = useMemo(() => {
    const professoresAtivos = professores.filter((p) => !!p?.id).length;
    const tccsEmAndamento = tccs.filter(
      (t) => t?.status !== "ARQUIVADO",
    ).length;

    const agora = new Date();
    const em30dias = new Date(agora.getTime() + 30 * 24 * 60 * 60 * 1000);

    const bancasProx30 = bancas.filter((b) => {
      const dt = parseMaybeLocalDateTime(b?.data);
      if (!dt) return false;
      return dt >= agora && dt <= em30dias;
    }).length;

    return {
      totalAlunos: alunos.length,
      professoresAtivos,
      tccsEmAndamento,
      bancasAgendadas: bancasProx30,
    };
  }, [alunos, professores, tccs, bancas]);

  const statusTCCs = useMemo(() => {
    const counts = {
      EM_DESENVOLVIMENTO: 0,
      EM_BANCA: 0,
      APROVADO: 0,
      REPROVADO: 0,
      ARQUIVADO: 0,
      OUTROS: 0,
    };

    for (const t of tccs) {
      const s = t?.status;
      if (s && Object.prototype.hasOwnProperty.call(counts, s)) counts[s] += 1;
      else counts.OUTROS += 1;
    }

    const total = tccs.length || 1;

    const rows = [
      {
        label: "Em desenvolvimento",
        valor: counts.EM_DESENVOLVIMENTO,
        cor: "bg-[#359830]",
      },
      {
        label: "Em banca",
        valor: counts.EM_BANCA,
        cor: "bg-[#359830]/100",
      },
      {
        label: "Aprovados",
        valor: counts.APROVADO,
        cor: "bg-green-500",
      },
      {
        label: "Reprovados",
        valor: counts.REPROVADO,
        cor: "bg-red-500",
      },
      {
        label: "Arquivados",
        valor: counts.ARQUIVADO,
        cor: "bg-slate-400",
      },
    ].filter((r) => r.valor > 0);

    return rows.map((r) => ({
      ...r,
      porcentagem: `${Math.round((r.valor / total) * 100)}%`,
    }));
  }, [tccs]);

  const alertasAdministrativos = useMemo(() => {
    const alunoComTcc = new Set(tccs.map((t) => t.alunoId).filter(Boolean));
    const semTcc = alunos.filter((a) => a?.id && !alunoComTcc.has(a.id)).length;

    const semOrientador = tccs.filter((t) => !t?.orientadorId).length;

    const avaliadoresMinimo = 2; // regra “de UI” (ajuste se seu domínio for outro)
    const bancasSemAvaliadores = bancas.filter((b) => {
      void avaliadoresMinimo;
      // backend não retorna lista de avaliadores no DTO; aqui usamos heurística via notaFinal nula
      // (não é perfeito, mas evita mock)
      return b?.notaFinal == null;
    }).length;

    const alertas = [];

    if (semOrientador > 0) {
      alertas.push({
        id: 1,
        titulo: "TCCs sem orientador vinculado",
        descricao: `Existem ${semOrientador} TCC(s) sem orientador associado.`,
        criticidade: "alta",
        acao: "Gerenciar TCCs",
      });
    }

    if (semTcc > 0) {
      alertas.push({
        id: 2,
        titulo: "Alunos sem TCC cadastrado",
        descricao: `Existem ${semTcc} aluno(s) sem TCC registrado no sistema.`,
        criticidade: "media",
        acao: "Ver Alunos",
      });
    }

    if (bancasSemAvaliadores > 0) {
      alertas.push({
        id: 3,
        titulo: "Bancas possivelmente incompletas",
        descricao: `Há ${bancasSemAvaliadores} banca(s) sem nota final registrada (pode indicar pendências).`,
        criticidade: "media",
        acao: "Gerenciar Bancas",
      });
    }

    if (alertas.length === 0) {
      alertas.push({
        id: 99,
        titulo: "Nada crítico no radar",
        descricao: "Não encontramos alertas automáticos com os dados atuais.",
        criticidade: "baixa",
        acao: "Ver relatórios",
      });
    }

    return alertas;
  }, [alunos, tccs, bancas]);

  const atividadesRecentes = useMemo(() => {
    // “Atividade recente” derivada dos TCCs (melhor que mock)
    const items = tccs
      .map((t) => ({
        id: t.id,
        usuario: t.orientadorNome || "Orientador",
        acao: "Status do TCC:",
        alvo: `${t.titulo || "Sem título"} (${t.alunoNome || "Aluno"})`,
        tempo: statusLabel(t.status),
      }))
      .slice(0, 6);

    return items;
  }, [tccs]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-10 text-center text-slate-500">
        Carregando painel...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Painel da Coordenação
          </h1>
          <p className="text-slate-500 mt-1">
            Visão geral com base nos dados reais carregados da API.
          </p>
        </div>
        <button
          type="button"
          className="px-4 py-2 bg-[#359830] text-white font-medium rounded-lg hover:bg-[#2a7725] transition-colors text-sm shadow-sm flex items-center"
          onClick={() =>
            toast("Abra a tela de Relatórios para exportações.", { icon: "ℹ️" })
          }
        >
          <FileText size={18} className="mr-2" />
          Gerar Relatórios
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <CardStats
          titulo="Total de Alunos"
          valor={estatisticas.totalAlunos}
          descricao="Cadastrados no sistema"
          icone={<Users size={24} />}
          corBg="bg-[#359830]/10"
          corTexto="text-[#359830]"
        />
        <CardStats
          titulo="Professores"
          valor={estatisticas.professoresAtivos}
          descricao="Cadastrados no sistema"
          icone={<GraduationCap size={24} />}
          corBg="bg-[#359830]/10"
          corTexto="text-[#359830]"
        />
        <CardStats
          titulo="TCCs ativos"
          valor={estatisticas.tccsEmAndamento}
          descricao="Exclui arquivados do contador"
          icone={<BookOpen size={24} />}
          corBg="bg-emerald-50"
          corTexto="text-emerald-600"
        />
        <CardStats
          titulo="Bancas (30 dias)"
          valor={estatisticas.bancasAgendadas}
          descricao="Com data entre hoje e +30 dias"
          icone={<Award size={24} />}
          corBg="bg-amber-50"
          corTexto="text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <AlertTriangle size={20} className="mr-2 text-red-500" />
                Atenção Requerida
              </h3>
            </div>

            <div className="divide-y divide-slate-100 p-2">
              {alertasAdministrativos.map((alerta) => (
                <div
                  key={alerta.id}
                  className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <span
                        className={`w-2 h-2 rounded-full mr-2 ${
                          alerta.criticidade === "alta"
                            ? "bg-red-500"
                            : alerta.criticidade === "media"
                              ? "bg-yellow-500"
                              : "bg-slate-300"
                        }`}
                      />
                      <h4 className="font-bold text-slate-800">
                        {alerta.titulo}
                      </h4>
                    </div>
                    <p className="text-sm text-slate-600 ml-4">
                      {alerta.descricao}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 w-full sm:w-auto px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors text-sm shadow-sm flex items-center justify-center"
                    onClick={() =>
                      toast(
                        "Use o menu lateral para ir à área correspondente.",
                        {
                          icon: "ℹ️",
                        },
                      )
                    }
                  >
                    {alerta.acao} <ChevronRight size={16} className="ml-1" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <TrendingUp size={20} className="mr-2 text-[#359830]" />
                Distribuição por status (TCC)
              </h3>
            </div>
            <div className="p-6">
              {statusTCCs.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Nenhum TCC cadastrado ainda.
                </p>
              ) : (
                <div className="space-y-6">
                  {statusTCCs.map((status, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-bold text-slate-700">
                          {status.label}
                        </span>
                        <div className="text-right">
                          <span className="text-sm font-bold text-slate-800">
                            {status.valor} TCCs
                          </span>
                          <span className="text-xs text-slate-500 ml-2">
                            ({status.porcentagem})
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${status.cor}`}
                          style={{ width: status.porcentagem }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <Clock size={20} className="mr-2 text-slate-500" />
                Destaques de TCCs
              </h3>
            </div>

            <div className="p-6">
              {atividadesRecentes.length === 0 ? (
                <p className="text-sm text-slate-500">Sem TCCs para listar.</p>
              ) : (
                <div className="relative border-l border-slate-200 ml-3 space-y-6">
                  {atividadesRecentes.map((atividade) => (
                    <div key={atividade.id} className="relative pl-6">
                      <span className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-white border-2 border-[#359830] ring-4 ring-white" />
                      <div>
                        <p className="text-sm text-slate-800 leading-tight">
                          <span className="font-bold">{atividade.usuario}</span>{" "}
                          {atividade.acao}{" "}
                          <span className="font-medium text-[#359830]">
                            {atividade.tempo}
                          </span>
                          <br />
                          <span className="text-slate-600">
                            {atividade.alvo}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">
                Próximas bancas
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {bancas.length === 0 ? (
                <p className="text-sm text-slate-500 px-2">
                  Nenhuma banca cadastrada.
                </p>
              ) : (
                bancas
                  .map((b) => ({ b, dt: parseMaybeLocalDateTime(b?.data) }))
                  .filter((x) => x.dt)
                  .sort((a, b) => a.dt - b.dt)
                  .slice(0, 6)
                  .map(({ b, dt }) => (
                    <div
                      key={b.id}
                      className="w-full text-left px-4 py-3 rounded-lg border border-slate-100 bg-slate-50"
                    >
                      <div className="text-sm font-bold text-slate-800">
                        Banca agendada{" "}
                        <span className="text-slate-500 font-medium">
                          · {formatDateTimeBR(dt)}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        Local: {b.local || "—"}{" "}
                        {b.notaFinal != null ? `· Nota: ${b.notaFinal}` : ""}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
