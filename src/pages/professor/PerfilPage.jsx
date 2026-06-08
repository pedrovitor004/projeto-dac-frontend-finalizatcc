import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  BookOpen,
  Award,
  Lock,
  Save,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { getUsuario, getProfessor, updateProfessor } from "../../services/api.js";

export default function PerfilPage() {
  const usuario = getUsuario();
  const { updateUser } = useAuth();

  const [perfil, setPerfil] = useState({
    nome: "",
    email: "",
    areaAtuacao: "",
    titulacao: "",
  });
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!usuario?.id) return;

    getProfessor(usuario.id)
      .then((data) => {
        setPerfil({
          nome: data.nome || "",
          email: data.email || "",
          areaAtuacao: data.areaAtuacao || "",
          titulacao: data.titulacao || "",
        });
      })
      .catch(() => toast.error("Erro ao carregar perfil."))
      .finally(() => setLoading(false));
  }, [usuario?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPerfil((prev) => ({ ...prev, [name]: value }));
  };

  const salvarPerfil = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      const atualizado = await updateProfessor(usuario.id, {
        nome: perfil.nome,
        areaAtuacao: perfil.areaAtuacao,
        titulacao: perfil.titulacao,
      });
      const nextNome = atualizado?.nome || perfil.nome;
      setPerfil((prev) => ({ ...prev, nome: nextNome }));
      updateUser({ nome: nextNome });
      toast.success("Perfil atualizado com sucesso!");
    } catch {
      toast.error("Erro ao salvar perfil.");
    } finally {
      setSalvando(false);
    }
  };

  const iniciais = perfil.nome
    ? perfil.nome
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "P";

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-8 text-center text-slate-400">
        Carregando perfil...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Meu Perfil</h1>
        <p className="text-slate-500 mt-1">
          Gerencie suas informações profissionais e configurações da conta.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-28 h-28 rounded-full bg-[#359830]/10 border-4 border-white shadow-md flex items-center justify-center text-[#359830] text-3xl font-bold overflow-hidden">
                {iniciais}
              </div>
            </div>

            <h2 className="text-lg font-bold text-slate-800">{perfil.nome}</h2>
            <p className="text-sm text-slate-500 mb-4">{perfil.email}</p>

            <span className="inline-flex items-center px-3 py-1 bg-[#359830]/10 text-[#2a7725] text-xs font-semibold rounded-full border border-[#359830]/20 uppercase tracking-wide">
              PROFESSOR
            </span>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <div className="flex items-center mb-2">
              <ShieldCheck size={20} className="text-green-600 mr-2" />
              <h3 className="font-bold text-green-800">Conta Ativa</h3>
            </div>
            <p className="text-sm text-green-700">
              Sua conta está regular e você possui acesso total ao sistema.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">
                Dados Profissionais
              </h3>
            </div>

            <form onSubmit={salvarPerfil} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nome Completo
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={18} className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="nome"
                      value={perfil.nome}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#359830] focus:border-[#359830] sm:text-sm text-slate-900 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    E-mail Institucional
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={18} className="text-slate-400" />
                    </div>
                    <input
                      type="email"
                      value={perfil.email}
                      disabled
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 bg-slate-50 rounded-lg sm:text-sm text-slate-500 cursor-not-allowed outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Área de Atuação
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BookOpen size={18} className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="areaAtuacao"
                      value={perfil.areaAtuacao}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#359830] focus:border-[#359830] sm:text-sm text-slate-900 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Titulação
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Award size={18} className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="titulacao"
                      value={perfil.titulacao}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#359830] focus:border-[#359830] sm:text-sm text-slate-900 outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={salvando}
                  className="flex items-center px-5 py-2.5 bg-[#359830] text-white font-medium rounded-lg hover:bg-[#2a7725] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#359830] disabled:opacity-50"
                >
                  <Save size={18} className="mr-2" />
                  {salvando ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">
                Segurança da Conta
              </h3>
            </div>
            <div className="p-6">
              <div className="flex items-center space-x-3 text-sm text-slate-500">
                <Lock size={18} className="text-slate-400" />
                <span>
                  Para alterar sua senha, entre em contato com o coordenador ou
                  utilize a opção de recuperação de senha no login.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
