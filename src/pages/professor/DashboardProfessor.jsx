import React, { useEffect, useState } from "react";
import {
  Users,
  FileEdit,
  Calendar,
  Bell,
  CheckCircle,
  Clock,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import CardStats from "../../components/shared/CardStats.jsx";
import TableTCC from "../../components/shared/TableTCC.jsx";
import { getUsuario, getTccsByProfessor, getSubmissoesByTcc } from "../../services/api.js";

export default function DashboardProfessor() {
  const usuario = getUsuario();

  const [tccs, setTccs] = useState([]);
  const [pendentes, setPendentes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuario?.id) return;

    getTccsByProfessor(usuario.id)
      .then(async (data) => {
        setTccs(data);

        // Contar submissões pendentes (ENVIADO ou EM_ANALISE) em todos os TCCs
        const counts = await Promise.all(
          data.map((tcc) =>
            getSubmissoesByTcc(tcc.id)
              .then((subs) =>
                subs.filter((s) => s.status === "ENVIADO" || s.status === "EM_ANALISE").length
              )
              .catch(() => 0)
          )
        );
        setPendentes(counts.reduce((a, b) => a + b, 0));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [usuario?.id]);

  const statusLabel = (status) => {
    const map = {
      EM_DESENVOLVIMENTO: "Em Andamento",
      EM_BANCA: "Em Banca",
      APROVADO: "Aprovado",
      REPROVADO: "Reprovado",
      ARQUIVADO: "Arquivado",
    };
    return map[status] || status;
  };

  const meusOrientandos = tccs.slice(0, 5).map((tcc) => ({
    aluno: tcc.alunoNome || "—",
    matricula: "",
    tema: tcc.titulo,
    status: statusLabel(tcc.status),
  }));

  const ativos = tccs.filter((t) => t.status === "EM_DESENVOLVIMENTO" || t.status === "EM_BANCA").length;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Olá, Prof. {usuario?.nome?.split(" ")[0]}!
          </h1>
          <p className="text-slate-500 mt-1">
            Aqui está o resumo das suas orientações e pendências atuais.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardStats
          titulo="Orientandos Ativos"
          valor={loading ? "..." : ativos}
          descricao="TCCs em andamento"
          icone={<Users size={24} />}
          corBg="bg-[#359830]/10"
          corTexto="text-[#359830]"
        />
        <CardStats
          titulo="Avaliações Pendentes"
          valor={loading ? "..." : pendentes}
          descricao="Submissões aguardando feedback"
          icone={<FileEdit size={24} />}
          corBg="bg-red-50"
          corTexto="text-red-600"
        />
        <CardStats
          titulo="Total de Orientandos"
          valor={loading ? "..." : tccs.length}
          descricao="Todos os semestres"
          icone={<Calendar size={24} />}
          corBg="bg-purple-50"
          corTexto="text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400">
              Carregando orientandos...
            </div>
          ) : (
            <TableTCC titulo="Meus Orientandos" dados={meusOrientandos} />
          )}

          {tccs.length > 5 && (
            <div className="mt-4 flex justify-center">
              <button className="text-sm font-medium text-[#359830] hover:text-[#1f5a1b] transition-colors flex items-center">
                Ver todos os orientandos{" "}
                <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <Bell size={20} className="mr-2 text-[#359830]" />
                Status dos TCCs
              </h3>
              <span className="bg-[#359830]/10 text-[#359830] text-xs font-bold px-2 py-1 rounded-full">
                {tccs.length}
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {tccs.length === 0 && !loading && (
                <div className="p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
                    <CheckCircle size={24} className="text-green-500" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    Nenhum TCC vinculado
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Você ainda não possui orientandos.
                  </p>
                </div>
              )}
              {tccs.slice(0, 5).map((tcc) => (
                <div key={tcc.id} className="p-5 hover:bg-slate-50 transition-colors group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {tcc.status === "EM_DESENVOLVIMENTO" || tcc.status === "EM_BANCA" ? (
                          <Clock size={16} className="text-yellow-500" />
                        ) : (
                          <CheckCircle size={16} className="text-green-500" />
                        )}
                        <p className="text-sm font-bold text-slate-800 line-clamp-1">
                          {tcc.titulo}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 ml-6">{tcc.alunoNome}</p>
                    </div>
                  </div>
                  <div className="mt-2 ml-6">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {statusLabel(tcc.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
