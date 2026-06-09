import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  BookOpen,
  Briefcase,
  GraduationCap,
  IdCard,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  User,
  UserPlus,
} from "lucide-react";
import finalizaTccLogo from "../../assets/Group (1).png";
import { ApiError, registerAluno, registerProfessor } from "../../services/api";

const initialForm = {
  nome: "",
  email: "",
  senha: "",
  confirmarSenha: "",
  tipo: "ALUNO",
  matricula: "",
  curso: "",
  periodo: "",
  areaAtuacao: "",
  titulacao: "",
  coordenador: false,
};

const inputClass =
  "h-10 w-full rounded-lg border border-white/35 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-white focus:ring-4 focus:ring-white/20 disabled:bg-white/80";

function Field({ icon, label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-white/90">
        {label}
      </span>
      <div className="relative">
        {React.createElement(icon, {
          size: 18,
          className: "absolute left-3 top-1/2 -translate-y-1/2 text-[#2f8f2b]",
        })}
        {children}
      </div>
    </label>
  );
}

export default function RegisterPage() {
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isAluno = formData.tipo === "ALUNO";

  const handleChange = (event) => {
    const { checked, name, type, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validate = () => {
    if (formData.senha !== formData.confirmarSenha) {
      toast.error("As senhas nao coincidem.");
      return false;
    }

    if (formData.senha.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return false;
    }

    if (isAluno) {
      const periodo = Number(formData.periodo);
      if (!Number.isFinite(periodo) || periodo <= 0) {
        toast.error("Informe um periodo valido.");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      if (isAluno) {
        await registerAluno({
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha,
          matricula: formData.matricula,
          curso: formData.curso,
          periodo: Number(formData.periodo),
        });
      } else {
        await registerProfessor({
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha,
          areaAtuacao: formData.areaAtuacao,
          titulacao: formData.titulacao,
          coordenador: formData.coordenador,
          tipo: formData.coordenador ? "COORDENADOR" : "PROFESSOR",
        });
      }

      toast.success("Cadastro realizado com sucesso.");
      navigate("/login");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error?.message || "Nao foi possivel criar sua conta.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-screen min-h-screen bg-[#f6f8f5] text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
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
            <div className="max-w-lg">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#2a7a26]">
                Primeiro acesso
              </p>
              <h1 className="mt-3 text-4xl font-bold leading-tight text-slate-950">
                Cadastro pensado para a rotina de TCC do IFPB.
              </h1>
              <p className="mt-5 text-base leading-7 text-slate-600">
                O vinculo academico organiza as informacoes certas para cada
                perfil: estudante, professor orientador ou coordenacao.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            {[
              { label: "Aluno", icon: GraduationCap },
              { label: "Professor", icon: Briefcase },
              { label: "Coordenação", icon: ShieldCheck },
            ].map(({ label, icon }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#359830]/35 hover:shadow-md"
              >
                {React.createElement(icon, {
                  size: 17,
                  className: "shrink-0 text-[#2f8f2b]",
                })}
                <span className="truncate">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-6 sm:px-8">
          <div className="w-full max-w-2xl">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3 lg:hidden">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#359830]/20 bg-white shadow-sm">
                  <img
                    src={finalizaTccLogo}
                    alt="Finaliza TCC"
                    className="h-8 w-8 object-contain"
                  />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-lg font-bold text-slate-950">
                    Finaliza TCC
                  </p>
                  <p className="truncate text-sm text-slate-500">
                    Gestao academica de TCC
                  </p>
                </div>
              </div>

              <Link
                to="/login"
                className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-[#359830]/40 hover:text-[#23731f]"
              >
                <ArrowLeft size={16} />
                Login
              </Link>
            </div>

            <div className="auth-card-enter auth-form-card rounded-lg border border-[#2f8f2b] bg-[#2f8f2b] p-5 text-white shadow-[0_30px_90px_rgb(31_102_28/0.28)] sm:p-6">
              <div className="mb-5">
                <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
                  Criar conta
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white">
                  Informe seus dados
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/78">
                  Selecione seu vinculo para abrir os campos correspondentes.
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field icon={User} label="Nome completo">
                    <input
                      name="nome"
                      type="text"
                      required
                      value={formData.nome}
                      onChange={handleChange}
                      placeholder="Seu nome completo"
                      className={inputClass}
                      disabled={loading}
                    />
                  </Field>

                  <Field icon={Mail} label="E-mail de acesso">
                    <input
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="exemplo@ifpb.edu.br"
                      className={inputClass}
                      disabled={loading}
                    />
                  </Field>
                </div>

                <div>
                  <span className="mb-2 block text-sm font-medium text-white/90">
                    Tipo de vinculo
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "ALUNO", label: "Aluno", icon: GraduationCap },
                      {
                        value: "PROFESSOR",
                        label: "Professor",
                        icon: Briefcase,
                      },
                    ].map(({ value, label, icon }) => {
                      const active = formData.tipo === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          disabled={loading}
                          onClick={() =>
                            setFormData((current) => ({
                              ...current,
                              tipo: value,
                              coordenador:
                                value === "PROFESSOR"
                                  ? current.coordenador
                                  : false,
                            }))
                          }
                          className={`flex h-11 items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition ${
                            active
                              ? "border-white bg-white text-[#1f661c] shadow-sm"
                              : "border-white/35 bg-white/10 text-white hover:bg-white/18"
                          }`}
                        >
                          {React.createElement(icon, { size: 17 })}
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {isAluno ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field icon={IdCard} label="Matricula">
                      <input
                        name="matricula"
                        type="text"
                        required
                        value={formData.matricula}
                        onChange={handleChange}
                        placeholder="123456789"
                        className={inputClass}
                        disabled={loading}
                      />
                    </Field>

                    <Field icon={GraduationCap} label="Periodo">
                      <input
                        name="periodo"
                        type="number"
                        required
                        min="1"
                        max="12"
                        value={formData.periodo}
                        onChange={handleChange}
                        placeholder="5"
                        className={inputClass}
                        disabled={loading}
                      />
                    </Field>

                    <div className="sm:col-span-2">
                      <Field icon={BookOpen} label="Curso">
                        <input
                          name="curso"
                          type="text"
                          required
                          value={formData.curso}
                          onChange={handleChange}
                          placeholder="Ex: Sistemas de Informacao"
                          className={inputClass}
                          disabled={loading}
                        />
                      </Field>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field icon={Briefcase} label="Area de atuacao">
                      <input
                        name="areaAtuacao"
                        type="text"
                        required
                        value={formData.areaAtuacao}
                        onChange={handleChange}
                        placeholder="Engenharia de Software"
                        className={inputClass}
                        disabled={loading}
                      />
                    </Field>

                    <Field icon={GraduationCap} label="Titulacao">
                      <select
                        name="titulacao"
                        required
                        value={formData.titulacao}
                        onChange={handleChange}
                        className="h-10 w-full rounded-lg border border-white/35 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-white focus:ring-4 focus:ring-white/20 disabled:bg-white/80"
                        disabled={loading}
                      >
                        <option value="">Selecione</option>
                        <option value="Especialista">Especialista</option>
                        <option value="Mestre">Mestre</option>
                        <option value="Doutor">Doutor</option>
                      </select>
                    </Field>

                    <label className="flex items-start gap-3 rounded-lg border border-white/25 bg-white/10 px-4 py-3 sm:col-span-2">
                      <input
                        name="coordenador"
                        type="checkbox"
                        checked={formData.coordenador}
                        onChange={handleChange}
                        disabled={loading}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-[#359830] focus:ring-[#359830]"
                      />
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 text-sm font-semibold text-white">
                          <ShieldCheck size={16} className="text-white" />
                          Professor coordenador
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-white/72">
                          Marque esta opcao para criar a conta com acesso de
                          coordenador.
                        </span>
                      </span>
                    </label>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field icon={Lock} label="Senha">
                    <input
                      name="senha"
                      type="password"
                      required
                      value={formData.senha}
                      onChange={handleChange}
                      placeholder="Minimo 6 caracteres"
                      className={inputClass}
                      disabled={loading}
                    />
                  </Field>

                  <Field icon={Lock} label="Confirmar senha">
                    <input
                      name="confirmarSenha"
                      type="password"
                      required
                      value={formData.confirmarSenha}
                      onChange={handleChange}
                      placeholder="Repita sua senha"
                      className={inputClass}
                      disabled={loading}
                    />
                  </Field>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-[#23731f] shadow-sm transition hover:bg-[#eef8ed] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Cadastrando...
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      Finalizar cadastro
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
