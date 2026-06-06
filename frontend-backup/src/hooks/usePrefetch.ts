import { useCallback, useRef } from 'react';
import { usePrefetchStore } from '../stores/prefetchStore';
import { useDebounce } from './useDebounce';
import { API_BASE_URL, getToken } from '../lib/api';
import { generateId } from '../lib/utils';

// Minimum character threshold before triggering prefetch
const MIN_DRAFT_LENGTH = 8;
// Debounce delay in milliseconds
const DEBOUNCE_DELAY_MS = 1500;

/**
 * Fires a silent background warm-up request to the backend.
 * The server uses this draft to pre-search web / documents
 * and cache the context so the final send is much faster.
 */
async function executePrefetch(
  draft: string,
  conversationId: string | null,
  controller: AbortController,
  requestId: string
): Promise<string> {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}/ai/prefetch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      draft,
      conversationId: conversationId || null,
      requestId,
    }),
    signal: controller.signal,
  });

  if (!response.ok) {
    throw new Error(`Prefetch request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.context || '';
}

/**
 * Hook that monitors draft text and fires a background warm-up
 * request after the user stops typing for 1.5 seconds.
 *
 * Returns:
 *  - onDraftChange: call this on every keystroke
 *  - cancelPrefetch: call this to abort any in-flight prefetch
 *  - status: current prefetch lifecycle state
 */
export function usePrefetch(conversationId: string | null) {
  const store = usePrefetchStore();
  const lastDraftRef = useRef('');

  const triggerPrefetch = useCallback(
    async (draft: string) => {
      // Skip if draft is too short or identical to last prefetched draft
      if (draft.trim().length < MIN_DRAFT_LENGTH) return;

      const readyResult = usePrefetchStore.getState().result;
      if (readyResult && readyResult.draftText === draft.trim()) return;

      const requestId = generateId();
      const controller = new AbortController();

      usePrefetchStore.getState().startWarmup(draft.trim(), controller);

      try {
        const context = await executePrefetch(
          draft.trim(),
          conversationId,
          controller,
          requestId
        );

        // Only commit if this is still the active request
        const currentState = usePrefetchStore.getState();
        if (currentState.currentDraft === draft.trim()) {
          currentState.completeWarmup({
            draftText: draft.trim(),
            context,
            completedAt: Date.now(),
            requestId,
          });
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          // Prefetch was cancelled, this is normal
          return;
        }
        usePrefetchStore.getState().failWarmup(err.message || 'Prefetch failed');
      }
    },
    [conversationId]
  );

  const { debouncedFn, cancel } = useDebounce(triggerPrefetch, DEBOUNCE_DELAY_MS);

  const onDraftChange = useCallback(
    (newDraft: string) => {
      lastDraftRef.current = newDraft;

      // If the user cleared the input, reset prefetch state
      if (newDraft.trim().length < MIN_DRAFT_LENGTH) {
        cancel();
        usePrefetchStore.getState().reset();
        return;
      }

      // If we already have a ready result for this exact draft, skip
      const currentResult = usePrefetchStore.getState().result;
      if (currentResult && currentResult.draftText === newDraft.trim()) {
        return;
      }

      // Mark any existing result as stale since the draft changed
      if (usePrefetchStore.getState().status === 'ready') {
        usePrefetchStore.getState().markStale();
      }

      debouncedFn(newDraft);
    },
    [debouncedFn, cancel]
  );

  const cancelPrefetch = useCallback(() => {
    cancel();
    usePrefetchStore.getState().reset();
  }, [cancel]);

  return {
    onDraftChange,
    cancelPrefetch,
    status: store.status,
  };
}
