import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Info,
  Loader2,
  MessageSquare,
  User,
} from "lucide-react";
import {
  getFeedbacksByTcc,
  getTccsByAluno,
  getUsuario,
} from "../../services/api";

function getTipo(nota) {
  if (nota === null || nota === undefined) return "sugestao";
  if (nota >= 8) return "aprovacao";
  if (nota < 7) return "correcao";
  return "sugestao";
}

function getEstiloFeedback(tipo) {
  switch (tipo) {
    case "correcao":
      return {
        borda: "border-l-red-500",
        bgIcone: "bg-red-50 text-red-600",
        icone: <AlertCircle size={24} />,
        badge: "bg-red-100 text-red-700 border-red-200",
        label: "Correcoes solicitadas",
      };
    case "aprovacao":
      return {
        borda: "border-l-[#359830]",
        bgIcone: "bg-[#359830]/10 text-[#359830]",
        icone: <CheckCircle size={24} />,
        badge: "bg-[#359830]/10 text-[#359830] border-[#359830]/20",
        label: "Submissao aceita",
      };
    case "sugestao":
    default:
      return {
        borda: "border-l-blue-500",
        bgIcone: "bg-blue-50 text-blue-600",
        icone: <Info size={24} />,
        badge: "bg-blue-100 text-blue-700 border-blue-200",
        label: "Orientacao",
      };
  }
}

function pickPrimaryTcc(tccs) {
  if (!Array.isArray(tccs) || tccs.length === 0) return null;
  const sorted = [...tccs].sort((a, b) => Number(b.id) - Number(a.id));
  return sorted.find((tcc) => tcc?.status !== "ARQUIVADO") || sorted[0];
}

function formatarData(value) {
  if (!value) return "-";
  const data = new Date(value);
  if (Number.isNaN(data.getTime())) return "-";
  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function FeedbackPage() {
  const usuario = getUsuario();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!usuario?.id) {
      setLoading(false);
      return;
    }

    async function carregarFeedbacks() {
      try {
        setLoading(true);
        setError(null);

        const tcc = pickPrimaryTcc(await getTccsByAluno(usuario.id));

        if (tcc?.id) {
          const resposta = await getFeedbacksByTcc(tcc.id);
          setFeedbacks(Array.isArray(resposta) ? resposta : []);
        } else {
          setFeedbacks([]);
        }
      } catch (e) {
        console.error("Erro ao carregar feedbacks:", e);
        setError("Nao foi possivel carregar os pareceres do orientador.");
      } finally {
        setLoading(false);
      }
    }

    carregarFeedbacks();
  }, [usuario?.id]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Pareceres do Orientador
        </h1>
        <p className="text-slate-500 mt-1">
          Acompanhe os feedbacks deixados nas suas submissoes de TCC.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4 text-[#359830]">
          <Loader2 size={36} className="animate-spin" />
          <p className="text-slate-500 font-medium text-sm">
            Buscando pareceres...
          </p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 text-red-600 rounded-xl text-center">
          <AlertCircle className="mx-auto mb-2" />
          <p className="font-bold">{error}</p>
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="p-12 bg-white border border-slate-200 rounded-xl text-center shadow-sm">
          <MessageSquare size={48} className="text-slate-200 mx-auto mb-4" />
          <p className="font-bold text-slate-700 text-lg">
            Nenhum parecer recebido
          </p>
          <p className="text-slate-500 mt-1">
            Quando seu orientador avaliar uma submissao, o feedback aparecera
            aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {[...feedbacks]
            .sort(
              (a, b) =>
                new Date(b.data || 0).getTime() -
                new Date(a.data || 0).getTime(),
            )
            .map((item) => {
              const tipo = getTipo(item.nota);
              const estilo = getEstiloFeedback(tipo);

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative ${estilo.borda} border-l-4 transition-all hover:shadow-md`}
                >
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${estilo.bgIcone}`}
                      >
                        {estilo.icone}
                      </div>

                      <div className="flex-1 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${estilo.badge}`}
                              >
                                {estilo.label}
                              </span>
                              {item.nota != null && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-white border border-slate-800">
                                  Nota: {Number(item.nota).toFixed(1)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center text-sm text-slate-800">
                              <User
                                size={14}
                                className="mr-1.5 text-slate-400"
                              />
                              <span className="font-bold">
                                {item.professorNome || "Orientador"}
                              </span>
                            </div>
                          </div>

                          <span className="flex items-center text-xs text-slate-400 font-medium whitespace-nowrap bg-slate-50 px-2 py-1 rounded">
                            <Calendar size={14} className="mr-1.5" />
                            {formatarData(item.data)}
                          </span>
                        </div>

                        <div className="bg-slate-50/80 rounded-lg p-5 border border-slate-100 text-slate-700 text-[14.5px] leading-relaxed">
                          {item.comentario}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
