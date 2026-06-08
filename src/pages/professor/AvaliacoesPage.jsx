import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  MessageSquare,
  User,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  createFeedback,
  getSubmissoesByTcc,
  getTccsByProfessor,
  getUsuario,
  updateSubmissao,
} from "../../services/api.js";

const STATUS_PENDENTE = ["ENVIADO", "EM_ANALISE"];
const STATUS_CONCLUIDO = ["ACEITO", "NECESSITA_CORRECAO"];

const statusLabel = (status) => {
  const map = {
    ENVIADO: "Aguardando parecer",
    EM_ANALISE: "Em analise",
    ACEITO: "Submissao aceita",
    NECESSITA_CORRECAO: "Correcoes solicitadas",
  };
  return map[status] || status;
};

export default function AvaliacoesPage() {
  const usuario = getUsuario();

  const [abaAtiva, setAbaAtiva] = useState("pendentes");
  const [submissoes, setSubmissoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [submissaoSelecionada, setSubmissaoSelecionada] = useState(null);
  const [parecer, setParecer] = useState("");
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);

  const carregarSubmissoes = useCallback(() => {
    if (!usuario?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setErro(null);

    getTccsByProfessor(usuario.id)
      .then(async (tccs) => {
        const todas = await Promise.all(
          (Array.isArray(tccs) ? tccs : []).map((tcc) =>
            getSubmissoesByTcc(tcc.id)
              .then((subs) =>
                (Array.isArray(subs) ? subs : []).map((submissao) => ({
                  ...submissao,
                  alunoNome: tcc.alunoNome || "Aluno",
                  tccTitulo: tcc.titulo,
                  tccId: tcc.id,
                  tcc,
                })),
              )
              .catch(() => []),
          ),
        );

        setSubmissoes(
          todas
            .flat()
            .sort(
              (a, b) =>
                new Date(b.dataEnvio || 0).getTime() -
                new Date(a.dataEnvio || 0).getTime(),
            ),
        );
      })
      .catch(() => setErro("Erro ao carregar submissoes."))
      .finally(() => setLoading(false));
  }, [usuario?.id]);

  useEffect(() => {
    carregarSubmissoes();
  }, [carregarSubmissoes]);

  const submissoesFiltradas = submissoes.filter((submissao) =>
    abaAtiva === "pendentes"
      ? STATUS_PENDENTE.includes(submissao.status)
      : STATUS_CONCLUIDO.includes(submissao.status),
  );

  const pendentesCount = submissoes.filter((submissao) =>
    STATUS_PENDENTE.includes(submissao.status),
  ).length;

  const abrirModal = (submissao) => {
    setSubmissaoSelecionada(submissao);
    setParecer("");
    setComentario("");
  };

  const fecharModal = () => {
    setSubmissaoSelecionada(null);
  };

  const enviarParecer = async (e) => {
    e.preventDefault();
    if (!parecer || !submissaoSelecionada) return;

    setEnviando(true);

    const novoStatus =
      parecer === "aceito" ? "ACEITO" : "NECESSITA_CORRECAO";

    try {
      await createFeedback({
        comentario,
        data: new Date().toISOString(),
        submissaoId: submissaoSelecionada.id,
        professorId: usuario.id,
      });

      await updateSubmissao(submissaoSelecionada.id, {
        versao: submissaoSelecionada.versao,
        dataEnvio: submissaoSelecionada.dataEnvio,
        status: novoStatus,
        prazoEntrega: submissaoSelecionada.prazoEntrega || null,
        tccId: submissaoSelecionada.tccId,
      });

      toast.success("Parecer enviado com sucesso!");
      fecharModal();
      carregarSubmissoes();
    } catch (error) {
      toast.error(error?.message || "Erro ao enviar parecer.");
    } finally {
      setEnviando(false);
    }
  };

  const formatarData = (value) => {
    if (!value) return "-";
    const data = new Date(value);
    if (Number.isNaN(data.getTime())) return "-";
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Pareceres de Submissoes
        </h1>
        <p className="text-slate-500 mt-1">
          Analise os documentos enviados pelos seus orientandos e forneca
          feedbacks. Esta area e separada das bancas de defesa.
        </p>
      </div>

      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setAbaAtiva("pendentes")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
              abaAtiva === "pendentes"
                ? "border-[#359830] text-[#359830]"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <Clock size={18} className="mr-2" />
            Pendentes
            {pendentesCount > 0 && (
              <span className="ml-2 py-0.5 px-2.5 rounded-full text-xs bg-[#359830]/10 text-[#2a7725]">
                {pendentesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setAbaAtiva("concluidas")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
              abaAtiva === "concluidas"
                ? "border-green-600 text-green-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <CheckCircle size={18} className="mr-2" />
            Concluidas
          </button>
        </nav>
      </div>

      {loading && (
        <div className="text-center text-slate-400 py-8">
          Carregando submissoes...
        </div>
      )}

      {erro && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700 text-sm">
          {erro}
        </div>
      )}

      <div className="space-y-4">
        {!loading && !erro && submissoesFiltradas.length > 0 ? (
          submissoesFiltradas.map((submissao) => (
            <div
              key={submissao.id}
              className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4 flex-1">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    STATUS_PENDENTE.includes(submissao.status)
                      ? "bg-yellow-50 text-yellow-600"
                      : "bg-green-50 text-green-600"
                  }`}
                >
                  <FileText size={24} />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Versao {submissao.versao}
                  </h3>
                  <p className="text-xs text-slate-500 mb-1 line-clamp-1">
                    {submissao.tccTitulo}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-slate-600">
                    <span className="flex items-center font-medium text-slate-700">
                      <User size={14} className="mr-1.5 text-slate-400" />
                      {submissao.alunoNome}
                    </span>
                    <span className="text-slate-300">-</span>
                    <span>Enviado em: {formatarData(submissao.dataEnvio)}</span>
                  </div>

                  <div className="mt-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                        submissao.status === "NECESSITA_CORRECAO"
                          ? "bg-red-100 text-red-700"
                          : submissao.status === "ACEITO"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {statusLabel(submissao.status)}
                    </span>
                  </div>
                </div>
              </div>

              {STATUS_PENDENTE.includes(submissao.status) && (
                <button
                  onClick={() => abrirModal(submissao)}
                  className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-[#359830] hover:bg-[#2a7725] text-white font-medium rounded-lg transition-colors text-sm shadow-sm"
                >
                  <MessageSquare size={16} className="mr-2" />
                  Emitir parecer
                </button>
              )}
            </div>
          ))
        ) : (
          !loading &&
          !erro && (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={32} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                {abaAtiva === "pendentes"
                  ? "Nenhuma submissao pendente"
                  : "Nenhum parecer concluido"}
              </h3>
              <p className="text-slate-500 mt-1">
                {abaAtiva === "pendentes"
                  ? "Voce esta com todos os pareceres em dia."
                  : "Ainda nao ha pareceres concluidos."}
              </p>
            </div>
          )
        )}
      </div>

      {submissaoSelecionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
              <h2 className="text-lg font-bold text-slate-800">
                Emitir Parecer da Submissao
              </h2>
              <button
                type="button"
                onClick={fecharModal}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1 rounded-md transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="bg-[#359830]/10 border border-[#359830]/10 rounded-lg p-4 mb-6">
                <p className="text-sm text-[#1f5a1b]">
                  <span className="font-bold">Aluno:</span>{" "}
                  {submissaoSelecionada.alunoNome} <br />
                  <span className="font-bold">TCC:</span>{" "}
                  {submissaoSelecionada.tccTitulo} <br />
                  <span className="font-bold">Versao:</span>{" "}
                  {submissaoSelecionada.versao}
                </p>
              </div>

              <form id="formParecer" onSubmit={enviarParecer} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Resultado do parecer
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="flex items-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-green-50 hover:border-green-300 transition-colors has-[:checked]:bg-green-50 has-[:checked]:border-green-500">
                      <input
                        type="radio"
                        name="parecer"
                        value="aceito"
                        onChange={(e) => setParecer(e.target.value)}
                        className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300"
                        required
                      />
                      <span className="ml-3 font-medium text-slate-800">
                        Aceitar submissao
                      </span>
                    </label>
                    <label className="flex items-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-red-50 hover:border-red-300 transition-colors has-[:checked]:bg-red-50 has-[:checked]:border-red-500">
                      <input
                        type="radio"
                        name="parecer"
                        value="correcoes"
                        onChange={(e) => setParecer(e.target.value)}
                        className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300"
                        required
                      />
                      <span className="ml-3 font-medium text-slate-800">
                        Solicitar correcoes
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Comentarios e feedback
                  </label>
                  <textarea
                    rows={4}
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    placeholder="Escreva aqui suas observacoes sobre a submissao..."
                    className="block w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#359830] focus:border-[#359830] sm:text-sm outline-none transition-colors"
                    required
                  />
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={fecharModal}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="formParecer"
                disabled={enviando}
                className="px-4 py-2 bg-[#359830] text-white font-medium rounded-lg hover:bg-[#2a7725] transition-colors text-sm shadow-sm disabled:opacity-50"
              >
                {enviando ? "Enviando..." : "Enviar Parecer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
