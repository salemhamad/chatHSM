import { create } from 'zustand';

// Represents the result of a background prefetch warm-up request
export interface PrefetchResult {
  // The draft text that triggered this prefetch
  draftText: string;
  // Pre-gathered context from web search, file RAG, etc.
  context: string;
  // Timestamp when the prefetch completed
  completedAt: number;
  // Unique request identifier for deduplication
  requestId: string;
}

export type PrefetchStatus = 'idle' | 'warming' | 'ready' | 'stale' | 'error';

interface PrefetchState {
  status: PrefetchStatus;
  currentDraft: string;
  result: PrefetchResult | null;
  errorMessage: string | null;
  abortController: AbortController | null;
}

interface PrefetchActions {
  startWarmup: (draft: string, controller: AbortController) => void;
  completeWarmup: (result: PrefetchResult) => void;
  failWarmup: (errorMessage: string) => void;
  consumeResult: () => PrefetchResult | null;
  markStale: () => void;
  reset: () => void;
  abortCurrent: () => void;
}

type PrefetchStore = PrefetchState & PrefetchActions;

// Maximum age in ms before a prefetch result is considered stale (30 seconds)
const MAX_RESULT_AGE_MS = 30_000;

export const usePrefetchStore = create<PrefetchStore>((set, get) => ({
  status: 'idle',
  currentDraft: '',
  result: null,
  errorMessage: null,
  abortController: null,

  startWarmup: (draft, controller) => {
    // Abort any in-flight prefetch before starting a new one
    const prev = get().abortController;
    if (prev) {
      try { prev.abort(); } catch (_) { /* no-op */ }
    }
    set({
      status: 'warming',
      currentDraft: draft,
      result: null,
      errorMessage: null,
      abortController: controller,
    });
  },

  completeWarmup: (result) => {
    set({
      status: 'ready',
      result,
      abortController: null,
    });
  },

  failWarmup: (errorMessage) => {
    set({
      status: 'error',
      errorMessage,
      abortController: null,
    });
  },

  consumeResult: () => {
    const { result, status } = get();
    if (!result || status !== 'ready') return null;

    // Check if the result is too old
    if (Date.now() - result.completedAt > MAX_RESULT_AGE_MS) {
      set({ status: 'stale', result: null });
      return null;
    }

    // Consume and reset
    set({ status: 'idle', result: null, currentDraft: '' });
    return result;
  },

  markStale: () => {
    set({ status: 'stale', result: null });
  },

  reset: () => {
    const controller = get().abortController;
    if (controller) {
      try { controller.abort(); } catch (_) { /* no-op */ }
    }
    set({
      status: 'idle',
      currentDraft: '',
      result: null,
      errorMessage: null,
      abortController: null,
    });
  },

  abortCurrent: () => {
    const controller = get().abortController;
    if (controller) {
      try { controller.abort(); } catch (_) { /* no-op */ }
    }
    set({ abortController: null });
  },
}));
