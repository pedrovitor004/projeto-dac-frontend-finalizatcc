import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Filter,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  User,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { confirmToast } from "../../lib/toast";
import {
  ApiError,
  createAvaliador,
  createBanca,
  deleteAvaliador,
  deleteBanca,
  getAllBancas,
  getAllProfessores,
  getAllTccs,
  updateBanca,
} from "../../services/api";

function errMessage(e, fallback) {
  if (e instanceof ApiError) return e.message;
  return e?.message || fallback;
}

function parseDate(value) {
  if (!value) return null;
  if (Array.isArray(value)) {
    const [y, m, d, hh = 0, mm = 0, ss = 0] = value;
    return y && m && d ? new Date(y, m - 1, d, hh, mm, ss) : null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = parseDate(value);
  return date ? date.toLocaleDateString("pt-BR") : "-";
}

function formatTime(value) {
  const date = parseDate(value);
  return date
    ? date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : "-";
}

function toLocalDateTime(date, time) {
  if (!date || !time) return null;
  return `${date}T${time}:00`;
}

function Modal({ open, title, onClose, children, footer }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-bold text-slate-800">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              title="Fechar"
            >
              <X size={18} />
            </button>
          </div>
          <div className="p-5">{children}</div>
          <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BancasPage() {
  const [loading, setLoading] = useState(true);
  const [bancas, setBancas] = useState([]);
  const [tccs, setTccs] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todas");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);
  const [editingBanca, setEditingBanca] = useState(null);
  const [form, setForm] = useState({
    tccId: "",
    date: "",
    time: "",
    local: "",
    notaFinal: "",
  });
  const [avaliadorForm, setAvaliadorForm] = useState({
    professorId: "",
    papel: "AVALIADOR",
  });

  async function refresh() {
    const [bancasData, tccsData, professoresData] = await Promise.all([
      getAllBancas(),
      getAllTccs(),
      getAllProfessores(),
    ]);
    setBancas(Array.isArray(bancasData) ? bancasData : []);
    setTccs(Array.isArray(tccsData) ? tccsData : []);
    setProfessores(Array.isArray(professoresData) ? professoresData : []);
  }

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        await refresh();
      } catch (e) {
        if (alive) toast.error(errMessage(e, "Erro ao carregar bancas."));
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const tccById = useMemo(() => {
    const map = new Map();
    for (const tcc of tccs) map.set(tcc.id, tcc);
    return map;
  }, [tccs]);

  const tccOptions = useMemo(
    () =>
      tccs
        .map((tcc) => ({
          id: tcc.id,
          label: `${tcc.alunoNome || "Aluno"} - ${tcc.titulo || "Sem titulo"}`,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [tccs],
  );

  const professorOptions = useMemo(
    () =>
      professores
        .map((professor) => ({
          id: professor.id,
          label: `${professor.nome || "Professor"}${professor.email ? ` (${professor.email})` : ""}`,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [professores],
  );

  const rows = useMemo(() => {
    const now = new Date();

    return bancas
      .map((banca) => {
        const tcc = tccById.get(banca.tccId);
        const date = parseDate(banca.data);
        const realizada = date ? date < now : false;

        return {
          ...banca,
          date,
          realizada,
          alunoNome: banca.alunoNome || tcc?.alunoNome || "Aluno",
          orientadorNome: banca.orientadorNome || tcc?.orientadorNome || "-",
          tccTitulo: banca.tccTitulo || tcc?.titulo || "Defesa de TCC",
          avaliadores: Array.isArray(banca.avaliadores)
            ? banca.avaliadores
            : [],
        };
      })
      .sort((a, b) => (a.date?.getTime() || 0) - (b.date?.getTime() || 0));
  }, [bancas, tccById]);

  const filtradas = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    return rows.filter((banca) => {
      const passaTexto =
        !termo ||
        banca.alunoNome.toLowerCase().includes(termo) ||
        banca.orientadorNome.toLowerCase().includes(termo) ||
        banca.tccTitulo.toLowerCase().includes(termo);

      const passaFiltro =
        filtro === "todas" ||
        (filtro === "pendentes" && banca.notaFinal == null) ||
        (filtro === "finalizadas" && banca.notaFinal != null);

      return passaTexto && passaFiltro;
    });
  }, [rows, busca, filtro]);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function openCreateModal() {
    setEditingBanca(null);
    setForm({ tccId: "", date: "", time: "", local: "", notaFinal: "" });
    setAvaliadorForm({ professorId: "", papel: "AVALIADOR" });
    setModalOpen(true);
  }

  function openEditModal(banca) {
    const date = parseDate(banca.data);
    setEditingBanca(banca);
    setForm({
      tccId: String(banca.tccId || ""),
      date: date ? date.toISOString().slice(0, 10) : "",
      time: date ? date.toTimeString().slice(0, 5) : "",
      local: banca.local || "",
      notaFinal: banca.notaFinal != null ? String(banca.notaFinal) : "",
    });
    setAvaliadorForm({ professorId: "", papel: "AVALIADOR" });
    setModalOpen(true);
  }

  function closeModal() {
    if (modalSaving) return;
    setModalOpen(false);
    setEditingBanca(null);
  }

  async function submitSave() {
    if (!form.tccId) {
      toast.error("Selecione o TCC.");
      return;
    }

    const notaFinal = form.notaFinal !== "" ? Number(form.notaFinal) : null;
    if (notaFinal != null && (Number.isNaN(notaFinal) || notaFinal < 0 || notaFinal > 10)) {
      toast.error("A nota final deve ficar entre 0 e 10.");
      return;
    }

    const payload = {
      tccId: Number(form.tccId),
      data: toLocalDateTime(form.date, form.time),
      local: form.local.trim() || null,
      notaFinal,
    };

    try {
      setModalSaving(true);
      if (editingBanca?.id) {
        await updateBanca(editingBanca.id, payload);
        toast.success("Banca atualizada.");
      } else {
        await createBanca(payload);
        toast.success("Banca criada.");
      }
      closeModal();
      await refresh();
    } catch (e) {
      toast.error(errMessage(e, "Erro ao salvar banca."));
    } finally {
      setModalSaving(false);
    }
  }

  async function handleDelete(id) {
    confirmToast({
      title: "Excluir banca?",
      message: "Esta acao remove o agendamento da banca selecionada.",
      confirmText: "Excluir",
      onConfirm: async () => {
        try {
          await deleteBanca(id);
          toast.success("Banca excluida.");
          await refresh();
        } catch (e) {
          toast.error(errMessage(e, "Erro ao excluir banca."));
        }
      },
    });
  }

  async function adicionarAvaliador() {
    if (!editingBanca?.id) {
      toast.error("Salve a banca antes de adicionar avaliadores.");
      return;
    }
    if (!avaliadorForm.professorId) {
      toast.error("Selecione um professor avaliador.");
      return;
    }

    const jaExiste = (editingBanca.avaliadores || []).some(
      (avaliador) =>
        Number(avaliador.professorId) === Number(avaliadorForm.professorId),
    );
    if (jaExiste) {
      toast.error("Esse professor ja esta na banca.");
      return;
    }

    try {
      await createAvaliador({
        bancaId: editingBanca.id,
        professorId: Number(avaliadorForm.professorId),
        papel: avaliadorForm.papel,
      });
      toast.success("Avaliador adicionado.");
      await refresh();
      const atualizada = (await getAllBancas()).find(
        (banca) => banca.id === editingBanca.id,
      );
      if (atualizada) setEditingBanca(atualizada);
      setAvaliadorForm({ professorId: "", papel: "AVALIADOR" });
    } catch (e) {
      toast.error(errMessage(e, "Erro ao adicionar avaliador."));
    }
  }

  async function removerAvaliador(avaliadorId) {
    try {
      await deleteAvaliador(avaliadorId);
      toast.success("Avaliador removido.");
      await refresh();
      const atualizada = (await getAllBancas()).find(
        (banca) => banca.id === editingBanca?.id,
      );
      if (atualizada) setEditingBanca(atualizada);
    } catch (e) {
      toast.error(errMessage(e, "Erro ao remover avaliador."));
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl p-10 text-center text-slate-500">
        Carregando bancas...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Gestao de Bancas
          </h1>
          <p className="mt-1 text-slate-500">
            Agende defesas, ajuste dados da banca e registre a nota final.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="flex w-full items-center justify-center rounded-lg bg-[#359830] px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-[#2a7725] sm:w-auto"
        >
          <Plus size={18} className="mr-2" />
          Agendar Banca
        </button>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-100 p-1">
          {[
            ["todas", "Todas"],
            ["pendentes", "Sem nota"],
            ["finalizadas", "Com nota"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFiltro(value)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                filtro === value
                  ? "bg-white text-[#2a7725] shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative flex flex-1 md:max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar por aluno, orientador ou TCC..."
            className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#359830]"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-500">
          <Filter size={16} className="mr-2" />
          {filtradas.length} resultado(s)
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtradas.map((banca) => (
          <div
            key={banca.id}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-colors hover:border-[#359830]/40"
          >
            <div className="flex flex-col md:flex-row">
              <div className="flex flex-col items-center justify-center border-b border-slate-100 bg-slate-50 p-6 md:w-40 md:border-b-0 md:border-r">
                <CalendarIcon size={24} className="mb-2 text-[#359830]" />
                <span className="text-lg font-bold text-slate-800">
                  {formatDate(banca.data)}
                </span>
                <span className="mt-1 flex items-center text-sm font-medium text-slate-500">
                  <Clock size={14} className="mr-1" />
                  {formatTime(banca.data)}
                </span>
              </div>

              <div className="flex-1 p-6">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">
                      {banca.alunoNome}
                    </h3>
                    <p className="text-sm font-medium text-[#2a7725]">
                      {banca.tccTitulo}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Orientador: {banca.orientadorNome}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      banca.notaFinal != null
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {banca.notaFinal != null ? "Com nota" : "Sem nota"}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex items-center text-sm text-slate-600">
                    <MapPin size={16} className="mr-2 text-slate-400" />
                    <span>{banca.local || "Local nao definido"}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <User size={16} className="mr-2 text-slate-400" />
                    <span>
                      Nota final:{" "}
                      {banca.notaFinal != null
                        ? Number(banca.notaFinal).toFixed(1)
                        : "-"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {banca.avaliadores.length > 0 ? (
                    banca.avaliadores.map((avaliador) => (
                      <span
                        key={avaliador.id}
                        className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase text-slate-600"
                      >
                        {avaliador.professorNome || "Professor"} -{" "}
                        {avaliador.papel || "Avaliador"}
                      </span>
                    ))
                  ) : (
                    <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase text-slate-600">
                      Sem avaliadores cadastrados
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-center gap-2 border-t border-slate-100 bg-slate-50 p-4 md:flex-col md:border-l md:border-t-0 md:p-6">
                <button
                  type="button"
                  className="flex flex-1 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100 md:flex-none"
                  onClick={() => openEditModal(banca)}
                >
                  <Pencil size={15} className="mr-1.5" />
                  Editar
                </button>
                <button
                  type="button"
                  className="flex flex-1 items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-700 md:flex-none"
                  onClick={() => handleDelete(banca.id)}
                >
                  <Trash2 size={16} className="mr-2" />
                  Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtradas.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
          Nenhuma banca encontrada.
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editingBanca ? "Editar banca" : "Agendar nova banca"}
        onClose={closeModal}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              onClick={closeModal}
              disabled={modalSaving}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="rounded-lg bg-[#359830] px-4 py-2 text-sm font-bold text-white hover:bg-[#2a7725] disabled:opacity-50"
              onClick={submitSave}
              disabled={modalSaving}
            >
              {modalSaving
                ? "Salvando..."
                : editingBanca
                  ? "Salvar alteracoes"
                  : "Criar banca"}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
              TCC
            </label>
            <select
              value={form.tccId}
              onChange={(e) => updateForm("tccId", e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#359830]"
            >
              <option value="">Selecione...</option>
              {tccOptions.map((tcc) => (
                <option key={tcc.id} value={String(tcc.id)}>
                  {tcc.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Data
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => updateForm("date", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#359830]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Horario
              </label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => updateForm("time", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#359830]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Local
            </label>
            <input
              type="text"
              value={form.local}
              onChange={(e) => updateForm("local", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#359830]"
              placeholder="Sala, laboratorio, auditorio ou link"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Nota final
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={form.notaFinal}
              onChange={(e) => updateForm("notaFinal", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#359830]"
              placeholder="Ex.: 9.5"
            />
            <p className="mt-1 text-xs text-slate-500">
              Ao salvar uma nota, o sistema considera a banca realizada e
              atualiza o status do TCC.
            </p>
          </div>

          {editingBanca?.id && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">
                  Avaliadores da banca
                </h3>
                <span className="text-xs font-semibold text-slate-400">
                  {(editingBanca.avaliadores || []).length} cadastrado(s)
                </span>
              </div>

              <div className="space-y-2">
                {(editingBanca.avaliadores || []).length > 0 ? (
                  editingBanca.avaliadores.map((avaliador) => (
                    <div
                      key={avaliador.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          {avaliador.professorNome || "Professor"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {avaliador.papel || "AVALIADOR"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removerAvaliador(avaliador.id)}
                        className="rounded-md px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50"
                      >
                        Remover
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="rounded-lg border border-dashed border-slate-200 bg-white p-3 text-sm text-slate-400">
                    Nenhum avaliador cadastrado.
                  </p>
                )}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_150px_auto]">
                <select
                  value={avaliadorForm.professorId}
                  onChange={(e) =>
                    setAvaliadorForm((current) => ({
                      ...current,
                      professorId: e.target.value,
                    }))
                  }
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#359830]"
                >
                  <option value="">Selecione o professor...</option>
                  {professorOptions.map((professor) => (
                    <option key={professor.id} value={String(professor.id)}>
                      {professor.label}
                    </option>
                  ))}
                </select>
                <select
                  value={avaliadorForm.papel}
                  onChange={(e) =>
                    setAvaliadorForm((current) => ({
                      ...current,
                      papel: e.target.value,
                    }))
                  }
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#359830]"
                >
                  <option value="AVALIADOR">Avaliador</option>
                  <option value="PRESIDENTE">Presidente</option>
                  <option value="ORIENTADOR">Orientador</option>
                </select>
                <button
                  type="button"
                  onClick={adicionarAvaliador}
                  className="rounded-lg bg-[#359830] px-4 py-2 text-sm font-bold text-white hover:bg-[#2a7725]"
                >
                  Adicionar
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
