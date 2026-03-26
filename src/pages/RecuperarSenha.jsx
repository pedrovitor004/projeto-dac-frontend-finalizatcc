import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import logoImg from "../assets/logo.png";
import successIcon from "../assets/sucess.png";
import warningIcon from "../assets/warning.png";
import errorIcon from "../assets/error.png";

export default function RecuperarSenha() {
  const [email, setEmail] = useState("");
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
      { duration: 4000 },
    );
  };

  const handleRecover = async (e) => {
    e.preventDefault();
    if (!email) {
      notify("Digite um email válido!", "warning");
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/auth/recover-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );

      if (response.ok) {
        notify("Email enviado com sucesso!", "success");
        setTimeout(() => navigate("/"), 3000);
      } else {
        const errorData = await response.json();
        notify(errorData.message || "Email não encontrado", "error");
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
      {/* TEXTO FORA DO CARD - Verde Escuro (ifpb-dark) */}
      <div className="text-center mb-8">
        <p className="text-ifpb-dark text-[14px] font-medium leading-tight">
          Para recuperar a senha precisamos <br />
          que digite o <span className="font-bold">seu email abaixo!</span>
        </p>
      </div>

      {/* CARD PRINCIPAL */}
      <div className="bg-ifpb-green w-full max-w-[400px] p-12 rounded-[50px] card-shadow flex flex-col items-center">
        <div className="mb-10 drop-shadow-lg">
          <img src={logoImg} alt="Logo" className="w-32 h-auto" />
        </div>

        <form className="w-full space-y-8" onSubmit={handleRecover}>
          <div className="space-y-1">
            <label className="text-white text-[13px] font-light ml-2 opacity-90">
              Email:
            </label>
            <input
              type="email"
              value={email}
              placeholder="Digite seu email"
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full bg-white h-11 px-5 rounded-2xl border-none outline-none text-gray-700 
                         input-inner-shadow focus:ring-2 focus:ring-white/30 transition-all placeholder:text-gray-300 disabled:opacity-70"
            />
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-figma w-full max-w-[180px] h-11 text-white text-[15px] font-bold rounded-full disabled:opacity-50"
            >
              {isLoading ? "Enviando..." : "Enviar"}
            </button>
          </div>
        </form>
      </div>

      <p className="mt-10 text-[14px] font-medium text-ifpb-dark opacity-80">
        Já tem conta?{" "}
        <Link
          to="/"
          className="font-bold border-b-2 border-ifpb-dark hover:text-green-800 transition-colors"
        >
          Login!
        </Link>
      </p>
    </div>
  );
}
