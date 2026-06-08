import fetchClient, { ApiError, apiClient } from "./httpClient";
import { API_BASE_URL } from "../config/api";
import { getStoredUser } from "../lib/session";

export { ApiError };

// Usuarios e autenticacao
export const login = (email, senha) =>
  fetchClient("/auth/login", { method: "POST", body: { email, senha } });

export const getUsuario = () => getStoredUser();

export const registerUsuario = (data) =>
  fetchClient("/auth/register", { method: "POST", body: data });

export const updateUsuario = (id, data) =>
  fetchClient(`/usuarios/${id}`, { method: "PUT", body: data });

// Alunos
export const getAluno = (id) => fetchClient(`/alunos/${id}`);
export const createAluno = (data) =>
  fetchClient("/alunos/create", { method: "POST", body: data });
export const registerAluno = createAluno;
export const getAllAlunos = () => fetchClient("/alunos");
export const updateAluno = (id, data) =>
  fetchClient(`/alunos/${id}`, { method: "PUT", body: data });
export const deleteAluno = (id) =>
  fetchClient(`/alunos/${id}`, { method: "DELETE" });

// Professores
export const getProfessor = (id) => fetchClient(`/professores/${id}`);
export const getAllProfessores = () => fetchClient("/professores");
export const createProfessor = (data) =>
  fetchClient("/professores/create", { method: "POST", body: data });
export const registerProfessor = createProfessor;
export const updateProfessor = (id, data) =>
  fetchClient(`/professores/${id}`, { method: "PUT", body: data });
export const deleteProfessor = (id) =>
  fetchClient(`/professores/${id}`, { method: "DELETE" });

// TCCs
export const getAllTccs = () => fetchClient("/tccs");
export const getTcc = (id) => fetchClient(`/tccs/${id}`);
export const createTcc = (data) =>
  fetchClient("/tccs/create", { method: "POST", body: data });
export const getTccsByAluno = (alunoId) =>
  fetchClient(`/tccs/aluno/${alunoId}`);
export const getTccsByProfessor = (professorId) =>
  fetchClient(`/tccs/professor/${professorId}`);
export const updateTcc = (id, data) =>
  fetchClient(`/tccs/${id}`, { method: "PUT", body: data });
export const deleteTcc = (id) =>
  fetchClient(`/tccs/${id}`, { method: "DELETE" });

// Submissoes
export const getSubmissoesByTcc = (tccId) =>
  fetchClient(`/submissoes/tcc/${tccId}`);
export const createSubmissao = (data) =>
  fetchClient("/submissoes/create", { method: "POST", body: data });
export const updateSubmissao = (id, data) =>
  fetchClient(`/submissoes/${id}`, { method: "PUT", body: data });
export const deleteSubmissao = (id) =>
  fetchClient(`/submissoes/${id}`, { method: "DELETE" });

// Bancas
export const getAllBancas = () => fetchClient("/bancas");
export const createBanca = (data) =>
  fetchClient("/bancas/create", { method: "POST", body: data });
export const getBancaByTcc = (tccId) => fetchClient(`/bancas/tcc/${tccId}`);
export const updateBanca = (id, data) =>
  fetchClient(`/bancas/${id}`, { method: "PUT", body: data });
export const deleteBanca = (id) =>
  fetchClient(`/bancas/${id}`, { method: "DELETE" });

// Feedbacks e avaliacoes
export const getFeedbacksBySubmissao = (id) =>
  fetchClient(`/feedbacks/submissao/${id}`);
export const getFeedbacksByTcc = (tccId) =>
  fetchClient(`/feedbacks/tcc/${tccId}`);
export const createFeedback = (data) =>
  fetchClient("/feedbacks/create", { method: "POST", body: data });
export const updateFeedback = (id, data) =>
  fetchClient(`/feedbacks/${id}`, { method: "PUT", body: data });
export const deleteFeedback = (id) =>
  fetchClient(`/feedbacks/${id}`, { method: "DELETE" });
export const getAllAvaliacoes = () => fetchClient("/avaliacoes");
export const createAvaliacao = (data) =>
  fetchClient("/avaliacoes/create", { method: "POST", body: data });
export const updateAvaliacao = (id, data) =>
  fetchClient(`/avaliacoes/${id}`, { method: "PUT", body: data });
export const deleteAvaliacao = (id) =>
  fetchClient(`/avaliacoes/${id}`, { method: "DELETE" });

// Areas de pesquisa
export const getArea = (id) => fetchClient(`/areas-pesquisa/${id}`);
export const getAllAreas = () => fetchClient("/areas-pesquisa");
export const createArea = (data) =>
  fetchClient("/areas-pesquisa/create", { method: "POST", body: data });
export const updateArea = (id, data) =>
  fetchClient(`/areas-pesquisa/${id}`, { method: "PUT", body: data });
export const deleteArea = (id) =>
  fetchClient(`/areas-pesquisa/${id}`, { method: "DELETE" });

// Arquivos
export const getArquivos = () => fetchClient("/arquivos");
export const getArquivosBySubmissao = (submissaoId) =>
  fetchClient(`/arquivos/submissao/${submissaoId}`);
export const createArquivo = (data) =>
  fetchClient("/arquivos/create", { method: "POST", body: data });
export const uploadArquivo = (data) =>
  fetchClient("/arquivos/create", { method: "POST", body: data });
export const uploadArquivoFile = (file, submissaoId, tipo = "MANUSCRITO") => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("submissaoId", String(submissaoId));
  formData.append("tipo", tipo);

  return fetchClient("/arquivos/upload", { method: "POST", body: formData });
};
export const getArquivoDownloadUrl = (id) =>
  `${API_BASE_URL}/arquivos/${id}/download`;
export const downloadArquivo = async (id) => {
  const response = await apiClient.get(`/arquivos/${id}/download`, {
    responseType: "blob",
  });
  return {
    blob: response.data,
    filename:
      response.headers["content-disposition"]?.match(/filename\*=UTF-8''([^;]+)/)?.[1]
        ? decodeURIComponent(
            response.headers["content-disposition"].match(
              /filename\*=UTF-8''([^;]+)/,
            )[1],
          )
        : null,
  };
};
export const deleteArquivo = (id) =>
  fetchClient(`/arquivos/${id}`, { method: "DELETE" });

// Auditoria
export const getAuditorias = () => fetchClient("/auditorias");

// Avaliadores
export const getAllAvaliadores = () => fetchClient("/avaliadores");
export const createAvaliador = (data) =>
  fetchClient("/avaliadores/create", { method: "POST", body: data });
export const updateAvaliador = (id, data) =>
  fetchClient(`/avaliadores/${id}`, { method: "PUT", body: data });
export const deleteAvaliador = (id) =>
  fetchClient(`/avaliadores/${id}`, { method: "DELETE" });

export default fetchClient;
