import { useCallback, useMemo, useState } from "react";

export function useFilters(data = [], fields = []) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});

  const results = useMemo(() => {
    let filtered = data;

    if (search) {
      const normalizedSearch = search.toLowerCase();
      filtered = filtered.filter((item) =>
        fields.some((field) =>
          String(item?.[field] ?? "")
            .toLowerCase()
            .includes(normalizedSearch),
        ),
      );
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter((item) => item?.[key] === value);
      }
    });

    return filtered;
  }, [data, fields, filters, search]);

  const addFilter = useCallback((key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  }, []);

  const removeFilter = useCallback((key) => {
    setFilters((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSearch("");
    setFilters({});
  }, []);

  return {
    search,
    setSearch,
    filters,
    addFilter,
    removeFilter,
    clearFilters,
    results,
  };
}
