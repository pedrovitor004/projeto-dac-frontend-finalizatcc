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
  "h-10 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-[#359830] focus:ring-2 focus:ring-[#359830]/20 disabled:bg-slate-100";

function Field({ icon, label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <div className="relative">
        {React.createElement(icon, {
          size: 18,
          className:
            "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400",
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
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <section className="hidden bg-[#359830] px-12 py-8 text-white lg:flex lg:flex-col lg:justify-between">
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
              <UserPlus size={30} />
            </div>
            <p className="text-sm font-semibold uppercase tracking-wide text-white/70">
              Novo usuario
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight">
              Crie seu acesso e conecte-se ao fluxo de TCCs.
            </h1>
            <p className="mt-5 text-base leading-7 text-white/80">
              O perfil selecionado define os dados academicos necessarios para
              conectar orientacoes, TCCs, submissao e bancas.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-white/15 pt-6 text-sm text-white/80">
            <span>Alunos</span>
            <span>Professores</span>
            <span>Orientacoes</span>
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-6 sm:px-8">
          <div className="w-full max-w-xl">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#359830]/25 bg-white">
                <img
                  src={finalizaTccLogo}
                  alt="Finaliza TCC"
                  className="h-8 w-8 object-contain"
                />
              </div>
              <div>
                <p className="text-lg font-bold text-[#2a7a26]">
                  Finaliza TCC
                </p>
                <p className="text-sm text-slate-500">Gestao academica</p>
              </div>
            </div>

            <div className="mb-5 hidden items-center justify-between lg:flex">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2a7a26] hover:text-[#359830]"
              >
                <ArrowLeft size={16} />
                Voltar ao login
              </Link>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5">
                <p className="text-sm font-semibold uppercase tracking-wide text-[#359830]">
                  Criar conta
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  Informe seus dados
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Selecione o vinculo e preencha os campos obrigatorios.
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

                  <Field icon={Mail} label="E-mail institucional">
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
                  <span className="mb-2 block text-sm font-medium text-slate-700">
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
                              ? "border-[#359830] bg-[#359830] text-white"
                              : "border-slate-300 bg-white text-slate-600 hover:border-[#359830] hover:text-[#2a7a26]"
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
                        className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-[#359830] focus:ring-2 focus:ring-[#359830]/20 disabled:bg-slate-100"
                        disabled={loading}
                      >
                        <option value="">Selecione</option>
                        <option value="Especialista">Especialista</option>
                        <option value="Mestre">Mestre</option>
                        <option value="Doutor">Doutor</option>
                      </select>
                    </Field>

                    <label className="sm:col-span-2 flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                      <input
                        name="coordenador"
                        type="checkbox"
                        checked={formData.coordenador}
                        onChange={handleChange}
                        disabled={loading}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-[#359830] focus:ring-[#359830]"
                      />
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                          <ShieldCheck size={16} className="text-[#359830]" />
                          Professor coordenador
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-slate-500">
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
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#359830] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2a7a26] disabled:cursor-not-allowed disabled:opacity-60"
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

              <div className="mt-5 border-t border-slate-100 pt-4 text-center text-sm">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 font-semibold text-[#2a7a26] hover:text-[#359830]"
                >
                  <ArrowLeft size={16} />
                  Ja possui uma conta? Faca login
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
