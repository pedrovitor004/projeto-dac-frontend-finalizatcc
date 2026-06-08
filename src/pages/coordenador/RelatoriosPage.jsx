import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Download,
  FilePieChart,
  FileSpreadsheet,
  FileText,
  Users,
  AlertCircle,
  TrendingUp,
  Calendar,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getAllAlunos,
  getAllTccs,
  getAllBancas,
  getAllAreas,
  ApiError,
} from "../../services/api";

function errMessage(e, fallback) {
  if (e instanceof ApiError) return e.message;
  return e?.message || fallback;
}

export default function RelatoriosPage() {
  const [loading, setLoading] = useState(true);
  const [alunos, setAlunos] = useState([]);
  const [tccs, setTccs] = useState([]);
  const [bancas, setBancas] = useState([]);
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        const [a, t, b, ar] = await Promise.all([
          getAllAlunos(),
          getAllTccs(),
          getAllBancas(),
          getAllAreas(),
        ]);
        if (!alive) return;
        setAlunos(Array.isArray(a) ? a : []);
        setTccs(Array.isArray(t) ? t : []);
        setBancas(Array.isArray(b) ? b : []);
        setAreas(Array.isArray(ar) ? ar : []);
      } catch (e) {
        toast.error(errMessage(e, "Erro ao carregar relatórios."));
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const totalTccs = tccs.length || 1;
    const aprovados = tccs.filter((t) => t.status === "APROVADO").length;
    const taxa = Math.round((aprovados / totalTccs) * 100);

    const reprovados = tccs.filter((t) => t.status === "REPROVADO").length;

    return {
      taxa: `${Number.isFinite(taxa) ? taxa : 0}%`,
      reprovados,
    };
  }, [tccs]);

  const resumoRelatorio = [
    {
      label: "Taxa de aprovação (aprox.)",
      valor: metrics.taxa,
      trend: "Base: TCCs com status APROVADO / total de TCCs",
      icone: <TrendingUp size={20} className="text-green-600" />,
    },
    {
      label: "TCCs reprovados",
      valor: String(metrics.reprovados),
      trend: "Indicador simples do conjunto atual",
      icone: <FilePieChart size={20} className="text-[#359830]" />,
    },
    {
      label: "Alunos cadastrados",
      valor: String(alunos.length),
      trend: "Total em GET /api/alunos",
      icone: <AlertCircle size={20} className="text-amber-600" />,
    },
  ];

  const porArea = useMemo(() => {
    const map = new Map();

    // “Sem área” sempre existe como bucket
    map.set("Sem área", 0);

    for (const t of tccs) {
      const nome = t.areaNome || "Sem área";
      map.set(nome, (map.get(nome) || 0) + 1);
    }

    // Se existir cadastro de áreas, inclui áreas com 0 TCCs (opcional)
    for (const a of areas) {
      const nome = a?.nome || a?.titulo || a?.descricao;
      if (nome && !map.has(nome)) map.set(nome, 0);
    }

    const items = Array.from(map.entries()).map(([area, qtd]) => ({
      area,
      qtd,
    }));
    items.sort((a, b) => b.qtd - a.qtd);
    return items.filter((x) => x.qtd > 0).slice(0, 12);
  }, [areas, tccs]);

  const maxQtd = useMemo(
    () => Math.max(1, ...porArea.map((x) => x.qtd)),
    [porArea],
  );

  const docRows = useMemo(() => {
    const comOrientador = tccs.filter((t) => !!t.orientadorId).length;
    const semOrientador = tccs.filter((t) => !t.orientadorId).length;

    return [
      {
        doc: "TCCs com orientador associado",
        total: tccs.length,
        ok: comOrientador,
        alert: semOrientador,
      },
      {
        doc: "TCCs em banca / aprovados",
        total: tccs.length,
        ok: tccs.filter(
          (t) => t.status === "EM_BANCA" || t.status === "APROVADO",
        ).length,
        alert: tccs.filter((t) => t.status === "REPROVADO").length,
      },
      {
        doc: "Bancas cadastradas",
        total: bancas.length,
        ok: bancas.filter((b) => b.notaFinal != null).length,
        alert: bancas.filter((b) => b.notaFinal == null).length,
      },
    ];
  }, [tccs, bancas]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-10 text-center text-slate-500">
        Carregando indicadores...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Relatórios e Indicadores
        </h1>
        <p className="text-slate-500 mt-1">
          Métricas calculadas no frontend a partir das listagens da API.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {resumoRelatorio.map((item, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium text-slate-500">{item.label}</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {item.valor}
              </h3>
              <span className="text-xs font-medium text-slate-500 flex items-center mt-1">
                {item.trend}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">{item.icone}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
            <h3 className="text-lg font-bold text-slate-800 flex items-center">
              <Download size={20} className="mr-2 text-[#359830]" />
              Exportar Dados
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-slate-600 mb-4">
              Estes botões são placeholders: exportação “de verdade” normalmente
              vira endpoint no backend (CSV/PDF).
            </p>

            <div className="grid grid-cols-1 gap-3">
              {[
                {
                  nome: "Lista de Alunos e Orientadores",
                  icone: <Users size={18} />,
                  cor: "text-[#359830]",
                },
                {
                  nome: "Status de TCCs (snapshot)",
                  icone: <FileSpreadsheet size={18} />,
                  cor: "text-green-600",
                },
                {
                  nome: "Cronograma de Bancas (snapshot)",
                  icone: <Calendar size={18} />,
                  cor: "text-amber-600",
                },
                {
                  nome: "Relatório de Notas (snapshot)",
                  icone: <FileText size={18} />,
                  cor: "text-purple-600",
                },
              ].map((rel, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors group"
                  onClick={() =>
                    toast(`Exportação (placeholder): ${rel.nome}`, {
                      icon: "ℹ️",
                    })
                  }
                >
                  <div className="flex items-center">
                    <span className={`mr-3 ${rel.cor}`}>{rel.icone}</span>
                    <span className="text-sm font-bold text-slate-700">
                      {rel.nome}
                    </span>
                  </div>
                  <ChevronRight
                    size={18}
                    className="text-slate-300 group-hover:text-slate-500"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
            <h3 className="text-lg font-bold text-slate-800 flex items-center">
              <BarChart3 size={20} className="mr-2 text-[#359830]" />
              TCCs por área (campo areaNome)
            </h3>
          </div>
          <div className="p-6">
            {porArea.length === 0 ? (
              <p className="text-sm text-slate-500">Sem dados.</p>
            ) : (
              <div className="space-y-5">
                {porArea.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-bold text-slate-700">
                        {item.area}
                      </span>
                      <span className="text-slate-500">
                        {item.qtd} projetos
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-[#359830]/100 h-2 rounded-full"
                        style={{
                          width: `${Math.round((item.qtd / maxQtd) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
              Observação: isso depende do backend preencher `areaNome` no
              `TccResponseDTO`.
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">
            Checklist operacional (snapshot)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3">Indicador</th>
                <th className="px-6 py-3 text-center">Universo</th>
                <th className="px-6 py-3 text-center">OK</th>
                <th className="px-6 py-3 text-center">Atenção</th>
                <th className="px-6 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {docRows.map((row, idx) => (
                <tr
                  key={idx}
                  className="text-sm hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {row.doc}
                  </td>
                  <td className="px-6 py-4 text-center text-slate-600">
                    {row.total}
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-green-600">
                    {row.ok}
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-red-500">
                    {row.alert}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      className="text-[#359830] font-bold text-xs hover:underline uppercase"
                      onClick={() =>
                        toast("Próximo passo: gerar notificações no backend.", {
                          icon: "ℹ️",
                        })
                      }
                    >
                      Notificar Todos
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
