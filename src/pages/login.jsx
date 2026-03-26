import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, X } from "lucide-react";
import toast from "react-hot-toast";
import logoImg from "../assets/logo.png";
import successIcon from "../assets/sucess.png";
import warningIcon from "../assets/warning.png";
import errorIcon from "../assets/error.png";

export default function Login() {
  const [email, setEmail] = useState(""); // Alterado de 'user' para 'email' para clareza
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Feedback de carregamento
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
          <div className="flex-1 p-4">
            <div className="flex items-center">
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
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="p-4 flex items-center justify-center text-gray-400 hover:text-gray-600 border-l border-gray-50"
          >
            <X size={18} />
          </button>
        </div>
      ),
      { duration: 3000 },
    );
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      notify("Digite um email e senha!", "warning");
      return;
    }

    setIsLoading(true);

    try {
      // IMPORTANTE: Substitua pela sua URL do Spring Boot
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Armazena o JWT real retornado pelo Spring Security
        localStorage.setItem("token", data.token);

        // Se o seu backend retornar o nome ou tipo do usuário, salve também
        if (data.name) localStorage.setItem("userName", data.name);

        notify("Login efetuado com sucesso!", "success");
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        // Trata erros de credenciais (401/403) enviados pelo Spring
        notify(data.message || "Email ou senha inválidos!", "error");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      notify("Erro ao conectar com o servidor", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 font-poppins antialiased">
      <div className="bg-ifpb-green w-full max-w-[400px] p-12 rounded-[50px] card-shadow flex flex-col items-center transform transition-all">
        <div className="mb-10 drop-shadow-lg">
          <img src={logoImg} alt="Logo" className="w-32 h-auto" />
        </div>

        <form className="w-full space-y-6" onSubmit={handleLogin}>
          <div className="space-y-1">
            <label className="text-white text-[13px] font-light ml-2 opacity-90">
              Email:
            </label>
            <input
              type="email"
              value={email}
              placeholder="seuemail@ifpb.edu.br"
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full bg-white h-11 px-5 rounded-2xl border-none outline-none text-gray-700 
                         input-inner-shadow focus:ring-2 focus:ring-white/30 transition-all placeholder:text-gray-300 disabled:opacity-70"
            />
          </div>

          <div className="space-y-1">
            <label className="text-white text-[13px] font-light ml-2 opacity-90">
              Password:
            </label>
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="Sua senha"
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full bg-white h-11 px-5 pr-12 rounded-2xl border-none outline-none text-gray-700 
                           input-inner-shadow focus:ring-2 focus:ring-white/30 transition-all placeholder:text-gray-300 disabled:opacity-70"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-ifpb-dark transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Onde estava o parágrafo de recuperar senha */}
          <div className="text-center pt-1">
            <Link to="/recuperar-senha" data-tooltip-id="recover-hint">
              <p className="text-white text-[12px] font-light opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
                Esqueceu sua senha?{" "}
                <span className="font-semibold underline">Recupere aqui</span>
              </p>
            </Link>
          </div>

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-figma w-full max-w-[200px] h-11 text-white text-[15px] font-bold rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </button>
          </div>
        </form>
      </div>

      <p className="mt-10 text-[14px] font-medium text-ifpb-dark opacity-80">
        Não tem conta?{" "}
        <Link
          to="/cadastro"
          className="font-bold border-b-2 border-ifpb-dark hover:text-green-800 transition-colors"
        >
          Cadastre-se!
        </Link>
      </p>
    </div>
  );
}
