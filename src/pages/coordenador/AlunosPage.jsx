import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  UserPlus,
  MoreVertical,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  UserX,
  Mail,
  Users,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getAllAlunos,
  getAllTccs,
  getAllProfessores,
  updateTcc,
  ApiError,
} from "../../services/api";

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

function uiStatusFromTcc(tcc) {
  if (!tcc) return { label: "Sem TCC", kind: "pendente" };

  if (tcc.status === "APROVADO") return { label: "ConcluÃ­do", kind: "ok" };
  if (tcc.status === "REPROVADO") return { label: "Reprovado", kind: "bad" };
  if (tcc.status === "ARQUIVADO")
    return { label: "Arquivado", kind: "neutral" };

  if (!tcc.orientadorId)
    return { label: "Pendente (sem orientador)", kind: "pendente" };

  return { label: "Em andamento", kind: "ok" };
}

function Modal({ open, title, onClose, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <div className="font-bold text-slate-800">{title}</div>
            <button
              type="button"
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
              onClick={onClose}
              title="Fechar"
            >
              <X size={18} />
            </button>
          </div>
          <div className="p-5">{children}</div>
          {footer ? (
            <div className="px-5 py-4 border-t border-slate-200 bg-slate-50">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function AlunosPage() {
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [filtroOrientador, setFiltroOrientador] = useState("Todos");

  const [alunos, setAlunos] = useState([]);
  const [tccs, setTccs] = useState([]);
  const [professores, setProfessores] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);
  const [modalAluno, setModalAluno] = useState(null);
  const [modalTcc, setModalTcc] = useState(null);
  const [orientadorId, setOrientadorId] = useState("");
  const [coorientadorId, setCoorientadorId] = useState("");

  async function refresh() {
    const [a, t, p] = await Promise.all([
      getAllAlunos(),
      getAllTccs(),
      getAllProfessores(),
    ]);
    setAlunos(Array.isArray(a) ? a : []);
    setTccs(Array.isArray(t) ? t : []);
    setProfessores(Array.isArray(p) ? p : []);
  }

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        const [a, t, p] = await Promise.all([
          getAllAlunos(),
          getAllTccs(),
          getAllProfessores(),
        ]);
        if (!alive) return;
        setAlunos(Array.isArray(a) ? a : []);
        setTccs(Array.isArray(t) ? t : []);
        setProfessores(Array.isArray(p) ? p : []);
      } catch (e) {
        toast.error(errMessage(e, "Erro ao carregar alunos."));
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const tccByAlunoId = useMemo(() => {
    const map = new Map();
    for (const t of tccs) {
      if (!t?.alunoId) continue;
      const prev = map.get(t.alunoId);
      if (!prev) {
        map.set(t.alunoId, t);
        continue;
      }
      const prevRank = prev.status === "ARQUIVADO" ? 0 : 1;
      const curRank = t.status === "ARQUIVADO" ? 0 : 1;
      if (curRank > prevRank) map.set(t.alunoId, t);
      else if (curRank === prevRank && Number(t.id) > Number(prev.id))
        map.set(t.alunoId, t);
    }
    return map;
  }, [tccs]);

  const profOptions = useMemo(() => {
    return professores
      .map((p) => ({
        id: p.id,
        nome:
          p?.nome ||
          p?.usuario?.nome ||
          p?.usuarioNome ||
          p?.email ||
          "Professor",
        email: p?.email || p?.usuario?.email || p?.usuarioEmail || "",
      }))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [professores]);

  const rows = useMemo(() => {
    return alunos.map((aluno) => {
      const tcc = tccByAlunoId.get(aluno.id);
      const orientador = tcc?.orientadorNome || null;
      const tema = tcc?.titulo || "Ainda nÃ£o definido";
      const fase = tcc ? statusLabel(tcc.status) : "Inicial";
      const ui = uiStatusFromTcc(tcc);

      return {
        id: aluno.id,
        nome: aluno.nome,
        matricula: aluno.matricula,
        email: aluno.email,
        orientador,
        tema,
        fase,
        uiStatus: ui,
        tcc: tcc || null,
      };
    });
  }, [alunos, tccByAlunoId]);

  const alunosFiltrados = rows.filter((aluno) => {
    const passaBusca =
      aluno.nome.toLowerCase().includes(busca.toLowerCase()) ||
      String(aluno.matricula || "").includes(busca);

    const passaStatus =
      filtroStatus === "Todos" ||
      (filtroStatus === "Em Dia" &&
        aluno.uiStatus.kind === "ok" &&
        aluno.uiStatus.label === "Em andamento") ||
      (filtroStatus === "Atrasado" && aluno.uiStatus.kind === "bad") ||
      (filtroStatus === "Pendente" && aluno.uiStatus.kind === "pendente") ||
      (filtroStatus === "ConcluÃ­do" && aluno.uiStatus.label === "ConcluÃ­do");

    let passaOrientador = true;
    if (filtroOrientador === "Sem Orientador")
      passaOrientador = aluno.orientador === null;
    else if (filtroOrientador === "Com Orientador")
      passaOrientador = aluno.orientador !== null;

    return passaBusca && passaStatus && passaOrientador;
  });

  const renderStatus = (ui) => {
    if (ui.label === "ConcluÃ­do") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#359830]/10 text-[#1f5a1b]">
          <CheckCircle size={12} className="mr-1" /> ConcluÃ­do
        </span>
      );
    }
    if (ui.kind === "bad") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertCircle size={12} className="mr-1" /> {ui.label}
        </span>
      );
    }
    if (ui.kind === "pendente") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock size={12} className="mr-1" /> Pendente
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle size={12} className="mr-1" /> Em andamento
      </span>
    );
  };

  function openOrientadorModal(alunoRow) {
    const tcc = alunoRow.tcc;
    if (!tcc?.id) {
      toast(
        "Esse aluno ainda nÃ£o tem TCC para vincular orientador. (Hoje o vÃ­nculo Ã© no TCC.)",
        { icon: "â„¹ï¸" },
      );
      return;
    }
    setModalAluno(alunoRow);
    setModalTcc(tcc);
    setOrientadorId(tcc.orientadorId ? String(tcc.orientadorId) : "");
    setCoorientadorId(tcc.coorientadorId ? String(tcc.coorientadorId) : "");
    setModalOpen(true);
  }

  async function saveOrientador() {
    if (!modalTcc?.id) return;

    if (!orientadorId) {
      toast.error("Selecione um orientador.");
      return;
    }

    if (coorientadorId && coorientadorId === orientadorId) {
      toast.error("Coorientador nÃ£o pode ser igual ao orientador.");
      return;
    }

    try {
      setModalSaving(true);
      await updateTcc(modalTcc.id, {
        titulo: modalTcc.titulo,
        resumo: modalTcc.resumo || null,
        areaId: modalTcc.areaId || null,
        alunoId: modalTcc.alunoId,
        orientadorId: Number(orientadorId),
        coorientadorId: coorientadorId ? Number(coorientadorId) : null,
        status: modalTcc.status || "EM_DESENVOLVIMENTO",
        dataInicio: modalTcc.dataInicio || null,
        dataFim: modalTcc.dataFim || null,
      });
      toast.success("Orientador atualizado.");
      setModalOpen(false);
      await refresh();
    } catch (e) {
      toast.error(errMessage(e, "Erro ao atualizar orientador."));
    } finally {
      setModalSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-10 text-center text-slate-500">
        Carregando alunos...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            GestÃ£o de Alunos
          </h1>
          <p className="text-slate-500 mt-1">
            Dados reais de alunos + TCC (quando existir).
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            type="button"
            className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors text-sm shadow-sm"
            onClick={() =>
              toast("ExportaÃ§Ã£o CSV pode ser implementada depois.", {
                icon: "â„¹ï¸",
              })
            }
          >
            <FileText size={18} className="mr-2" /> Exportar CSV
          </button>
          <button
            type="button"
            className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-[#359830] text-white font-medium rounded-lg hover:bg-[#2a7725] transition-colors text-sm shadow-sm"
            onClick={() =>
              toast(
                "Fluxo de criaÃ§Ã£o administrativa: use o cadastro pÃºblico ou crie endpoint dedicado.",
                { icon: "â„¹ï¸" },
              )
            }
          >
            <UserPlus size={18} className="mr-2" /> Novo Aluno
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nome ou matrÃ­cula..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#359830] focus:border-[#359830] sm:text-sm text-slate-900 outline-none transition-colors"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="flex items-center w-full sm:w-auto">
            <Filter size={18} className="mr-2 text-slate-400" />
            <select
              value={filtroOrientador}
              onChange={(e) => setFiltroOrientador(e.target.value)}
              className="block w-full sm:w-48 pl-3 pr-8 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#359830] focus:border-[#359830] sm:text-sm text-slate-900 outline-none transition-colors bg-white"
            >
              <option value="Todos">Todos os Orientadores</option>
              <option value="Com Orientador">Com Orientador</option>
              <option value="Sem Orientador">Sem Orientador (Pendentes)</option>
            </select>
          </div>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="block w-full sm:w-40 pl-3 pr-8 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#359830] focus:border-[#359830] sm:text-sm text-slate-900 outline-none transition-colors bg-white"
          >
            <option value="Todos">Todos os Status</option>
            <option value="Em Dia">Em andamento</option>
            <option value="Atrasado">Reprovado</option>
            <option value="Pendente">Pendente</option>
            <option value="ConcluÃ­do">ConcluÃ­do</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Aluno
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Orientador
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                  Fase Atual
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                  AÃ§Ãµes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {alunosFiltrados.length > 0 ? (
                alunosFiltrados.map((aluno) => (
                  <tr
                    key={aluno.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 shrink-0 rounded-full bg-[#359830]/10 flex items-center justify-center text-[#2a7725] font-bold uppercase">
                          {aluno.nome?.charAt(0)}
                          {aluno.nome?.split(" ")?.[1]?.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-800">
                            {aluno.nome}
                          </div>
                          <div className="text-xs text-slate-500">
                            Mat: {aluno.matricula}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {aluno.orientador ? (
                        <div className="text-sm text-slate-800 font-medium">
                          {aluno.orientador}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                          <UserX size={14} className="mr-1" /> Sem orientador
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm text-slate-600">{aluno.fase}</div>
                      <div
                        className="text-xs text-slate-400 truncate max-w-[260px]"
                        title={aluno.tema}
                      >
                        {aluno.tema}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {aluno.tcc?.id ? "TCC cadastrado" : "Sem TCC"}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStatus(aluno.uiStatus)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          type="button"
                          title="Definir orientador"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-600/10 rounded-md transition-colors"
                          onClick={() => openOrientadorModal(aluno)}
                        >
                          <Users size={18} />
                        </button>

                        <button
                          type="button"
                          title="Copiar e-mail"
                          className="p-1.5 text-slate-400 hover:text-[#359830] hover:bg-[#359830]/10 rounded-md transition-colors"
                          onClick={() => {
                            if (aluno.email)
                              navigator.clipboard?.writeText(aluno.email);
                            toast.success(
                              "E-mail copiado (se o navegador permitir).",
                            );
                          }}
                        >
                          <Mail size={18} />
                        </button>
                        <button
                          type="button"
                          title="OpÃ§Ãµes"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                          onClick={() =>
                            toast(
                              "AÃ§Ãµes extras: editar aluno, reset senha, etc. (prÃ³ximo passo).",
                              { icon: "â„¹ï¸" },
                            )
                          }
                        >
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <h3 className="text-lg font-medium text-slate-900">
                      Nenhum aluno encontrado
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Ajuste os filtros de busca para encontrar o que procura.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {alunosFiltrados.length > 0 && (
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Mostrando{" "}
              <span className="font-medium">{alunosFiltrados.length}</span> de{" "}
              <span className="font-medium">{rows.length}</span> alunos
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                className="px-3 py-1 border border-slate-300 rounded-md bg-white text-slate-600 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                disabled
              >
                Anterior
              </button>
              <button
                type="button"
                className="px-3 py-1 border border-slate-300 rounded-md bg-white text-slate-600 text-sm font-medium hover:bg-slate-50"
                disabled
              >
                PrÃ³xima
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        title="Definir orientador do TCC"
        onClose={() => (modalSaving ? null : setModalOpen(false))}
        footer={
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              {modalAluno?.nome ? (
                <>
                  <span className="font-semibold text-slate-700">
                    {modalAluno.nome}
                  </span>{" "}
                  â€ • <span className="font-semibold text-slate-700">{modalTcc?.titulo || "TCC cadastrado"}</span>
                </>
              ) : null}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                onClick={() => setModalOpen(false)}
                disabled={modalSaving}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
                onClick={saveOrientador}
                disabled={modalSaving}
              >
                {modalSaving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        }
      >
        {!modalTcc?.id ? (
          <div className="text-sm text-slate-600">
            Sem TCC encontrado para esse aluno.
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Orientador (obrigatÃ³rio)
              </div>
              <select
                value={orientadorId}
                onChange={(e) => setOrientadorId(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none bg-white text-sm"
              >
                <option value="">Selecione...</option>
                {profOptions.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.nome}
                    {p.email ? ` (${p.email})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Coorientador (opcional)
              </div>
              <select
                value={coorientadorId}
                onChange={(e) => setCoorientadorId(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none bg-white text-sm"
              >
                <option value="">Nenhum</option>
                {profOptions.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.nome}
                    {p.email ? ` (${p.email})` : ""}
                  </option>
                ))}
              </select>
              <div className="text-xs text-slate-500 mt-2">
                Observacao: o vinculo e feito no TCC via PUT /api/tccs/:id.
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}


