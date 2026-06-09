import { useCallback, useState } from "react";

export function useForm(initialValues = {}, onSubmit) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    setValues((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const handleBlur = useCallback((event) => {
    const { name } = event.target;
    setTouched((current) => ({ ...current, [name]: true }));
  }, []);

  const setFieldValue = useCallback((name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const handleSubmit = useCallback(
    async (event) => {
      event?.preventDefault();
      if (!onSubmit) return;

      setLoading(true);
      setErrors({});

      try {
        await onSubmit(values);
      } catch (error) {
        setErrors({ form: error.message || "Erro no formulario" });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [onSubmit, values],
  );

  return {
    values,
    setValues,
    errors,
    setErrors,
    touched,
    loading,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    reset,
  };
}
