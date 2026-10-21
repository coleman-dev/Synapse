import { useRef, useState } from 'react';
import { authError } from './errors';

export function useAuthAction() {
  const busy = useRef(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>();
  const [success, setSuccess] = useState(false);
  async function run(action: () => Promise<void>, successMessage?: string) {
    if (busy.current) return;
    busy.current = true;
    setLoading(true);
    setMessage(undefined);
    setSuccess(false);
    try {
      await action();
      setMessage(successMessage);
      setSuccess(true);
    } catch (error) {
      setMessage(authError(error));
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }
  return { loading, message, success, run, clear: () => setMessage(undefined) };
}
