import React from "react";

export default function CardStats({
  titulo,
  valor,
  icone,
  // Trocamos o azul por um verde bem claro de fundo e o verde oficial para o ícone
  corBg = "bg-[#359830]/10",
  corTexto = "text-[#359830]",
  descricao = "",
}) {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center justify-between group">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{titulo}</p>
        <div className="flex items-baseline space-x-2">
          <p className="text-3xl font-bold text-slate-800">{valor}</p>

          {/* Renderiza a descrição extra apenas se ela for passada por prop */}
          {descricao && (
            <span className="text-xs font-medium text-slate-400">
              {descricao}
            </span>
          )}
        </div>
      </div>

      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${corBg} ${corTexto}`}
      >
        {/* O ícone herdará a cor de corTexto */}
        {icone}
      </div>
    </div>
  );
}
