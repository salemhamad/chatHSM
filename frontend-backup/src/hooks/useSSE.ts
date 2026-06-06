import { useState, useCallback, useRef } from 'react';
import { useChatStore } from '../stores/chatStore';

export function useSSE() {
  const { updateStreamingContent, setIsStreaming } = useChatStore();
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startStream = useCallback(async (endpoint: string, body: any) => {
    setError(null);
    setIsStreaming(true);
    updateStreamingContent('');
    
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      
      if (!reader) throw new Error('No reader available');

      let currentContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') {
              setIsStreaming(false);
              break;
            }
            try {
              const data = JSON.parse(dataStr);
              if (data.type === 'chunk') {
                currentContent += data.content;
                updateStreamingContent(currentContent);
              } else if (data.type === 'error') {
                setError(data.content);
                setIsStreaming(false);
              }
            } catch (e) {
              console.error('Error parsing SSE data', e);
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream aborted');
      } else {
        setError(err.message || 'An error occurred');
      }
      setIsStreaming(false);
    }
  }, [setIsStreaming, updateStreamingContent]);

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  }, [setIsStreaming]);

  return { startStream, stopStream, error };
}
