import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  Layers,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { confirmToast } from "../../lib/toast";
import { createArea, deleteArea, getAllAreas } from "../../services/api";

export default function AreasPage() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busca, setBusca] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const colors = [
    "bg-[#359830]",
    "bg-purple-500",
    "bg-red-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-blue-500",
    "bg-pink-500",
    "bg-indigo-500",
  ];

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllAreas();
      setAreas(data || []);
    } catch (e) {
      const message = e?.message || "Erro ao carregar areas.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCriar(e) {
    e.preventDefault();
    if (!novoNome.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      const nova = await createArea({ nome: novoNome.trim() });
      setAreas((prev) => [...prev, nova]);
      setNovoNome("");
      setShowModal(false);
      toast.success("Area criada com sucesso.");
    } catch (e) {
      const message = e?.message || "Erro ao criar area.";
      setSaveError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletar(id) {
    confirmToast({
      title: "Remover area?",
      message: "Esta area de pesquisa sera removida da listagem.",
      confirmText: "Remover",
      onConfirm: async () => {
        setDeletingId(id);
        try {
          await deleteArea(id);
          setAreas((prev) => prev.filter((area) => area.id !== id));
          toast.success("Area removida.");
        } catch (e) {
          toast.error(e?.message || "Erro ao remover area.");
        } finally {
          setDeletingId(null);
        }
      },
    });
  }

  const areasFiltradas = areas.filter((area) =>
    area.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center text-2xl font-bold text-slate-800">
            <Layers className="mr-2 text-[#359830]" size={28} />
            Linhas de Pesquisa
          </h1>
          <p className="mt-1 text-slate-500">
            Gerencie as areas tematicas disponiveis para os trabalhos de
            conclusao.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowModal(true);
            setSaveError(null);
            setNovoNome("");
          }}
          className="flex w-full items-center justify-center rounded-lg bg-[#359830] px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-[#2a7725] sm:w-auto"
        >
          <Plus size={18} className="mr-2" /> Nova Area
        </button>
      </div>

      <div className="relative max-w-md">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Buscar area por nome..."
          className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-[#359830]"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-[#359830]">
          <Loader2 size={32} className="animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
          <p className="font-medium">{error}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {areasFiltradas.map((area, index) => (
              <div
                key={area.id}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:shadow-lg"
              >
                <div className={`h-2 w-full ${colors[index % colors.length]}`} />
                <div className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="rounded-lg bg-slate-50 p-2">
                      <BookOpen className="text-slate-400" size={20} />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeletar(area.id)}
                      disabled={deletingId === area.id}
                      className="rounded-md p-1.5 text-slate-400 opacity-0 transition-colors hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                      title="Remover area"
                    >
                      {deletingId === area.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {area.nome}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          {areasFiltradas.length === 0 && (
            <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 py-20 text-center">
              <Layers className="mx-auto mb-4 text-slate-300" size={48} />
              <h3 className="font-bold text-slate-800">
                Nenhuma linha de pesquisa encontrada
              </h3>
              <p className="text-sm text-slate-500">
                {busca
                  ? "Tente redefinir sua busca."
                  : 'Clique em "Nova Area" para criar a primeira.'}
              </p>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-800">
                Nova Area de Pesquisa
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handleCriar} className="space-y-4 p-6">
              {saveError && (
                <div className="flex items-center rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle size={16} className="mr-2 shrink-0" />
                  {saveError}
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Nome da Area <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="Ex: Inteligencia Artificial"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#359830]"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || !novoNome.trim()}
                  className="flex flex-1 items-center justify-center rounded-lg bg-[#359830] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2a7725] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    "Criar Area"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
