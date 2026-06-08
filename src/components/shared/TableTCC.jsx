import React from "react";
import { FileSearch } from "lucide-react";

export default function TableTCCs({
  dados = [],
  titulo = "Trabalhos em Andamento",
}) {
  const brandGreen = "#359830";

  const getStatusBadge = (status) => {
    const statusMap = {
      "Em Andamento": "bg-[#359830]/10 text-[#359830] border-[#359830]/20",
      "Aguardando Avaliacao": "bg-yellow-100 text-yellow-700 border-yellow-200",
      Aprovado: "bg-green-100 text-green-700 border-green-200",
      Reprovado: "bg-red-100 text-red-700 border-red-200",
    };

    const cores =
      statusMap[status] || "bg-slate-100 text-slate-700 border-slate-200";

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border ${cores}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">{titulo}</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-white text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
              <th className="px-6 py-4 font-semibold">Aluno</th>
              <th className="px-6 py-4 font-semibold">Tema do TCC</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Acoes</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {dados.length > 0 ? (
              dados.map((tcc, index) => (
                <tr
                  key={`${tcc.aluno}-${tcc.tema}-${index}`}
                  className="hover:bg-slate-50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-800">{tcc.aluno}</p>
                    {tcc.matricula && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        Mat: {tcc.matricula}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p
                      className="text-slate-800 text-sm line-clamp-2"
                      title={tcc.tema}
                    >
                      {tcc.tema}
                    </p>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(tcc.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-all hover:brightness-75"
                      style={{ color: brandGreen }}
                    >
                      Detalhes
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-12 text-center text-slate-500"
                >
                  <div className="flex flex-col items-center justify-center">
                    <FileSearch size={40} className="text-slate-300 mb-3" />
                    <p className="text-base font-medium text-slate-600">
                      Nenhum TCC encontrado
                    </p>
                    <p className="text-sm mt-1">
                      Os trabalhos aparecerao aqui quando forem cadastrados.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
