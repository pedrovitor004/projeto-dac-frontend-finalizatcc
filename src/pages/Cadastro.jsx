import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, ChevronDown, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import logoImg from "../assets/logo.png";
import successIcon from "../assets/sucess.png";
import warningIcon from "../assets/warning.png";
import errorIcon from "../assets/error.png";

export default function Cadastro() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    type: "",
    password: "",
    matricula: "",
    curso: "",
    periodo: "",
    areaAtuacao: "",
    titulacao: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const notify = (message, type = "success") => {
    const configs = {
      success: { icon: successIcon, color: "#166534", border: "#bbf7d0" },
      warning: { icon: warningIcon, color: "#854d0e", border: "#fef08a" },
      error: { icon: errorIcon, color: "#991b1b", border: "#fecaca" },
    };
    const { icon, color, border } = configs[type];

    toast.custom(
      (t) => (
        <div
          className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-md w-full bg-white shadow-2xl rounded-[20px] pointer-events-auto flex border-l-[6px] overflow-hidden`}
          style={{ borderColor: border }}
        >
          <div className="flex-1 p-4 flex items-center">
            <img className="h-10 w-10 object-contain" src={icon} alt={type} />
            <div className="ml-4">
              <p
                className="text-[14px] font-semibold font-poppins"
                style={{ color: color }}
              >
                {message}
              </p>
            </div>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="p-4 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors border-l border-gray-50"
          >
            <X size={18} />
          </button>
        </div>
      ),
      { duration: 4000 },
    );
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    // Validação básica
    if (
      !formData.name ||
      !formData.email ||
      !formData.type ||
      !formData.password
    ) {
      notify("Verifique todos os campos!", "warning");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8080/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        notify("Cadastro efetuado com sucesso!", "success");
        setTimeout(() => navigate("/"), 2200);
      } else {
        const errorData = await response.json();
        notify(errorData.message || "Erro ao realizar cadastro", "error");
      }
    } catch (error) {
      console.log(error);
      notify("Servidor offline ou erro de rede", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Classe padrão para manter o seu visual Figma
  const inputStyle =
    "w-full bg-white h-11 px-5 rounded-2xl border-none outline-none text-gray-700 input-inner-shadow focus:ring-2 focus:ring-white/40 focus:scale-[1.02] transition-all placeholder:text-gray-300 disabled:opacity-70";
  const labelStyle = "text-white text-[13px] font-light ml-2 opacity-90";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 font-poppins antialiased">
      <div className="animate-fade-in-up bg-ifpb-green w-full max-w-[450px] p-10 rounded-[50px] card-shadow flex flex-col items-center transform transition-all hover:scale-[1.01] duration-300">
        <div className="mb-8 drop-shadow-lg">
          <img src={logoImg} alt="Logo" className="w-28 h-auto" />
        </div>

        <form className="w-full space-y-4" onSubmit={handleRegister}>
          {/* Nome */}
          <div className="space-y-1">
            <label className={labelStyle}>Nome:</label>
            <input
              type="text"
              placeholder="Digite seu nome"
              disabled={isLoading}
              className={inputStyle}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          {/* Email e Tipo lado a lado para economizar espaço */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={labelStyle}>Email:</label>
              <input
                type="email"
                placeholder="seu@email.com"
                disabled={isLoading}
                className={inputStyle}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className={labelStyle}>Tipo:</label>
              <div className="relative group">
                <select
                  disabled={isLoading}
                  className={`${inputStyle} appearance-none cursor-pointer`}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  defaultValue=""
                >
                  <option value="" disabled>
                    Selecione
                  </option>
                  <option value="aluno">Aluno</option>
                  <option value="professor">Professor</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 size-5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* CAMPOS CONDICIONAIS - ALUNO (Estilo compacto) */}
          {formData.type === "aluno" && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-1">
                <label className={labelStyle}>Curso:</label>
                <input
                  type="text"
                  placeholder="Ex: Sistemas para Internet"
                  className={inputStyle}
                  onChange={(e) =>
                    setFormData({ ...formData, curso: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelStyle}>Matrícula:</label>
                  <input
                    type="text"
                    placeholder="2024..."
                    className={inputStyle}
                    onChange={(e) =>
                      setFormData({ ...formData, matricula: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelStyle}>Período:</label>
                  <input
                    type="number"
                    placeholder="1"
                    className={inputStyle}
                    onChange={(e) =>
                      setFormData({ ...formData, periodo: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* CAMPOS CONDICIONAIS - PROFESSOR */}
          {formData.type === "professor" && (
            <div className="grid grid-cols-2 gap-4 animate-fade-in">
              <div className="space-y-1">
                <label className={labelStyle}>Área:</label>
                <input
                  type="text"
                  placeholder="Ex: IA"
                  className={inputStyle}
                  onChange={(e) =>
                    setFormData({ ...formData, areaAtuacao: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className={labelStyle}>Titulação:</label>
                <div className="relative group">
                  <select
                    className={`${inputStyle} appearance-none cursor-pointer`}
                    onChange={(e) =>
                      setFormData({ ...formData, titulacao: e.target.value })
                    }
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Selecione
                    </option>
                    <option value="Especialista">Especialista</option>
                    <option value="Mestre">Mestre</option>
                    <option value="Doutor">Doutor</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 size-5 pointer-events-none" />
                </div>
              </div>
            </div>
          )}

          {/* Password */}
          <div className="space-y-1">
            <label className={labelStyle}>Password:</label>
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 9 dígitos"
                disabled={isLoading}
                className={inputStyle}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-ifpb-dark transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-figma text-white text-[15px] font-bold px-14 py-2.5 rounded-full min-w-[200px] flex items-center justify-center gap-2 hover:shadow-lg active:scale-95 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Cadastrando...</span>
                </>
              ) : (
                "Cadastrar"
              )}
            </button>
          </div>
        </form>
      </div>

      <p className="mt-8 text-[14px] font-medium text-ifpb-dark opacity-80">
        Já tem conta?{" "}
        <Link
          to="/"
          className="font-bold border-b-2 border-ifpb-dark hover:text-green-900 transition-colors"
        >
          Login!
        </Link>
      </p>
    </div>
  );
}
