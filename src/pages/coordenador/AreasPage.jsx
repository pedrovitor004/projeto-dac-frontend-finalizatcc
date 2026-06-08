import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Trash2,
  Layers,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { getAllAreas, createArea, deleteArea } from "../../services/api";

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

  const COLORS = [
    "bg-[#359830]", "bg-purple-500", "bg-red-500",
    "bg-emerald-500", "bg-amber-500", "bg-blue-500",
    "bg-pink-500", "bg-indigo-500",
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
      setError(e.message);
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
    } catch (e) {
      setSaveError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletar(id) {
    if (!window.confirm("Deseja remover esta área de pesquisa?")) return;
    setDeletingId(id);
    try {
      await deleteArea(id);
      setAreas((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      alert("Erro ao remover: " + e.message);
    } finally {
      setDeletingId(null);
    }
  }

  const areasFiltradas = areas.filter((a) =>
    a.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
            <Layers className="mr-2 text-[#359830]" size={28} />
            Linhas de Pesquisa
          </h1>
          <p className="text-slate-500 mt-1">
            Gerencie as áreas temáticas disponíveis para os trabalhos de conclusão.
          </p>
        </div>
        <button
          onClick={() => { setShowModal(true); setSaveError(null); setNovoNome(""); }}
          className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-[#359830] text-white font-medium rounded-lg hover:bg-[#2a7725] transition-colors shadow-sm"
        >
          <Plus size={18} className="mr-2" /> Nova Área
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Buscar área por nome..."
          className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#359830] outline-none transition-all text-sm bg-white"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-[#359830]">
          <Loader2 size={32} className="animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">
          <p className="font-medium">{error}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {areasFiltradas.map((area, idx) => (
              <div
                key={area.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all group"
              >
                <div className={`h-2 w-full ${COLORS[idx % COLORS.length]}`} />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <BookOpen className="text-slate-400" size={20} />
                    </div>
                    <button
                      onClick={() => handleDeletar(area.id)}
                      disabled={deletingId === area.id}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                      title="Remover área"
                    >
                      {deletingId === area.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">{area.nome}</h3>
                </div>
              </div>
            ))}
          </div>

          {areasFiltradas.length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <Layers className="mx-auto text-slate-300 mb-4" size={48} />
              <h3 className="text-slate-800 font-bold">Nenhuma linha de pesquisa encontrada</h3>
              <p className="text-slate-500 text-sm">
                {busca ? "Tente redefinir sua busca." : "Clique em \"Nova Área\" para criar a primeira."}
              </p>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">Nova Área de Pesquisa</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handleCriar} className="p-6 space-y-4">
              {saveError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm flex items-center">
                  <AlertCircle size={16} className="mr-2 shrink-0" />
                  {saveError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nome da Área <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="Ex: Inteligência Artificial"
                  required
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#359830] outline-none text-sm"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || !novoNome.trim()}
                  className="flex-1 px-4 py-2.5 bg-[#359830] text-white font-medium rounded-lg hover:bg-[#2a7725] transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : "Criar Área"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
