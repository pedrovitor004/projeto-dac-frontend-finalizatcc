import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  BookOpenCheck,
  CalendarClock,
  FileCheck2,
  Loader2,
  Lock,
  LogIn,
  Mail,
} from "lucide-react";
import finalizaTccLogo from "../../assets/Group (1).png";
import { useAuth } from "../../contexts/AuthContext";

const inputClass =
  "h-11 w-full rounded-lg border border-white/35 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-white focus:ring-4 focus:ring-white/20 disabled:bg-white/80 disabled:text-slate-400";

const milestones = [
  { Icon: FileCheck2, label: "Submissoes" },
  { Icon: BookOpenCheck, label: "Orientacoes" },
  { Icon: CalendarClock, label: "Bancas" },
];

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
      toast.success(
        `Bem-vindo, ${userData.nome?.split(" ")?.[0] || "usuario"}!`,
      );
      handleRedirect(userData.tipo);
    } catch {
      toast.error("E-mail ou senha invalidos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-screen min-h-screen bg-[#f6f8f5] text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[1.02fr_0.98fr]">
        <section className="auth-hero-panel relative hidden overflow-hidden border-r border-slate-200 bg-[#f8faf7] px-10 py-8 lg:flex lg:flex-col">
          <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#d32f2f_0_15%,#359830_15%_58%,#2f855a_58%_100%)]" />
          <div className="flex items-center gap-4">
            <span className="flex h-20 w-20 items-center justify-center rounded-lg border border-[#359830]/20 bg-white shadow-sm">
              <img
                src={finalizaTccLogo}
                alt="Finaliza TCC"
                className="h-16 w-16 object-contain"
              />
            </span>
            <div>
              <p className="text-2xl font-bold leading-none text-[#23731f]">
                Finaliza TCC
              </p>
              <p className="mt-2 text-base font-medium text-[#2f8f2b]">
                Gestao academica de TCC
              </p>
            </div>
          </div>

          <div className="flex flex-1 items-center">
            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#2a7a26]">
                Sala de acompanhamento
              </p>
              <h1 className="mt-3 text-4xl font-bold leading-tight text-slate-950">
                Um lugar tranquilo para organizar cada etapa do TCC.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
                Alunos, professores e coordenadores acompanham prazos, arquivos,
                orientacoes e bancas em um fluxo unico.
              </p>

              <div className="mt-9 grid max-w-lg grid-cols-3 gap-3">
                {milestones.map(({ Icon, label }) => (
                  <div
                    key={label}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#359830]/35 hover:shadow-md"
                  >
                    {React.createElement(Icon, {
                      size: 20,
                      className: "text-[#359830]",
                    })}
                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
            Finaliza TCC aproxima o acompanhamento academico da rotina real de
            quem esta concluindo o curso.
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#359830]/20 bg-white shadow-sm">
                <img
                  src={finalizaTccLogo}
                  alt="Finaliza TCC"
                  className="h-8 w-8 object-contain"
                />
              </span>
              <div>
                <p className="text-lg font-bold text-slate-950">Finaliza TCC</p>
                <p className="text-sm text-slate-500">
                  Gestao academica de TCC
                </p>
              </div>
            </div>

            <div className="auth-card-enter auth-form-card rounded-lg border border-[#2f8f2b] bg-[#2f8f2b] p-6 text-white shadow-[0_30px_90px_rgb(31_102_28/0.28)] sm:p-8">
              <div className="mb-7">
                <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
                  Acesso ao sistema
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white">
                  Entre na sua conta
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/78">
                  Continue seu acompanhamento academico pelo painel do Finaliza
                  TCC.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-white/90">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2f8f2b]"
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
                  <label className="mb-1.5 block text-sm font-medium text-white/90">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2f8f2b]"
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
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-[#23731f] shadow-sm transition hover:bg-[#eef8ed] disabled:cursor-not-allowed disabled:opacity-70"
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

              <div className="mt-6 border-t border-white/20 pt-5 text-center text-sm">
                <span className="text-white/78">Ainda nao tem conta? </span>
                <Link
                  to="/register"
                  className="font-semibold text-white underline-offset-4 transition hover:underline"
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
