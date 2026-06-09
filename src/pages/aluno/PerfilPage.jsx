import React, { useEffect, useState } from "react";
import {
  Briefcase,
  Loader2,
  Lock,
  Mail,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import { getAluno, updateAluno } from "../../services/api";

export default function PerfilPage() {
  const { user: usuario, updateUser } = useAuth();
  const [aluno, setAluno] = useState(null);
  const [loading, setLoading] = useState(true);
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    curso: "",
    periodo: "",
  });

  const [senhas, setSenhas] = useState({
    atual: "",
    nova: "",
    confirmacao: "",
  });

  useEffect(() => {
    if (!usuario?.id) return;

    async function carregarPerfil() {
      try {
        setLoading(true);
        const dadosAluno = await getAluno(usuario.id);
        setAluno(dadosAluno);
        setForm({
          nome: dadosAluno?.nome || usuario?.nome || "",
          curso: dadosAluno?.curso || "",
          periodo: dadosAluno?.periodo ? String(dadosAluno.periodo) : "",
        });
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        toast.error("Nao foi possivel carregar os dados do perfil.");
      } finally {
        setLoading(false);
      }
    }

    carregarPerfil();
  }, [usuario?.id, usuario?.nome]);

  const iniciais = form.nome
    ? form.nome
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?";

  const inputClass =
    "block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#359830] focus:border-[#359830] sm:text-sm text-slate-900 outline-none transition-all disabled:bg-slate-100";
  const disabledClass =
    "block w-full pl-10 pr-3 py-2.5 border border-slate-200 bg-slate-50 rounded-lg sm:text-sm text-slate-500 cursor-not-allowed outline-none font-medium";
  const plainInputClass =
    "block w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#359830] focus:border-[#359830] sm:text-sm text-slate-900 outline-none transition-all disabled:bg-slate-100";

  const handlePerfilChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSenhaChange = (e) => {
    const { name, value } = e.target;
    setSenhas((prev) => ({ ...prev, [name]: value }));
  };

  const salvarPerfil = async (e) => {
    e.preventDefault();

    const periodo = Number(form.periodo);

    if (!form.nome.trim()) {
      toast.error("Informe seu nome completo.");
      return;
    }

    if (!Number.isFinite(periodo) || periodo <= 0) {
      toast.error("Informe um periodo valido.");
      return;
    }

    setSalvandoPerfil(true);

    try {
      const payload = {
        nome: form.nome.trim(),
        curso: form.curso.trim(),
        periodo,
      };

      const atualizado = await updateAluno(usuario.id, payload);
      const nextAluno = { ...aluno, ...payload, ...(atualizado || {}) };
      setAluno(nextAluno);
      setForm({
        nome: nextAluno.nome || payload.nome,
        curso: nextAluno.curso || payload.curso,
        periodo: nextAluno.periodo ? String(nextAluno.periodo) : String(periodo),
      });
      updateUser({ nome: nextAluno.nome || payload.nome });

      toast.success("Perfil atualizado com sucesso.");
    } catch (error) {
      toast.error(error?.message || "Nao foi possivel atualizar seu perfil.");
    } finally {
      setSalvandoPerfil(false);
    }
  };

  const salvarSenha = async (e) => {
    e.preventDefault();

    if (!senhas.atual || !senhas.nova) {
      toast.error("Preencha a senha atual e a nova senha.");
      return;
    }

    if (senhas.nova !== senhas.confirmacao) {
      toast.error("A nova senha e a confirmacao nao coincidem.");
      return;
    }

    setSalvandoSenha(true);

    setTimeout(() => {
      setSalvandoSenha(false);
      toast(
        "A alteracao de senha pelo painel do aluno sera habilitada apos a proxima manutencao programada.",
        { icon: "i" },
      );
      setSenhas({ atual: "", nova: "", confirmacao: "" });
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">Meu Perfil</h1>
        <p className="text-slate-500 mt-1">
          Gerencie suas informacoes e credenciais de acesso.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#359830]/20 to-[#359830]/5 border-4 border-white shadow-xl flex items-center justify-center text-[#359830] text-4xl font-black">
                {iniciais}
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-800 leading-tight">
              {form.nome || usuario?.nome}
            </h2>
            <p className="text-sm text-slate-400 mb-4">{usuario?.email}</p>
          </div>

          <div className="bg-[#359830]/5 border border-[#359830]/20 rounded-2xl p-6">
            <div className="flex items-center mb-3">
              <div className="p-2 bg-[#359830] rounded-lg text-white mr-3 shadow-sm shadow-green-200">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-bold text-slate-800">Verificacao</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Sua conta de <strong>{usuario?.tipo}</strong> esta verificada.
              Voce tem acesso para submeter arquivos e visualizar feedbacks.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">
                Informacoes Cadastrais
              </h3>
            </div>

            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center space-y-3">
                <Loader2 size={32} className="animate-spin text-[#359830]" />
                <p className="text-sm text-slate-400">Sincronizando dados...</p>
              </div>
            ) : (
              <form onSubmit={salvarPerfil} className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">
                      Nome Completo
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        name="nome"
                        value={form.nome}
                        onChange={handlePerfilChange}
                        disabled={salvandoPerfil}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">
                      E-mail Institucional
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        value={usuario?.email || ""}
                        disabled
                        className={disabledClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">
                      Matricula
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Briefcase size={18} />
                      </div>
                      <input
                        type="text"
                        value={aluno?.matricula || "Pendente"}
                        disabled
                        className={disabledClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">
                      Curso
                    </label>
                    <input
                      type="text"
                      name="curso"
                      value={form.curso}
                      onChange={handlePerfilChange}
                      disabled={salvandoPerfil}
                      className={plainInputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">
                      Periodo Atual
                    </label>
                    <input
                      type="number"
                      name="periodo"
                      min="1"
                      max="12"
                      value={form.periodo}
                      onChange={handlePerfilChange}
                      disabled={salvandoPerfil}
                      className={plainInputClass}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <div className="text-blue-500 mr-3 mt-0.5">
                      <Lock size={16} />
                    </div>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      E-mail e matricula ficam bloqueados para preservar o
                      vinculo academico.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={salvandoPerfil}
                    className="inline-flex items-center justify-center rounded-xl bg-[#359830] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-green-100 transition hover:brightness-95 disabled:opacity-50"
                  >
                    {salvandoPerfil ? (
                      <Loader2 size={18} className="mr-2 animate-spin" />
                    ) : (
                      <Save size={18} className="mr-2" />
                    )}
                    Salvar Perfil
                  </button>
                </div>
              </form>
            )}
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">
                Alterar Senha
              </h3>
            </div>

            <form onSubmit={salvarSenha} className="p-6 space-y-6">
              <div className="max-w-md">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">
                  Senha Atual
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    name="atual"
                    value={senhas.atual}
                    onChange={handleSenhaChange}
                    placeholder="Sua senha secreta"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">
                    Nova Senha
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock size={18} />
                    </div>
                    <input
                      type="password"
                      name="nova"
                      value={senhas.nova}
                      onChange={handleSenhaChange}
                      placeholder="Minimo 8 caracteres"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">
                    Confirmar Nova
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock size={18} />
                    </div>
                    <input
                      type="password"
                      name="confirmacao"
                      value={senhas.confirmacao}
                      onChange={handleSenhaChange}
                      placeholder="Repita a nova senha"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-50 flex justify-end">
                <button
                  type="submit"
                  disabled={salvandoSenha}
                  className="group flex items-center px-6 py-2.5 bg-[#359830] text-white font-bold rounded-xl hover:brightness-95 active:scale-95 transition-all shadow-md shadow-green-100 disabled:opacity-50"
                >
                  {salvandoSenha ? (
                    <Loader2 size={18} className="mr-2 animate-spin" />
                  ) : (
                    <Save
                      size={18}
                      className="mr-2 group-hover:rotate-12 transition-transform"
                    />
                  )}
                  Salvar Alteracoes
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
