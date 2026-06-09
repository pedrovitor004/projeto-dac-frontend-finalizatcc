import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (apiFunction, args = [], options = {}) => {
    const params = Array.isArray(args) ? args : [args];

    setLoading(true);
    setError(null);

    try {
      return await apiFunction(...params);
    } catch (err) {
      const errorMessage = getErrorMessage(err, "Erro na requisicao");
      setError(errorMessage);
      if (options.showError !== false) {
        toast.error(errorMessage);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, request };
}

export function useFetch(apiFunction, options = {}) {
  const [data, setData] = useState(options.initialData ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = getErrorMessage(err, "Erro ao buscar dados");
      setError(errorMessage);
      if (options.showError !== false) {
        toast.error(errorMessage);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, options.showError]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, setData, loading, error, refetch };
}

export function useMutation(apiFunction, options = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiFunction(...args);
        if (options.successMessage) {
          toast.success(options.successMessage);
        }
        return result;
      } catch (err) {
        const errorMessage = getErrorMessage(err, "Erro ao salvar dados");
        setError(errorMessage);
        if (options.showError !== false) {
          toast.error(errorMessage);
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, options.showError, options.successMessage],
  );

  return { loading, error, mutate };
}

export const useCreate = (apiFunction) =>
  useMutation(apiFunction, { successMessage: "Criado com sucesso!" });

export const useUpdate = (apiFunction) =>
  useMutation(apiFunction, { successMessage: "Atualizado com sucesso!" });

export const useDelete = (apiFunction) =>
  useMutation(apiFunction, { successMessage: "Deletado com sucesso!" });
