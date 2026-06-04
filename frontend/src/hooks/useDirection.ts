import { useMemo } from 'react';
import { detectTextDirection } from '../lib/utils';

export function useDirection(text: string) {
  const direction = useMemo(() => {
    if (!text || text.trim() === '') return 'ltr'; // default
    return detectTextDirection(text);
  }, [text]);

  return direction;
}
