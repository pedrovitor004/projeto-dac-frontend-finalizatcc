import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  FileText,
  History,
  Loader2,
  MessageSquare,
  User,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import UploadArquivos from "../../components/UploadArquivos";
import {
  downloadArquivo,
  getFeedbacksByTcc,
  getArquivosBySubmissao,
  getSubmissoesByTcc,
  getTccsByAluno,
  getUsuario,
} from "../../services/api";

const statusConfig = {
  ACEITO: {
    label: "Aceito",
    cor: "bg-green-50 text-green-700 border-green-200",
    icone: <CheckCircle size={14} className="mr-1.5" />,
  },
  NECESSITA_CORRECAO: {
    label: "Necessita Correcao",
    cor: "bg-red-50 text-red-700 border-red-200",
    icone: <XCircle size={14} className="mr-1.5" />,
  },
  EM_ANALISE: {
    label: "Em Analise",
    cor: "bg-amber-50 text-amber-700 border-amber-200",
    icone: <Clock size={14} className="mr-1.5" />,
  },
  ENVIADO: {
    label: "Enviado",
    cor: "bg-blue-50 text-blue-700 border-blue-200",
    icone: <Clock size={14} className="mr-1.5" />,
  },
};

function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.ENVIADO;
  return (
    <span
      className={`flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${config.cor}`}
    >
      {config.icone} {config.label}
    </span>
  );
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

function pickArquivoPrincipal(arquivos) {
  if (!Array.isArray(arquivos) || arquivos.length === 0) return null;
  return [...arquivos].sort((a, b) => {
    const aReal = a.hashArquivo ? 1 : 0;
    const bReal = b.hashArquivo ? 1 : 0;
    if (aReal !== bReal) return bReal - aReal;
    return (
      new Date(b.dataUpload || 0).getTime() -
      new Date(a.dataUpload || 0).getTime()
    );
  })[0];
}

