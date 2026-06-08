import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  BookOpen,
  FileText,
  User,
  CheckCircle,
  Clock,
  Calendar,
  Mail,
  Loader2,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getUsuario,
  getTccsByAluno,
  getAllProfessores,
  getAllAreas,
  createTcc,
  ApiError,
} from "../../services/api";

const statusConfig = {
  EM_DESENVOLVIMENTO: { label: "Em Desenvolvimento", cor: "yellow" },
  EM_BANCA: { label: "Em Banca", cor: "blue" },
  APROVADO: { label: "Aprovado", cor: "green" },
  REPROVADO: { label: "Reprovado", cor: "red" },
  ARQUIVADO: { label: "Arquivado", cor: "gray" },
};

const corBadge = {
  yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
  blue: "bg-blue-100 text-blue-800 border-blue-200",
  green: "bg-[#359830]/10 text-[#2a7725] border-[#359830]/20",
  red: "bg-red-100 text-red-800 border-red-200",
  gray: "bg-slate-100 text-slate-700 border-slate-200",
};

function errMessage(e, fallback) {
  if (e instanceof ApiError) return e.message;
  return e?.message || fallback;
}

function parseJavaTime(value) {
  if (!value) return null;
  if (typeof value === "string") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (Array.isArray(value) && value.length >= 3) {
    const [y, m, d, hh = 0, mm = 0, ss = 0] = value;
    return new Date(y, m - 1, d, hh, mm, ss);
  }
  return null;
}

function formatDateBR(value) {
  const d = parseJavaTime(value);
  if (!d) return "Não informada";
  return d.toLocaleDateString("pt-BR");
}

function pickPrimaryTcc(tccs) {
  if (!Array.isArray(tccs) || tccs.length === 0) return null;
  const sorted = [...tccs].sort((a, b) => Number(b.id) - Number(a.id));
  const nonArquivado = sorted.find((x) => x?.status !== "ARQUIVADO");
  return nonArquivado || sorted[0];
}

