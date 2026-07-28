import { useState } from "react";
import { toast } from "sonner";

interface UseFetchResult<T, Args extends unknown[]> {
  data: T | undefined;
  loading: boolean | null;
  error: Error | null;
  fn: (...args: Args) => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T | undefined>>;
}

const useFetch = <T, Args extends unknown[]>(
  cb: (...args: Args) => Promise<T>
): UseFetchResult<T, Args> => {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const fn = async (...args: Args) => {
    setLoading(true);
    setError(null);

    try {
      const response = await cb(...args);
      setData(response);
      setError(null);
    } catch (err) {
      const errorStr = err instanceof Error ? err : new Error(String(err));
      setError(errorStr);
      toast.error(errorStr.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
};

export default useFetch;
