import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { BookOpenCheck, Loader2, Lock, LogIn, Mail } from "lucide-react";
import finalizaTccLogo from "../../assets/Group (1).png";
import { useAuth } from "../../contexts/AuthContext";

const inputClass =
  "h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-[#359830] focus:ring-2 focus:ring-[#359830]/20 disabled:bg-slate-100 disabled:text-slate-400";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRedirect = (tipo) => {
    const role = String(tipo || "").toUpperCase();
    if (role === "ALUNO") navigate("/aluno/dashboard");
    else if (role === "PROFESSOR") navigate("/professor/dashboard");
    else navigate("/coordenador/dashboard");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const userData = await login(email, senha);
      toast.success(`Bem-vindo, ${userData.nome?.split(" ")?.[0] || "usuario"}!`);
      handleRedirect(userData.tipo);
    } catch {
      toast.error("E-mail ou senha invalidos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <section className="hidden bg-[#359830] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white">
              <img
                src={finalizaTccLogo}
                alt="Finaliza TCC"
                className="h-8 w-8 object-contain"
              />
            </div>
            <div>
              <p className="text-lg font-bold leading-none">Finaliza TCC</p>
              <p className="mt-1 text-sm text-white/75">Gestao academica</p>
            </div>
          </div>

          <div className="max-w-xl">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-white/12">
              <BookOpenCheck size={30} />
            </div>
            <h1 className="text-4xl font-bold leading-tight">
              Controle o ciclo de TCCs com clareza, prazo e rastreabilidade.
            </h1>
            <p className="mt-5 text-base leading-7 text-white/80">
              Uma area unica para submissao de arquivos, acompanhamento de
              orientacoes, feedbacks e bancas do IFPB.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-white/15 pt-6 text-sm text-white/80">
            <span>Submissoes</span>
            <span>Feedbacks</span>
            <span>Bancas</span>
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#359830]/25 bg-white">
                <img
                  src={finalizaTccLogo}
                  alt="Finaliza TCC"
                  className="h-8 w-8 object-contain"
                />
              </div>
              <div>
                <p className="text-lg font-bold text-[#2a7a26]">Finaliza TCC</p>
                <p className="text-sm text-slate-500">Gestao academica</p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-7">
                <p className="text-sm font-semibold uppercase tracking-wide text-[#359830]">
                  Acesso ao sistema
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  Entre na sua conta
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Use suas credenciais para acessar o painel do Finaliza TCC.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    E-mail institucional
                  </label>
                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="email"
                      required
                      disabled={loading}
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="exemplo@ifpb.edu.br"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="password"
                      required
                      disabled={loading}
                      value={senha}
                      onChange={(event) => setSenha(event.target.value)}
                      placeholder="Digite sua senha"
                      className={inputClass}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email || !senha}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#359830] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2a7a26] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    <>
                      <LogIn size={18} />
                      Entrar
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 border-t border-slate-100 pt-5 text-center text-sm">
                <span className="text-slate-500">Nao tem conta? </span>
                <Link
                  to="/register"
                  className="font-semibold text-[#2a7a26] hover:text-[#359830]"
                >
                  Cadastre-se
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