function buildTimeline(tcc) {
  const status = tcc.status;

  const formatar = (data) => {
    const d = parseJavaTime(data);
    if (!d) return null;
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  const isDone = (step) => {
    const order = ["EM_DESENVOLVIMENTO", "EM_BANCA", "APROVADO"];
    const currentIdx = order.indexOf(status);
    const stepIdx = order.indexOf(step);
    return stepIdx <= currentIdx && currentIdx !== -1;
  };

  return [
    {
      titulo: "Projeto Iniciado",
      data: formatar(tcc.dataInicio) || "—",
      concluido: true,
    },
    {
      titulo: "Em Desenvolvimento",
      data: isDone("EM_DESENVOLVIMENTO") ? "Em curso" : "Pendente",
      concluido: isDone("EM_DESENVOLVIMENTO"),
    },
    {
      titulo: "Submetido para Banca",
      data: isDone("EM_BANCA") ? "Enviado" : "Aguardando",
      concluido: isDone("EM_BANCA"),
    },
    {
      titulo: "Defesa Final",
      data:
        tcc.status === "APROVADO"
          ? "Aprovado"
          : formatar(tcc.dataFim) || "A definir",
      concluido: status === "APROVADO",
    },
  ];
}

export default function MeuTccPage() {
  const usuario = useMemo(() => getUsuario(), []);

  const [tcc, setTcc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // criação
  const [professores, setProfessores] = useState([]);
  const [areas, setAreas] = useState([]);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    titulo: "",
    resumo: "",
    orientadorId: "",
    areaId: "",
    dataInicio: "",
    dataFim: "",
  });

  const loadTcc = useCallback(async () => {
    if (!usuario?.id) return null;
    const tccs = await getTccsByAluno(usuario.id);
    return pickPrimaryTcc(tccs || []);
  }, [usuario?.id]);

  const bootstrap = useCallback(async () => {
    if (!usuario?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [chosen, profs, ars] = await Promise.all([
        loadTcc(),
        getAllProfessores(),
        getAllAreas(),
      ]);

      setTcc(chosen);
      setProfessores(Array.isArray(profs) ? profs : []);
      setAreas(Array.isArray(ars) ? ars : []);
    } catch (e) {
      console.error(e);
      setError(errMessage(e, "Não foi possível carregar os dados do TCC."));
    } finally {
      setLoading(false);
    }
  }, [usuario?.id, loadTcc]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const criarTcc = async (e) => {
    e.preventDefault();

    if (!usuario?.id) {
      toast.error("Sessão inválida. Faça login novamente.");
      return;
    }

    if (!form.titulo.trim()) {
      toast.error("Informe o título do TCC.");
      return;
    }

    if (!form.orientadorId) {
      toast.error("Selecione um orientador.");
      return;
    }

    setCreating(true);
    try {
      const payload = {
        titulo: form.titulo.trim(),
        resumo: form.resumo.trim() ? form.resumo.trim() : null,
        areaId: form.areaId ? Number(form.areaId) : null,
        alunoId: usuario.id,
        orientadorId: Number(form.orientadorId),
        coorientadorId: null,
        status: "EM_DESENVOLVIMENTO",
        dataInicio: form.dataInicio ? form.dataInicio : null,
        dataFim: form.dataFim ? form.dataFim : null,
      };

      await createTcc(payload);

      toast.success("TCC criado com sucesso!");
      const novo = await loadTcc();
      setTcc(novo);

      setForm({
        titulo: "",
        resumo: "",
        orientadorId: "",
        areaId: "",
        dataInicio: "",
        dataFim: "",
      });
    } catch (err) {
      toast.error(errMessage(err, "Não foi possível criar o TCC."));
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-[#359830]">
        <Loader2 size={40} className="animate-spin" />
        <p className="text-slate-500 font-medium text-sm">
          Acessando registro acadêmico...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6 bg-red-50 border border-red-200 text-red-600 rounded-xl text-center">
        <AlertCircle className="mx-auto mb-2" />
        <p className="font-bold">{error}</p>
        <button
          type="button"
          onClick={() => bootstrap()}
          className="mt-4 text-sm underline font-medium"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  // Fluxo: sem TCC -> formulário de criação (Opção A)
  if (!tcc) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
        <header>
          <h1 className="text-2xl font-bold text-slate-800">
            Cadastrar meu TCC
          </h1>
          <p className="text-slate-500 mt-1">
            Você ainda não possui um TCC vinculado. Preencha os dados e
            selecione um orientador.
          </p>
        </header>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
          <form onSubmit={criarTcc} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Título do TCC
              </label>
              <input
                name="titulo"
                value={form.titulo}
                onChange={onChange}
                required
                className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#359830] focus:border-[#359830] sm:text-sm outline-none"
                placeholder="Ex.: Sistema web para gestão de TCCs"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Resumo (opcional)
              </label>
              <textarea
                name="resumo"
                value={form.resumo}
                onChange={onChange}
                rows={5}
                className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#359830] focus:border-[#359830] sm:text-sm outline-none"
                placeholder="Descreva brevemente o problema, objetivos e contribuição esperada..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Orientador (obrigatório)
                </label>
                <select
                  name="orientadorId"
                  value={form.orientadorId}
                  onChange={onChange}
                  required
                  className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#359830] focus:border-[#359830] sm:text-sm outline-none bg-white"
                >
                  <option value="">Selecione um professor...</option>
                  {professores.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-2">
                  Esta escolha é necessária porque o backend exige
                  `orientadorId` na criação.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Área (opcional)
                </label>
                <select
                  name="areaId"
                  value={form.areaId}
                  onChange={onChange}
                  className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#359830] focus:border-[#359830] sm:text-sm outline-none bg-white"
                >
                  <option value="">Sem área específica</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nome || a.titulo || a.descricao || `Área #${a.id}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Data de início (opcional)
                </label>
                <input
                  name="dataInicio"
                  type="date"
                  value={form.dataInicio}
                  onChange={onChange}
                  className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#359830] focus:border-[#359830] sm:text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Prazo final (opcional)
                </label>
                <input
                  name="dataFim"
                  type="date"
                  value={form.dataFim}
                  onChange={onChange}
                  className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#359830] focus:border-[#359830] sm:text-sm outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => bootstrap()}
                className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold"
                disabled={creating}
              >
                Recarregar
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-5 py-2.5 rounded-lg text-white text-sm font-semibold shadow-sm disabled:opacity-60"
                style={{ backgroundColor: "#359830" }}
              >
                {creating ? "Salvando..." : "Criar TCC"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Fluxo: com TCC -> detalhes (como antes)
  const statusInfo = statusConfig[tcc.status] || {
    label: tcc.status,
    cor: "gray",
  };
  const timeline = buildTimeline(tcc);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">
          Detalhes do meu TCC
        </h1>
        <p className="text-slate-500 mt-1">
          Dados técnicos e progresso do seu trabalho acadêmico.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                {tcc.areaNome && (
                  <span className="px-3 py-1 bg-[#359830]/10 text-[#359830] text-[11px] font-bold uppercase tracking-wider rounded-lg">
                    {tcc.areaNome}
                  </span>
                )}
                <span
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${corBadge[statusInfo.cor]}`}
                >
                  {statusInfo.label}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {tcc.titulo}
              </h2>
            </div>

            <div className="space-y-8">
              {tcc.resumo && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center mb-4">
                    <FileText size={16} className="mr-2" />
                    Resumo do Projeto
                  </h3>
                  <p className="text-slate-600 text-[15px] leading-relaxed text-justify bg-slate-50 p-5 rounded-xl border border-slate-100 italic font-serif">
                    "{tcc.resumo}"
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-center p-4 bg-white border border-slate-100 rounded-xl">
                  <Calendar size={20} className="text-slate-400 mr-3" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">
                      Data de Início
                    </p>
                    <p className="text-sm font-semibold text-slate-700">
                      {formatDateBR(tcc.dataInicio)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-white border border-slate-100 rounded-xl">
                  <Clock size={20} className="text-slate-400 mr-3" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">
                      Prazo Final
                    </p>
                    <p className="text-sm font-semibold text-slate-700">
                      {tcc.dataFim ? formatDateBR(tcc.dataFim) : "A definir"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-50 bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Orientação
              </h3>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 shadow-inner">
                  <User size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {tcc.orientadorNome || "Não atribuído"}
                  </p>
                  <p className="text-xs text-slate-500">Orientador Principal</p>
                </div>
              </div>

              {tcc.coorientadorNome && (
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                    <User size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {tcc.coorientadorNome}
                    </p>
                    <p className="text-xs text-slate-500">Coorientador</p>
                  </div>
                </div>
              )}

              {tcc.orientadorEmail && (
                <a
                  href={`mailto:${tcc.orientadorEmail}`}
                  className="w-full flex items-center justify-center px-4 py-3 bg-[#359830] text-white text-sm font-bold rounded-xl hover:brightness-90 transition-all shadow-sm shadow-green-200"
                >
                  <Mail size={16} className="mr-2" />
                  Enviar E-mail
                </a>
              )}
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-8">
              Evolução do TCC
            </h3>
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-100">
              {timeline.map((etapa, index) => (
                <div key={index} className="relative flex items-start group">
                  <div
                    className={`flex items-center justify-center w-6 h-6 rounded-full border-2 bg-white z-10 shrink-0 transition-colors ${
                      etapa.concluido
                        ? "border-[#359830] text-[#359830]"
                        : "border-slate-200 text-slate-300"
                    }`}
                  >
                    {etapa.concluido ? (
                      <CheckCircle size={14} className="fill-[#359830]/10" />
                    ) : (
                      <div className="w-2 h-2 bg-slate-200 rounded-full" />
                    )}
                  </div>
                  <div className="ml-4 -mt-0.5">
                    <p
                      className={`text-sm font-bold ${etapa.concluido ? "text-slate-800" : "text-slate-400"}`}
                    >
                      {etapa.titulo}
                    </p>
                    <p className="text-[11px] font-medium text-slate-500">
                      {etapa.data}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
