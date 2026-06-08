import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Award,
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
  MapPin,
  Pencil,
  Users,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { getAllBancas, getUsuario, updateBanca } from "../../services/api.js";

function parseDate(value) {
  if (!value) return null;
  if (Array.isArray(value)) {
    const [y, m, d, hh = 0, mm = 0, ss = 0] = value;
    return y && m && d ? new Date(y, m - 1, d, hh, mm, ss) : null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatFullDate(value) {
  const date = parseDate(value);
  return date
    ? date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";
}

function formatTime(value) {
  const date = parseDate(value);
  return date
    ? date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : "-";
}

function ModalNota({ banca, nota, setNota, saving, onClose, onSave }) {
  if (!banca) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-bold text-slate-800">
              Registrar nota final
            </h2>
            <button
              type="button"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              onClick={onClose}
            >
              <X size={18} />
            </button>
          </div>
          <div className="space-y-4 p-5">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-800">
                {banca.tccTitulo}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Aluno(a): {banca.alunoNome}
              </p>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Nota final
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#359830]"
                placeholder="Ex.: 9.5"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="rounded-lg bg-[#359830] px-4 py-2 text-sm font-bold text-white hover:bg-[#2a7725] disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar nota"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BancasPage() {
  const usuario = getUsuario();
  const [bancas, setBancas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [filtro, setFiltro] = useState("proximas");
  const [bancaNota, setBancaNota] = useState(null);
  const [nota, setNota] = useState("");
  const [savingNota, setSavingNota] = useState(false);

  const carregarBancas = useCallback(async () => {
    if (!usuario?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErro(null);
      const data = await getAllBancas();
      const professorId = Number(usuario.id);
      const minhas = (Array.isArray(data) ? data : []).filter((banca) => {
        const orientador = Number(banca.orientadorId) === professorId;
        const avaliador = (banca.avaliadores || []).some(
          (item) => Number(item.professorId) === professorId,
        );
        return orientador || avaliador;
      });
      setBancas(minhas);
    } catch (e) {
      setErro(e?.message || "Erro ao carregar bancas.");
    } finally {
      setLoading(false);
    }
  }, [usuario?.id]);

  useEffect(() => {
    carregarBancas();
  }, [carregarBancas]);

  const rows = useMemo(() => {
    const now = new Date();
    return bancas
      .map((banca) => {
        const date = parseDate(banca.data);
        return {
          ...banca,
          date,
          realizada: date ? date < now : false,
          dia: date ? String(date.getDate()).padStart(2, "0") : "-",
          mes: date
            ? date
                .toLocaleString("pt-BR", { month: "short" })
                .replace(".", "")
                .toUpperCase()
            : "-",
        };
      })
      .sort((a, b) => (a.date?.getTime() || 0) - (b.date?.getTime() || 0));
  }, [bancas]);

  const bancasFiltradas = rows.filter((banca) => {
    if (filtro === "proximas") return !banca.realizada;
    if (filtro === "realizadas") return banca.realizada;
    return true;
  });

  function abrirNota(banca) {
    setBancaNota(banca);
    setNota(banca.notaFinal != null ? String(banca.notaFinal) : "");
  }

  async function salvarNota() {
    if (!bancaNota?.id) return;
    const notaNumber = nota !== "" ? Number(nota) : null;
    if (
      notaNumber == null ||
      Number.isNaN(notaNumber) ||
      notaNumber < 0 ||
      notaNumber > 10
    ) {
      toast.error("Informe uma nota entre 0 e 10.");
      return;
    }

    try {
      setSavingNota(true);
      await updateBanca(bancaNota.id, {
        tccId: bancaNota.tccId,
        data: bancaNota.data || null,
        local: bancaNota.local || null,
        notaFinal: notaNumber,
      });
      toast.success("Nota final registrada.");
      setBancaNota(null);
      await carregarBancas();
    } catch (e) {
      toast.error(e?.message || "Erro ao salvar nota.");
    } finally {
      setSavingNota(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Agenda de Bancas</h1>
        <p className="mt-1 text-slate-500">
          Acompanhe as defesas em que voce participa e registre a nota final.
        </p>
      </div>

      <div className="inline-flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
        <button
          type="button"
          onClick={() => setFiltro("proximas")}
          className={`flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            filtro === "proximas"
              ? "border border-[#359830]/20 bg-[#359830]/10 text-[#2a7725] shadow-sm"
              : "border border-transparent text-slate-600 hover:bg-slate-50"
          }`}
        >
          <CalendarIcon size={16} className="mr-2" />
          Proximas
        </button>
        <button
          type="button"
          onClick={() => setFiltro("realizadas")}
          className={`flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            filtro === "realizadas"
              ? "border border-slate-200 bg-slate-100 text-slate-800 shadow-sm"
              : "border border-transparent text-slate-600 hover:bg-slate-50"
          }`}
        >
          <CheckCircle size={16} className="mr-2" />
          Realizadas
        </button>
      </div>

      {loading && (
        <div className="py-8 text-center text-slate-400">
          Carregando bancas...
        </div>
      )}
      {erro && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {erro}
        </div>
      )}

      <div className="space-y-4">
        {!loading && !erro && bancasFiltradas.length > 0 ? (
          bancasFiltradas.map((banca) => (
            <div
              key={banca.id}
              className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md sm:flex-row"
            >
              <div
                className={`flex flex-col items-center justify-center border-b border-slate-100 p-6 sm:w-32 sm:border-b-0 sm:border-r ${
                  banca.realizada
                    ? "bg-slate-50 text-slate-400"
                    : "bg-[#359830] text-white"
                }`}
              >
                <span className="text-sm font-bold uppercase tracking-wider opacity-80">
                  {banca.mes}
                </span>
                <span className="my-1 text-4xl font-black leading-none">
                  {banca.dia}
                </span>
                <div className="mt-2 flex items-center rounded-md bg-black/10 px-2 py-1 text-xs font-medium opacity-90">
                  <Clock size={12} className="mr-1" />
                  {formatTime(banca.data)}
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-[#359830]/20 bg-[#359830]/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#2a7725]">
                      {Number(banca.orientadorId) === Number(usuario.id)
                        ? "Orientador"
                        : "Avaliador"}
                    </span>
                    {banca.realizada && (
                      <span className="flex items-center rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        <CheckCircle size={12} className="mr-1" />
                        Realizada
                      </span>
                    )}
                  </div>

                  <h3 className="mb-1 text-lg font-bold leading-tight text-slate-800">
                    {banca.tccTitulo || "Defesa de TCC"}
                  </h3>
                  <p className="mb-4 flex items-center text-sm font-medium text-slate-600">
                    <Users size={16} className="mr-2 text-slate-400" />
                    Aluno(a):{" "}
                    <span className="ml-1 text-slate-800">
                      {banca.alunoNome || "-"}
                    </span>
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 md:grid-cols-3">
                  <div className="flex items-start space-x-2 text-sm text-slate-600">
                    <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" />
                    <div>
                      <span className="block font-semibold text-slate-700">
                        Local
                      </span>
                      <span>{banca.local || "-"}</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 text-sm text-slate-600">
                    <CalendarIcon
                      size={16}
                      className="mt-0.5 shrink-0 text-slate-400"
                    />
                    <div>
                      <span className="block font-semibold text-slate-700">
                        Data
                      </span>
                      <span>{formatFullDate(banca.data)}</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 text-sm text-slate-600">
                    <Award size={16} className="mt-0.5 shrink-0 text-[#359830]" />
                    <div>
                      <span className="block font-semibold text-slate-700">
                        Nota final
                      </span>
                      <span>
                        {banca.notaFinal != null
                          ? Number(banca.notaFinal).toFixed(1)
                          : "Nao registrada"}
                      </span>
                    </div>
                  </div>
                </div>

                {banca.realizada && (
                  <div className="mt-5 flex justify-end">
                    <button
                      type="button"
                      onClick={() => abrirNota(banca)}
                      className="flex items-center rounded-lg bg-[#359830] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#2a7725]"
                    >
                      <Pencil size={15} className="mr-2" />
                      {banca.notaFinal != null ? "Alterar nota" : "Registrar nota"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          !loading &&
          !erro && (
            <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
                <Award size={32} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                Nenhuma banca encontrada
              </h3>
              <p className="mt-1 text-slate-500">
                Voce nao possui bancas na categoria selecionada.
              </p>
            </div>
          )
        )}
      </div>

      <ModalNota
        banca={bancaNota}
        nota={nota}
        setNota={setNota}
        saving={savingNota}
        onClose={() => setBancaNota(null)}
        onSave={salvarNota}
      />
    </div>
  );
}
