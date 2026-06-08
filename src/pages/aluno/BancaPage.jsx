/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Award,
  CheckCircle,
  Info,
  Loader2,
  Star,
} from "lucide-react";
// Importação dos serviços centralizados
import { getUsuario, getTccsByAluno, getBancaByTcc } from "../../services/api";

export default function BancaPage() {
  const usuario = getUsuario();
  const usuarioId = usuario?.id;
  const [banca, setBanca] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!usuarioId) {
      setLoading(false);
      return;
    }

    async function carregarDadosBanca() {
      try {
        setLoading(true);
        setError(null);

        // 1. Busca os TCCs vinculados ao aluno logado
        const tccs = await getTccsByAluno(usuarioId);

        if (tccs && tccs.length > 0) {
          // 2. Busca a banca do primeiro TCC encontrado (fluxo padrão)
          // Se o seu backend retornar 404 quando não há banca, o catch tratará
          const b = await getBancaByTcc(tccs[0].id);
          setBanca(b);
        } else {
          // Aluno não tem TCC cadastrado, logo não tem banca
          setBanca(null);
        }
      } catch (e) {
        console.error("Erro ao carregar banca:", e);

        // Tratamento para caso o backend retorne erro de "não encontrado"
        if (
          e.message &&
          (e.message.includes("404") || e.message.includes("not found"))
        ) {
          setBanca(null);
        } else {
          setError(
            "Não foi possível carregar os dados da banca. Verifique sua conexão.",
          );
        }
      } finally {
        setLoading(false);
      }
    }

    carregarDadosBanca();
  }, [usuario?.id]); // Recarrega se o ID do usuário mudar

  // Estado de Carregamento
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-[#359830]">
        <Loader2 size={40} className="animate-spin" />
        <p className="text-slate-500 font-medium text-sm">
          Consultando cronograma de bancas...
        </p>
      </div>
    );
  }

  // Estado de Erro Crítico
  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6 bg-red-50 border border-red-200 text-red-600 rounded-xl text-center">
        <Info className="mx-auto mb-2" />
        <p className="font-bold">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  // Estado: Sem banca agendada
  if (!banca) {
    return (
      <div className="max-w-5xl mx-auto p-8 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl text-center">
        <Award size={48} className="mx-auto mb-4 text-slate-300" />
        <p className="font-bold text-lg text-slate-700">
          Nenhuma banca agendada
        </p>
        <p className="mt-1">
          Os detalhes da sua defesa aparecerão aqui assim que o coordenador ou
          orientador realizar o agendamento.
        </p>
      </div>
    );
  }

  // Formatação de Data e Hora vinda do Backend
  const dataObj = banca.dataDefesa
    ? new Date(banca.dataDefesa)
    : banca.data
      ? new Date(banca.data)
      : null;

  const dataFormatada = dataObj
    ? dataObj.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Data a definir";

  const horarioFormatado = dataObj
    ? dataObj.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--:--";

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Minha Banca de Defesa
        </h1>
        <p className="text-slate-500 mt-1">
          Confira o local, data e membros da sua banca avaliadora.
        </p>
      </div>

      {/* Banner de Status */}
      <div className="bg-gradient-to-r from-[#359830] to-[#266e22] rounded-xl shadow-lg text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 opacity-10 pointer-events-none">
          <Award size={200} />
        </div>

        <div className="relative z-10 flex-1 w-full">
          <div className="inline-flex items-center px-3 py-1 bg-white/20 text-white rounded-full text-xs font-semibold backdrop-blur-sm mb-4 border border-white/30">
            <CheckCircle size={14} className="mr-1.5" />
            {banca.notaFinal != null
              ? "Defesa Concluída"
              : "Apresentação Confirmada"}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            {banca.notaFinal != null
              ? "Resultado Disponível!"
              : "Prepare-se para a Defesa!"}
          </h2>
          <p className="text-white/90 max-w-xl">
            {banca.notaFinal != null
              ? "Sua defesa foi realizada. Confira abaixo a nota final atribuída pela banca avaliadora."
              : "Sua apresentação foi confirmada no sistema. Revise seus slides e chegue ao local com antecedência."}
          </p>
        </div>

        {/* Card de Agendamento */}
        <div className="relative z-10 bg-white text-slate-800 rounded-xl p-5 w-full md:w-auto md:min-w-[280px] shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-[#359830]/10 text-[#359830] flex items-center justify-center mr-3 shrink-0">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">
                  Data
                </p>
                <p className="font-semibold text-slate-800 capitalize">
                  {dataFormatada}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-[#359830]/10 text-[#359830] flex items-center justify-center mr-3 shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">
                  Horário
                </p>
                <p className="font-semibold text-slate-800">
                  {horarioFormatado}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Localização */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 flex items-center mb-4">
            <MapPin size={20} className="mr-2 text-slate-400" />
            Localização
          </h3>
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg">
            <p className="text-sm font-bold text-slate-800 mb-1">
              Sala / Link da Reunião
            </p>
            <p className="text-sm text-slate-600">
              {banca.local || banca.sala || "Informação ainda não disponível"}
            </p>
          </div>
          {/* Se houver membros da banca no objeto, você pode listar aqui futuramente */}
        </div>

        {/* Resultado / Nota */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 flex items-center mb-4">
            <Star size={20} className="mr-2 text-slate-400" />
            Resultado Final
          </h3>
          {banca.notaFinal != null ? (
            <div className="flex items-center justify-center h-24">
              <div className="text-center">
                <p className="text-5xl font-bold text-[#359830]">
                  {Number(banca.notaFinal).toFixed(1)}
                </p>
                <p className="text-sm text-slate-500 mt-1 font-medium">
                  Média Atribuída
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center p-4 bg-slate-50 border border-slate-100 rounded-lg text-slate-500 text-sm">
              <Info size={16} className="mr-2 text-slate-400 shrink-0" />A nota
              oficial será lançada no sistema após o encerramento da ata de
              defesa.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
