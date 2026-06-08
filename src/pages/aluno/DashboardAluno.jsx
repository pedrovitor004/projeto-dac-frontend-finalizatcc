import React, { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  Clock,
  Calendar,
  MessageSquare,
  ChevronRight,
  UploadCloud,
  AlertCircle,
  FileText,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import CardStats from "../../components/shared/CardStats";
import {
  getUsuario,
  getTccsByAluno,
  getFeedbacksByTcc,
} from "../../services/api";

const statusConfig = {
  EM_DESENVOLVIMENTO: { label: "Em Desenvolvimento", cor: "yellow" },
  EM_BANCA: { label: "Em Banca", cor: "blue" },
  APROVADO: { label: "Aprovado", cor: "green" },
  REPROVADO: { label: "Reprovado", cor: "red" },
  ARQUIVADO: { label: "Arquivado", cor: "gray" },
};

function parseJavaTime(value) {
  if (!value) return null;

  if (typeof value === "string") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  if (Array.isArray(value)) {
    if (value.length >= 3) {
      const [y, m, d, hh = 0, mm = 0, ss = 0] = value;
      return new Date(y, m - 1, d, hh, mm, ss);
    }
  }

  return null;
}

function formatDateBR(value) {
  const d = parseJavaTime(value);
  if (!d) return "—";
  return d.toLocaleDateString("pt-BR");
}

function pickPrimaryTcc(tccs) {
  if (!Array.isArray(tccs) || tccs.length === 0) return null;
  const sorted = [...tccs].sort((a, b) => Number(b.id) - Number(a.id));
  const nonArquivado = sorted.find((t) => t?.status !== "ARQUIVADO");
  return nonArquivado || sorted[0];
}

export default function DashboardAluno() {
  const [tcc, setTcc] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const usuario = useMemo(() => getUsuario(), []);

  useEffect(() => {
    if (!usuario?.id) {
      setLoading(false);
      return;
    }

    async function carregarDadosDashboard() {
      try {
        setLoading(true);
        const tccs = await getTccsByAluno(usuario.id);
        const chosen = pickPrimaryTcc(tccs || []);

        if (chosen) {
          setTcc(chosen);
          const fb = await getFeedbacksByTcc(chosen.id);
          setFeedbacks(Array.isArray(fb) ? fb : []);
        } else {
          setTcc(null);
          setFeedbacks([]);
        }
      } catch (e) {
        console.error("Erro ao carregar dashboard do aluno:", e);
      } finally {
        setLoading(false);
      }
    }

    carregarDadosDashboard();
  }, [usuario?.id]);

  const statusInfo = tcc
    ? statusConfig[tcc.status] || { label: tcc.status, cor: "gray" }
    : null;

  const corBadge = {
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    green: "bg-green-100 text-green-800 border-green-200",
    red: "bg-red-100 text-red-800 border-red-200",
    gray: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const corBarra = {
    yellow: "bg-yellow-400",
    blue: "bg-blue-400",
    green: "bg-green-500",
    red: "bg-red-500",
    gray: "bg-slate-400",
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-[#359830]">
        <Loader2 size={40} className="animate-spin" />
        <p className="text-slate-500 font-medium text-sm">
          Organizando seu progresso...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">
          Olá, {usuario?.nome?.split(" ")[0] || "Aluno"}! 👋
        </h1>
        <p className="text-slate-500 mt-1">
          Acompanhe aqui o status e as orientações do seu projeto de graduação.
        </p>
      </header>

      {tcc ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative transition-all hover:shadow-md">
          <div
            className={`absolute left-0 top-0 bottom-0 w-1.5 ${corBarra[statusInfo?.cor] || "bg-slate-400"}`}
          />
          <div className="p-6 sm:p-8 ml-2 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border mb-3 ${corBadge[statusInfo?.cor]}`}
              >
                <Clock size={14} className="mr-1.5" />
                {statusInfo?.label}
              </span>
              <h2 className="text-xl font-bold text-slate-800 mb-2 leading-tight">
                {tcc.titulo}
              </h2>
              <div className="flex flex-wrap gap-4">
                {tcc.orientadorNome && (
                  <div className="flex items-center text-sm text-slate-600">
                    <BookOpen size={16} className="mr-1.5 text-slate-400" />
                    Orientador:{" "}
                    <span className="ml-1 font-medium text-slate-700">
                      {tcc.orientadorNome}
                    </span>
                  </div>
                )}
                <div className="flex items-center text-sm text-slate-600">
                  <Calendar size={16} className="mr-1.5 text-slate-400" />
                  Início: {formatDateBR(tcc.dataInicio)}
                </div>
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => navigate("/aluno/meu-tcc")}
                className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center shadow-sm"
              >
                <FileText size={18} className="mr-2 text-slate-500" />
                Ver Detalhes
              </button>
              <button
                type="button"
                onClick={() => navigate("/aluno/submissoes")}
                className="px-5 py-2.5 text-white font-medium rounded-lg shadow-sm transition-all flex items-center justify-center hover:brightness-90 active:scale-95"
                style={{ backgroundColor: "#359830" }}
              >
                <UploadCloud size={18} className="mr-2" />
                Nova Versão
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-slate-300" />
          </div>
          <p className="text-slate-600 font-bold text-lg">
            Nenhum TCC vinculado
          </p>
          <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
            Seu projeto ainda não foi registrado no sistema. Aguarde a
            confirmação do seu orientador.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardStats
          titulo="Prazo de Entrega"
          valor={
            tcc?.dataFim
              ? parseJavaTime(tcc.dataFim)?.toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                }) || "—"
              : "—"
          }
          descricao={
            tcc?.dataFim
              ? `Até ${formatDateBR(tcc.dataFim)}`
              : "Prazo não definido"
          }
          icone={<Calendar size={24} className="text-blue-500" />}
        />
        <CardStats
          titulo="Feedbacks"
          valor={String(feedbacks.length)}
          descricao={
            feedbacks.length > 0
              ? "Recebidos do orientador"
              : "Nenhum comentário ainda"
          }
          icone={<MessageSquare size={24} className="text-purple-500" />}
        />
        <CardStats
          titulo="Status Atual"
          valor={statusInfo?.label || "Pendente"}
          descricao="Situação do projeto"
          icone={<Clock size={24} className="text-orange-500" />}
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800 flex items-center">
            <MessageSquare
              size={20}
              className="mr-2"
              style={{ color: "#359830" }}
            />
            Últimas Orientações
          </h3>
          <button
            type="button"
            onClick={() => navigate("/aluno/feedbacks")}
            className="text-sm font-semibold hover:brightness-75 transition-colors flex items-center"
            style={{ color: "#359830" }}
          >
            Ver histórico completo <ChevronRight size={16} className="ml-1" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {feedbacks.length === 0 ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center">
              <MessageSquare size={40} className="text-slate-200 mb-3" />
              <p className="font-medium italic">
                Aguardando as primeiras observações do seu orientador.
              </p>
            </div>
          ) : (
            [...feedbacks]
              .sort(
                (a, b) =>
                  (parseJavaTime(b.data)?.getTime() || 0) -
                  (parseJavaTime(a.data)?.getTime() || 0),
              )
              .slice(0, 3)
              .map((fb) => (
                <div
                  key={fb.id}
                  className="p-6 hover:bg-slate-50/80 transition-colors group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-[#359830] font-bold">
                        {fb.professorNome?.charAt(0) || "P"}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 leading-tight">
                          {fb.professorNome || "Professor/Orientador"}
                        </p>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                          {formatDateBR(fb.data)}
                        </p>
                      </div>
                    </div>
                    {fb.nota != null && (
                      <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded border border-green-100">
                        Nota: {fb.nota.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100 group-hover:border-[#359830]/20 group-hover:bg-white transition-all">
                    "{fb.comentario}"
                  </p>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
