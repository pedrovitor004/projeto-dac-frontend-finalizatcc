import React, { useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import {
  AlertCircle,
  Calendar,
  ChevronRight,
  Download,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  ApiError,
  getAllAlunos,
  getAllAreas,
  getAllBancas,
  getAllTccs,
} from "../../services/api";

const chartGreen = "#2f8f2b";
const chartGreenDark = "#23731f";
const chartAmber = "#f59e0b";
const chartRed = "#dc2626";
const chartSlate = "#64748b";

function errMessage(e, fallback) {
  if (e instanceof ApiError) return e.message;
  return e?.message || fallback;
}

function parseDate(value) {
  if (!value) return null;
  if (Array.isArray(value)) {
    const [year, month, day, hour = 0, minute = 0] = value;
    return year && month && day
      ? new Date(year, month - 1, day, hour, minute)
      : null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function monthLabel(date) {
  return date.toLocaleDateString("pt-BR", {
    month: "short",
    year: "2-digit",
  });
}

function baseChartOptions(extra = {}) {
  return {
    chart: {
      fontFamily: "Inter, Arial, sans-serif",
      foreColor: "#475569",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: "#e2e8f0",
      strokeDashArray: 4,
    },
    legend: {
      fontSize: "12px",
      labels: { colors: "#475569" },
      markers: { size: 6 },
    },
    tooltip: {
      theme: "light",
      style: { fontSize: "12px" },
    },
    ...extra,
  };
}

function statusLabel(status) {
  switch (status) {
    case "APROVADO":
      return "Aprovados";
    case "REPROVADO":
      return "Reprovados";
    case "EM_BANCA":
      return "Em banca";
    case "EM_DESENVOLVIMENTO":
      return "Em desenvolvimento";
    case "ARQUIVADO":
      return "Arquivados";
    default:
      return "Sem status";
  }
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
        toast.error(errMessage(e, "Erro ao carregar relatorios."));
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
    const totalTccs = tccs.length;
    const aprovados = tccs.filter((tcc) => tcc.status === "APROVADO").length;
    const reprovados = tccs.filter((tcc) => tcc.status === "REPROVADO").length;
    const emAndamento = tccs.filter(
      (tcc) => tcc.status === "EM_DESENVOLVIMENTO" || tcc.status === "EM_BANCA",
    ).length;
    const taxa = totalTccs ? Math.round((aprovados / totalTccs) * 100) : 0;

    return {
      aprovados,
      emAndamento,
      reprovados,
      taxa,
      totalTccs,
    };
  }, [tccs]);

  const statusChart = useMemo(() => {
    const order = [
      "EM_DESENVOLVIMENTO",
      "EM_BANCA",
      "APROVADO",
      "REPROVADO",
      "ARQUIVADO",
      "SEM_STATUS",
    ];
    const counts = new Map(order.map((status) => [status, 0]));

    for (const tcc of tccs) {
      const key = tcc.status || "SEM_STATUS";
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    const items = order
      .map((status) => ({
        label: statusLabel(status),
        total: counts.get(status) || 0,
      }))
      .filter((item) => item.total > 0);

    return {
      labels: items.map((item) => item.label),
      series: items.map((item) => item.total),
    };
  }, [tccs]);

  const porArea = useMemo(() => {
    const map = new Map();
    map.set("Sem area", 0);

    for (const tcc of tccs) {
      const nome = tcc.areaNome || "Sem area";
      map.set(nome, (map.get(nome) || 0) + 1);
    }

    for (const area of areas) {
      const nome = area?.nome || area?.titulo || area?.descricao;
      if (nome && !map.has(nome)) map.set(nome, 0);
    }

    return Array.from(map.entries())
      .map(([area, qtd]) => ({ area, qtd }))
      .filter((item) => item.qtd > 0)
      .sort((a, b) => b.qtd - a.qtd)
      .slice(0, 8);
  }, [areas, tccs]);

  const bancasPorMes = useMemo(() => {
    const map = new Map();

    for (const banca of bancas) {
      const date = parseDate(banca.data);
      if (!date) continue;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const current = map.get(key) || { date, total: 0, finalizadas: 0 };
      current.total += 1;
      if (banca.notaFinal != null) current.finalizadas += 1;
      map.set(key, current);
    }

    return Array.from(map.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-6);
  }, [bancas]);

  const docRows = useMemo(() => {
    const comOrientador = tccs.filter((tcc) => !!tcc.orientadorId).length;
    const semOrientador = tccs.filter((tcc) => !tcc.orientadorId).length;

    return [
      {
        alert: semOrientador,
        doc: "TCCs com orientador associado",
        ok: comOrientador,
        total: tccs.length,
      },
      {
        alert: tccs.filter((tcc) => tcc.status === "REPROVADO").length,
        doc: "TCCs em banca / aprovados",
        ok: tccs.filter(
          (tcc) => tcc.status === "EM_BANCA" || tcc.status === "APROVADO",
        ).length,
        total: tccs.length,
      },
      {
        alert: bancas.filter((banca) => banca.notaFinal == null).length,
        doc: "Bancas cadastradas",
        ok: bancas.filter((banca) => banca.notaFinal != null).length,
        total: bancas.length,
      },
    ];
  }, [tccs, bancas]);

  const areaOptions = useMemo(
    () =>
      baseChartOptions({
        colors: [chartGreen],
        plotOptions: {
          bar: {
            borderRadius: 4,
            columnWidth: "42%",
          },
        },
        xaxis: {
          categories: porArea.map((item) => item.area),
          labels: {
            rotate: -25,
            trim: true,
          },
        },
        yaxis: {
          min: 0,
          forceNiceScale: true,
        },
      }),
    [porArea],
  );

  const statusOptions = useMemo(
    () =>
      baseChartOptions({
        colors: [chartGreen, "#65b741", chartGreenDark, chartRed, chartSlate],
        labels: statusChart.labels,
        legend: {
          position: "bottom",
          fontSize: "12px",
        },
        plotOptions: {
          pie: {
            donut: {
              labels: {
                show: true,
                total: {
                  show: true,
                  color: "#0f172a",
                  fontSize: "20px",
                  fontWeight: 700,
                  label: "TCCs",
                },
              },
            },
          },
        },
      }),
    [statusChart.labels],
  );

  const bancasOptions = useMemo(
    () =>
      baseChartOptions({
        colors: [chartGreen, chartAmber],
        stroke: {
          curve: "smooth",
          width: 3,
        },
        xaxis: {
          categories: bancasPorMes.map((item) => monthLabel(item.date)),
        },
        yaxis: {
          min: 0,
          forceNiceScale: true,
        },
      }),
    [bancasPorMes],
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl p-10 text-center text-slate-500">
        Carregando indicadores...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Relatorios e Indicadores
        </h1>
        <p className="mt-1 text-slate-500">
          Graficos calculados a partir das listagens atuais da API.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          {
            icon: <TrendingUp size={20} />,
            label: "Taxa de aprovacao",
            value: `${metrics.taxa}%`,
          },
          {
            icon: <FileSpreadsheet size={20} />,
            label: "TCCs cadastrados",
            value: metrics.totalTccs,
          },
          {
            icon: <AlertCircle size={20} />,
            label: "TCCs reprovados",
            value: metrics.reprovados,
          },
          {
            icon: <Users size={20} />,
            label: "Alunos cadastrados",
            value: alunos.length,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div>
              <p className="text-sm font-medium text-slate-500">{item.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {item.value}
              </p>
            </div>
            <div className="rounded-lg bg-[#eef8ed] p-3 text-[#2f8f2b]">
              {item.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-bold text-slate-800">
              TCCs por area
            </h2>
          </div>
          <div className="p-4">
            {porArea.length ? (
              <Chart
                height={320}
                options={areaOptions}
                series={[{ data: porArea.map((item) => item.qtd), name: "TCCs" }]}
                type="bar"
              />
            ) : (
              <p className="p-8 text-center text-sm text-slate-500">
                Sem dados por area.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-bold text-slate-800">
              Distribuicao por status
            </h2>
          </div>
          <div className="p-4">
            {statusChart.series.length ? (
              <Chart
                height={320}
                options={statusOptions}
                series={statusChart.series}
                type="donut"
              />
            ) : (
              <p className="p-8 text-center text-sm text-slate-500">
                Sem TCCs cadastrados.
              </p>
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-bold text-slate-800">
              Bancas por mes
            </h2>
          </div>
          <div className="p-4">
            {bancasPorMes.length ? (
              <Chart
                height={290}
                options={bancasOptions}
                series={[
                  {
                    data: bancasPorMes.map((item) => item.total),
                    name: "Bancas",
                  },
                  {
                    data: bancasPorMes.map((item) => item.finalizadas),
                    name: "Finalizadas",
                  },
                ]}
                type="line"
              />
            ) : (
              <p className="p-8 text-center text-sm text-slate-500">
                Sem bancas com data cadastrada.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="flex items-center text-base font-bold text-slate-800">
              <Download size={18} className="mr-2 text-[#359830]" />
              Exportar dados
            </h2>
          </div>
          <div className="space-y-3 p-5">
            {[
              "Lista de Alunos e Orientadores",
              "Status de TCCs (snapshot)",
              "Cronograma de Bancas (snapshot)",
              "Relatorio de Notas (snapshot)",
            ].map((nome) => (
              <button
                key={nome}
                type="button"
                className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-[#359830]/35 hover:bg-[#f8faf7]"
                onClick={() =>
                  toast(`Exportacao em desenvolvimento: ${nome}`, { icon: "i" })
                }
              >
                <span className="flex items-center text-sm font-semibold text-slate-700">
                  <FileText size={17} className="mr-3 text-[#359830]" />
                  {nome}
                </span>
                <ChevronRight size={18} className="text-slate-300" />
              </button>
            ))}
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-bold text-slate-800">
            Checklist operacional
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3">Indicador</th>
                <th className="px-6 py-3 text-center">Universo</th>
                <th className="px-6 py-3 text-center">OK</th>
                <th className="px-6 py-3 text-center">Atencao</th>
                <th className="px-6 py-3 text-right">Acao</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {docRows.map((row) => (
                <tr
                  key={row.doc}
                  className="text-sm transition-colors hover:bg-slate-50"
                >
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {row.doc}
                  </td>
                  <td className="px-6 py-4 text-center text-slate-600">
                    {row.total}
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-[#2f8f2b]">
                    {row.ok}
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-red-500">
                    {row.alert}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      className="text-xs font-bold uppercase text-[#2f8f2b] hover:underline"
                      onClick={() =>
                        toast("Proximo passo: gerar notificacoes no backend.", {
                          icon: "i",
                        })
                      }
                    >
                      Notificar todos
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