export default function SubmissoesPage() {
  const usuario = getUsuario();
  const [tcc, setTcc] = useState(null);
  const [submissoes, setSubmissoes] = useState([]);
  const [feedbacksBySubmissao, setFeedbacksBySubmissao] = useState({});
  const [arquivosBySubmissao, setArquivosBySubmissao] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregarDados = useCallback(async () => {
    if (!usuario?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const tccs = await getTccsByAluno(usuario.id);
      const escolhido = pickPrimaryTcc(tccs);
      setTcc(escolhido);

      if (escolhido?.id) {
        const [subs, feedbacks] = await Promise.all([
          getSubmissoesByTcc(escolhido.id),
          getFeedbacksByTcc(escolhido.id),
        ]);
        const submissoesArray = Array.isArray(subs) ? subs : [];
        setSubmissoes(submissoesArray);
        const arquivosEntries = await Promise.all(
          submissoesArray.map((submissao) =>
            getArquivosBySubmissao(submissao.id)
              .then((arquivos) => [
                String(submissao.id),
                Array.isArray(arquivos) ? arquivos : [],
              ])
              .catch(() => [String(submissao.id), []]),
          ),
        );
        setArquivosBySubmissao(Object.fromEntries(arquivosEntries));
        setFeedbacksBySubmissao(
          (Array.isArray(feedbacks) ? feedbacks : []).reduce(
            (acc, feedback) => {
              const key = String(feedback.submissaoId);
              acc[key] = [...(acc[key] || []), feedback].sort(
                (a, b) =>
                  new Date(a.data || 0).getTime() -
                  new Date(b.data || 0).getTime(),
              );
              return acc;
            },
            {},
          ),
        );
      } else {
        setSubmissoes([]);
        setFeedbacksBySubmissao({});
        setArquivosBySubmissao({});
      }
    } catch (e) {
      setError("Erro ao carregar historico de submissoes.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [usuario?.id]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const orderedSubmissoes = [...submissoes].sort(
    (a, b) =>
      new Date(a.dataEnvio || 0).getTime() -
        new Date(b.dataEnvio || 0).getTime() ||
      Number(a.versao || 0) - Number(b.versao || 0),
  );

  const baixarArquivo = async (arquivo) => {
    if (!arquivo?.id) {
      toast.error("Nenhum arquivo encontrado para esta submissao.");
      return;
    }

    try {
      const { blob, filename } = await downloadArquivo(arquivo.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename || arquivo.nomeArquivo || "submissao.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Download iniciado.");
    } catch (e) {
      toast.error(
        e?.message ||
          "Nao foi possivel baixar. O arquivo pode nao ter sido salvo no backend.",
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Submissoes de Documentos
          </h1>
          <p className="text-slate-500 mt-1">
            Gestao de versoes e historico de arquivos enviados para avaliacao.
          </p>
        </div>
      </header>

      <section className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <UploadArquivos
          tcc={tcc}
          nextVersion={submissoes.length + 1}
          disabled={loading}
          onUploaded={carregarDados}
        />
      </section>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center">
            <History size={18} className="mr-2 text-slate-400" />
            Linha do Tempo de Envios
          </h3>
          {!loading && (
            <span className="text-[11px] font-bold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
              {submissoes.length}{" "}
              {submissoes.length === 1 ? "ARQUIVO" : "ARQUIVOS"}
            </span>
          )}
        </div>

        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center text-[#359830] space-y-4">
            <Loader2 size={40} className="animate-spin" />
            <p className="text-sm text-slate-400 font-medium">
              Sincronizando arquivos...
            </p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <AlertCircle size={40} className="text-red-300 mx-auto mb-3" />
            <p className="text-red-600 font-medium">{error}</p>
            <button
              type="button"
              onClick={carregarDados}
              className="mt-4 text-sm font-semibold text-red-700 underline"
            >
              Tentar novamente
            </button>
          </div>
        ) : orderedSubmissoes.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <FileText size={32} className="text-slate-200" />
            </div>
            <p className="text-slate-700 font-bold text-lg">
              Nenhum envio detectado
            </p>
            <p className="text-slate-400 text-sm max-w-xs mx-auto mt-1">
              Utilize o campo acima para enviar a primeira versao do seu
              trabalho.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {orderedSubmissoes.map((submissao, index) => {
              const arquivos =
                arquivosBySubmissao[String(submissao.id)] || [];
              const arquivoPrincipal = pickArquivoPrincipal(arquivos);
              return (
              <div
                key={submissao.id || `${submissao.versao}-${index}`}
                className="p-6 hover:bg-slate-50/80 transition-all"
              >
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`mt-1 p-3 rounded-xl ${
                        submissao.status === "ACEITO"
                          ? "bg-green-50 text-green-600"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <FileText size={24} />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="text-base font-bold text-slate-800">
                          Versao {submissao.versao || index + 1}
                        </h4>
                        <StatusBadge status={submissao.status} />
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-slate-400">
                        <span className="flex items-center">
                          <Clock size={14} className="mr-1.5" />
                          Enviado em {formatarData(submissao.dataEnvio)}
                        </span>
                        {(arquivoPrincipal?.nomeArquivo ||
                          submissao.arquivoNome ||
                          submissao.nomeArquivo) && (
                          <span className="text-slate-500">
                            {arquivoPrincipal?.nomeArquivo ||
                              submissao.arquivoNome ||
                              submissao.nomeArquivo}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => baixarArquivo(arquivoPrincipal)}
                      disabled={!arquivoPrincipal?.id}
                      className={`flex items-center px-4 py-2 text-xs font-bold bg-white border border-slate-200 rounded-lg transition-all shadow-sm ${
                        arquivoPrincipal?.id
                          ? "text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                          : "cursor-not-allowed text-slate-300 opacity-60"
                      }`}
                    >
                      <Download size={14} className="mr-2" />
                      Baixar Arquivo
                    </button>
                  </div>
                </div>

                <div className="ml-0 mt-5 border-l-2 border-slate-100 pl-5 md:ml-6">
                  {(feedbacksBySubmissao[String(submissao.id)] || []).length >
                  0 ? (
                    <div className="space-y-3">
                      {(feedbacksBySubmissao[String(submissao.id)] || []).map(
                        (feedback) => (
                          <div
                            key={feedback.id}
                            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                          >
                            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                              <span className="inline-flex items-center rounded-full bg-[#359830]/10 px-3 py-1 text-xs font-bold text-[#2a7725]">
                                <MessageSquare size={14} className="mr-1.5" />
                                Feedback do orientador
                              </span>
                              <span className="text-xs font-medium text-slate-400">
                                {formatarData(feedback.data)}
                              </span>
                            </div>
                            <div className="mb-3 flex items-center text-sm font-semibold text-slate-700">
                              <User size={15} className="mr-1.5 text-slate-400" />
                              {feedback.professorNome ||
                                tcc?.orientadorNome ||
                                "Orientador"}
                            </div>
                            <p className="text-sm leading-6 text-slate-700">
                              {feedback.comentario || "Sem comentario."}
                            </p>
                            {feedback.nota != null && (
                              <div className="mt-3 inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                                Nota: {Number(feedback.nota).toFixed(1)}
                              </div>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-400">
                      Ainda nao ha feedback do orientador para esta submissao.
                    </div>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
