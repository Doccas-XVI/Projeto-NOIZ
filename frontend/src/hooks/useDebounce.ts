import { useEffect, useState } from 'react';

/** Só "solta" o valor depois que ele para de mudar por `delay` ms (ex: busca ao digitar). */
export function useDebounce<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
