import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { notify, errorMessage } from '../lib/notify';

// Carga datos al entrar a la pantalla (y cada vez que vuelves a ella)
export function useQuery<T>(fetcher: () => Promise<T>, initial: T) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const ref = useRef(fetcher);
  ref.current = fetcher;

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setData(await ref.current());
    } catch (e) {
      notify('Error', errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  return { data, loading, reload };
}
