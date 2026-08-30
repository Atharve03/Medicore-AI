import { useCallback, useEffect, useState } from 'react';

/**
 * fetcher must be a stable callback (wrap with useCallback at the call
 * site) returning a promise for an axios response; this hook unwraps
 * `.data.data` — the shape every MediCore AI endpoint returns via
 * ApiResponse — and exposes { data, loading, error, refetch }.
 */
export function useFetch(fetcher, deps) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetcher();
      setData(response.data.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
