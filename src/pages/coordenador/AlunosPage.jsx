import React, { useEffect, useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Mail,
  MoreVertical,
  Search,
  UserPlus,
  Users,
  UserX,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  ApiError,
  getAllAlunos,
  getAllProfessores,
  getAllTccs,
  updateTcc,
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
      return status ? String(status) : "-";
  }
}

function uiStatusFromTcc(tcc) {
  if (!tcc) return { label: "Sem TCC", kind: "pendente" };
  if (tcc.status === "APROVADO") return { label: "Concluido", kind: "ok" };
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
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div className="font-bold text-slate-800">{title}</div>
            <button
              type="button"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              onClick={onClose}
              title="Fechar"
            >
              <X size={18} />
            </button>
          </div>
          <div className="p-5">{children}</div>
          {footer ? (
            <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function AlunosPage() {
  const gridRef = useRef(null);
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
        await refresh();
      } catch (e) {
        if (alive) toast.error(errMessage(e, "Erro ao carregar alunos."));
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
      const tema = tcc?.titulo || "Ainda nao definido";
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

  const alunosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    return rows.filter((aluno) => {
      const passaBusca =
        !termo ||
        aluno.nome.toLowerCase().includes(termo) ||
        String(aluno.matricula || "").includes(termo);

      const passaStatus =
        filtroStatus === "Todos" ||
        (filtroStatus === "Em Dia" &&
          aluno.uiStatus.kind === "ok" &&
          aluno.uiStatus.label === "Em andamento") ||
        (filtroStatus === "Atrasado" && aluno.uiStatus.kind === "bad") ||
        (filtroStatus === "Pendente" &&
          aluno.uiStatus.kind === "pendente") ||
        (filtroStatus === "Concluido" &&
          aluno.uiStatus.label === "Concluido");

      let passaOrientador = true;
      if (filtroOrientador === "Sem Orientador")
        passaOrientador = aluno.orientador === null;
      else if (filtroOrientador === "Com Orientador")
        passaOrientador = aluno.orientador !== null;

      return passaBusca && passaStatus && passaOrientador;
    });
  }, [rows, busca, filtroStatus, filtroOrientador]);

  const renderStatus = (ui) => {
    if (ui.label === "Concluido") {
      return (
        <span className="inline-flex items-center rounded-full bg-[#c7f1dd] px-2 py-0.5 text-[11px] font-semibold text-[#087a3d]">
          <CheckCircle size={12} className="mr-1" /> Concluido
        </span>
      );
    }
    if (ui.kind === "bad") {
      return (
        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700">
          <AlertCircle size={12} className="mr-1" /> {ui.label}
        </span>
      );
    }
    if (ui.kind === "pendente") {
      return (
        <span className="inline-flex items-center rounded-full bg-[#ffe9b0] px-2 py-0.5 text-[11px] font-semibold text-[#9a5b00]">
          <Clock size={12} className="mr-1" /> Pendente
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-[#c7f1dd] px-2 py-0.5 text-[11px] font-semibold text-[#087a3d]">
        <CheckCircle size={12} className="mr-1" /> Em andamento
      </span>
    );
  };

  function openOrientadorModal(alunoRow) {
    const tcc = alunoRow.tcc;
    if (!tcc?.id) {
      toast(
        "Esse aluno ainda nao tem TCC para vincular orientador. Hoje o vinculo e feito no TCC.",
        { icon: "i" },
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
      toast.error("Coorientador nao pode ser igual ao orientador.");
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

  const columnDefs = useMemo(
    () => [
      {
        headerName: "Aluno",
        field: "nome",
        minWidth: 230,
        flex: 1.25,
        cellRenderer: ({ data }) => {
          if (!data) return null;
          return (
            <span className="block truncate text-[12px] font-normal text-blue-700">
              {data.nome}
            </span>
          );
        },
      },
      {
        headerName: "Matricula",
        field: "matricula",
        width: 135,
      },
      {
        headerName: "Orientador",
        field: "orientador",
        minWidth: 190,
        flex: 1,
        valueGetter: ({ data }) => data?.orientador || "Sem orientador",
        cellRenderer: ({ data }) => {
          if (!data) return null;
          return data.orientador ? (
            <span className="truncate text-[12px] font-normal text-black">
              {data.orientador}
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700">
              <UserX size={14} className="mr-1" /> Sem orientador
            </span>
          );
        },
      },
      {
        headerName: "Fase atual",
        field: "fase",
        width: 165,
      },
      {
        headerName: "Tema",
        field: "tema",
        minWidth: 240,
        flex: 1.15,
      },
      {
        headerName: "Status",
        field: "uiStatus.label",
        width: 150,
        cellRenderer: ({ data }) => (data ? renderStatus(data.uiStatus) : null),
      },
      {
        headerName: "Acoes",
        field: "actions",
        width: 120,
        sortable: false,
        filter: false,
        floatingFilter: false,
        cellRenderer: ({ data }) => {
          if (!data) return null;
          return (
            <div className="flex h-full items-center justify-end gap-1">
              <button
                type="button"
                title="Definir orientador"
                className="rounded p-1 text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-700"
                onClick={() => openOrientadorModal(data)}
              >
                <Users size={16} />
              </button>

              <button
                type="button"
                title="Copiar e-mail"
                className="rounded p-1 text-slate-500 transition-colors hover:bg-[#359830]/10 hover:text-[#359830]"
                onClick={() => {
                  if (data.email && navigator.clipboard?.writeText) {
                    navigator.clipboard.writeText(data.email);
                    toast.success("E-mail copiado.");
                  } else {
                    toast.error("Nao foi possivel copiar o e-mail.");
                  }
                }}
              >
                <Mail size={16} />
              </button>

              <button
                type="button"
                title="Opcoes"
                className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                onClick={() =>
                  toast(
                    "Acoes extras: editar aluno, reset senha, etc. (proximo passo).",
                    { icon: "i" },
                  )
                }
              >
                <MoreVertical size={16} />
              </button>
            </div>
          );
        },
      },
    ],
    [],
  );

  const defaultColDef = useMemo(
    () => ({
      filter: true,
      floatingFilter: true,
      resizable: true,
      sortable: true,
      suppressHeaderMenuButton: true,
    }),
    [],
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl p-10 text-center text-slate-500">
        Carregando alunos...
      </div>
    );
  }

  return (
    <div className="mx-0 max-w-none space-y-3">
      <div className="rounded-lg border border-slate-200 bg-white px-7 py-4 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[300px_1fr] lg:items-end">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Buscar aluno
            </label>
            <div className="relative w-full">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Nome ou matricula"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="h-10 w-full rounded border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-slate-500"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-medium text-slate-700">
                Mostrando:{" "}
                <span className="font-semibold text-slate-950">
                  {alunosFiltrados.length} de {rows.length}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-5 text-sm">
                <button
                  type="button"
                  className="inline-flex items-center text-slate-500 transition hover:text-slate-900 disabled:text-slate-300"
                  onClick={() => {
                    if (!alunosFiltrados.length) {
                      toast.error("Nao ha alunos para exportar.");
                      return;
                    }
                    gridRef.current?.api?.exportDataAsCsv({
                      fileName: "alunos-finaliza-tcc.csv",
                    });
                    toast.success("CSV exportado.");
                  }}
                >
                  <FileText size={16} className="mr-1.5" /> Exportar CSV
                </button>
                <button
                  type="button"
                  className="inline-flex items-center text-slate-500 transition hover:text-slate-900"
                  onClick={() =>
                    toast(
                      "Fluxo de criacao administrativa: use o cadastro publico ou crie endpoint dedicado.",
                      { icon: "i" },
                    )
                  }
                >
                  <UserPlus size={16} className="mr-1.5" /> Novo Aluno
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                value={filtroOrientador}
                onChange={(e) => setFiltroOrientador(e.target.value)}
                className="h-10 rounded border border-slate-300 bg-white pl-3 pr-8 text-sm text-slate-900 outline-none focus:border-slate-500 sm:w-52"
              >
                <option value="Todos">Todos os Orientadores</option>
                <option value="Com Orientador">Com Orientador</option>
                <option value="Sem Orientador">Sem Orientador</option>
              </select>

              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="h-10 rounded border border-slate-300 bg-white pl-3 pr-8 text-sm text-slate-900 outline-none focus:border-slate-500 sm:w-40"
              >
                <option value="Todos">Todos os Status</option>
                <option value="Em Dia">Em andamento</option>
                <option value="Atrasado">Reprovado</option>
                <option value="Pendente">Pendente</option>
                <option value="Concluido">Concluido</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm">
        <div className="ag-theme-balham finaliza-ag-grid finaliza-ag-grid-compact h-[590px] w-full">
          <AgGridReact
            ref={gridRef}
            rowData={alunosFiltrados}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            rowHeight={32}
            headerHeight={34}
            floatingFiltersHeight={36}
            animateRows
            pagination
            paginationPageSize={12}
            paginationPageSizeSelector={[12, 25, 50, 100]}
            rowSelection={{
              mode: "multiRow",
              checkboxes: true,
              headerCheckbox: true,
            }}
            overlayNoRowsTemplate="<span class='ag-empty-state'>Nenhum aluno encontrado. Ajuste os filtros de busca.</span>"
            getRowId={({ data }) => String(data.id)}
            getRowClass={({ data }) => {
              if (!data) return "";
              if (data.uiStatus.kind === "ok") return "row-status-ok";
              if (data.uiStatus.kind === "bad") return "row-status-bad";
              return "";
            }}
          />
        </div>
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
                  -{" "}
                  <span className="font-semibold text-slate-700">
                    {modalTcc?.titulo || "TCC cadastrado"}
                  </span>
                </>
              ) : null}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                onClick={() => setModalOpen(false)}
                disabled={modalSaving}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="rounded-lg bg-[#359830] px-4 py-2 text-sm font-bold text-white hover:bg-[#2a7725] disabled:opacity-50"
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
              <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                Orientador (obrigatorio)
              </div>
              <select
                value={orientadorId}
                onChange={(e) => setOrientadorId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#359830]"
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
              <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                Coorientador (opcional)
              </div>
              <select
                value={coorientadorId}
                onChange={(e) => setCoorientadorId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#359830]"
              >
                <option value="">Nenhum</option>
                {profOptions.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.nome}
                    {p.email ? ` (${p.email})` : ""}
                  </option>
                ))}
              </select>
              <div className="mt-2 text-xs text-slate-500">
                Observacao: o vinculo e feito no TCC via PUT /api/tccs/:id.
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
