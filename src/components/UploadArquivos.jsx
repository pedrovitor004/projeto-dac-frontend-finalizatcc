import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  AlertCircle,
  CheckCircle,
  File as FileIcon,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";
import { createSubmissao, deleteSubmissao, uploadArquivoFile } from "../services/api";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

function isPdf(file) {
  return file?.type === "application/pdf" || file?.name?.toLowerCase().endsWith(".pdf");
}

export default function UploadArquivos({
  tcc,
  nextVersion = 1,
  disabled = false,
  onUploaded,
}) {
  const [arquivo, setArquivo] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const fileInputRef = useRef(null);

  const blocked = disabled || !tcc?.id || enviando;

  const selecionarArquivo = (file) => {
    if (!file) return;

    if (!isPdf(file)) {
      toast.error("Envie apenas arquivos PDF.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("O arquivo deve ter no maximo 50MB.");
      return;
    }

    setArquivo(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!blocked) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (blocked) return;
    selecionarArquivo(e.dataTransfer.files?.[0]);
  };

  const handleFileSelect = (e) => {
    selecionarArquivo(e.target.files?.[0]);
  };

  const removerArquivo = () => {
    setArquivo(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const registrarArquivo = async (submissao) => {
    if (!submissao?.id) return;

    await uploadArquivoFile(arquivo, submissao.id, "MANUSCRITO");
  };

  const confirmarEnvio = async () => {
    if (!arquivo || blocked) return;

    setEnviando(true);
    let submissaoCriada = null;

    try {
      const submissao = await createSubmissao({
        tccId: Number(tcc.id),
        versao: nextVersion,
        status: "ENVIADO",
        dataEnvio: new Date().toISOString(),
      });
      submissaoCriada = submissao;

      await registrarArquivo(submissao);

      toast.success("Submissao enviada com sucesso.");
      removerArquivo();
      await onUploaded?.();
    } catch (error) {
      if (submissaoCriada?.id) {
        try {
          await deleteSubmissao(submissaoCriada.id);
        } catch {
          // Mantem a mensagem principal do upload.
        }
      }
      toast.error(error?.message || "Nao foi possivel enviar a submissao.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="w-full bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800">Enviar Nova Versao</h3>
        <p className="text-sm text-slate-500 mt-1">
          Faca o upload do seu TCC em PDF. Tamanho maximo permitido: 50MB.
        </p>
      </div>

      {!tcc?.id && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>Cadastre seu TCC antes de enviar uma submissao.</span>
        </div>
      )}

      <div
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all duration-200 group ${
          blocked
            ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-70"
            : isDragging
              ? "cursor-pointer border-[#359830] bg-[#359830]/10"
              : "cursor-pointer border-slate-300 bg-slate-50 hover:bg-slate-100"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (!blocked) fileInputRef.current?.click();
        }}
      >
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform ${
            isDragging
              ? "bg-[#359830] text-white scale-110"
              : "bg-[#359830]/10 text-[#359830] group-hover:scale-110"
          }`}
        >
          <UploadCloud size={32} />
        </div>
        <p className="text-slate-700 font-medium text-lg text-center">
          {isDragging ? "Solte o arquivo aqui..." : "Clique ou arraste o arquivo ate aqui"}
        </p>
        <p className="text-slate-400 text-sm mt-2">
          Apenas arquivos PDF sao aceitos
        </p>

        <input
          type="file"
          className="hidden"
          accept=".pdf,application/pdf"
          ref={fileInputRef}
          onChange={handleFileSelect}
          disabled={blocked}
        />
      </div>

      {arquivo && (
        <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Arquivo selecionado
          </h4>

          <div className="flex items-center justify-between p-4 border border-[#359830]/20 rounded-lg bg-[#359830]/5 shadow-sm">
            <div className="flex items-center space-x-4 overflow-hidden">
              <div className="p-2 bg-[#359830] text-white rounded-lg shrink-0">
                <FileIcon size={24} />
              </div>
              <div className="truncate">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {arquivo.name}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center">
                  <CheckCircle size={12} className="text-green-500 mr-1" />
                  Versao {nextVersion} pronta para envio -{" "}
                  {(arquivo.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={removerArquivo}
              disabled={enviando}
              className="text-slate-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50 shrink-0 disabled:opacity-50"
              title="Remover arquivo"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          disabled={!arquivo || blocked}
          onClick={confirmarEnvio}
          className={`px-6 py-2.5 font-medium rounded-lg shadow-sm transition-all flex items-center ${
            arquivo && !blocked
              ? "bg-[#359830] hover:brightness-90 text-white focus:ring-4 focus:ring-[#359830]/30"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          {enviando ? (
            <Loader2 size={18} className="mr-2 animate-spin" />
          ) : (
            <UploadCloud size={18} className="mr-2" />
          )}
          {enviando ? "Enviando..." : "Confirmar Envio"}
        </button>
      </div>
    </div>
  );
}
