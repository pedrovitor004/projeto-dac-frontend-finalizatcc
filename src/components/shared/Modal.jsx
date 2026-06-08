import React from "react";
import { X } from "lucide-react";

export default function Modal({
  isOpen,
  onClose,
  titulo,
  children,
  maxWidth = "max-w-lg",
}) {
  // Se o modal não estiver aberto, não renderiza nada na tela
  if (!isOpen) return null;

  return (
    // Overlay (Fundo escuro)
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      {/* Área invisível clicável para fechar o modal ao clicar fora */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={onClose}
        aria-label="Fechar modal"
      ></div>

      {/* Caixa do Modal - Adicionado border-t-4 com o verde da marca */}
      <div
        className={`relative w-full ${maxWidth} bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh] transform transition-all scale-100 opacity-100 border-t-4 border-[#359830]`}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80 rounded-t-lg">
          <h3 className="text-lg font-bold text-slate-800">{titulo}</h3>

          {/* Botão de Fechar - Atualizado para tons de verde no hover e focus */}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-[#359830] hover:bg-[#359830]/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#359830]/30"
            title="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Corpo do Modal (com barra de rolagem automática se o conteúdo for muito grande) */}
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
