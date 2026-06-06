import { create } from 'zustand';
import { apiClient, getToken, API_BASE_URL } from '../lib/api';

export interface Document {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: 'PENDING' | 'PROCESSED' | 'ERROR';
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DirectFact {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface KnowledgeStore {
  documents: Document[];
  facts: DirectFact[];
  isLoading: boolean;
  isUploading: boolean;
  uploadProgress: Record<string, number>; // Maps temporary file ID or name to percentage
  error: string | null;

  fetchDocuments: () => Promise<void>;
  toggleDocument: (id: string) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  uploadDocument: (file: File) => Promise<void>;
  fetchFacts: () => Promise<void>;
  createFact: (content: string) => Promise<void>;
  deleteFact: (id: string) => Promise<void>;
}

export const useKnowledgeStore = create<KnowledgeStore>((set, get) => ({
  documents: [],
  facts: [],
  isLoading: false,
  isUploading: false,
  uploadProgress: {},
  error: null,

  fetchDocuments: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiClient.get('/knowledge/documents');
      set({ documents: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch documents', isLoading: false });
    }
  },

  toggleDocument: async (id: string) => {
    set({ error: null });
    try {
      const updated = await apiClient.patch(`/knowledge/documents/${id}/toggle`, {});
      set((state) => ({
        documents: state.documents.map((doc) =>
          doc.id === id ? { ...doc, isEnabled: updated.isEnabled } : doc
        ),
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to toggle document' });
    }
  },

  deleteDocument: async (id: string) => {
    set({ error: null });
    try {
      await apiClient.delete(`/knowledge/documents/${id}`);
      set((state) => ({
        documents: state.documents.filter((doc) => doc.id !== id),
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete document' });
    }
  },

  uploadDocument: async (file: File) => {
    const fileId = `${file.name}-${Date.now()}`;
    set((state) => ({
      isUploading: true,
      error: null,
      uploadProgress: { ...state.uploadProgress, [fileId]: 0 },
    }));

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = getToken();
      
      // We will perform a custom fetch request to track progress and handle multipart upload
      const xhr = new XMLHttpRequest();
      
      const uploadPromise = new Promise<any>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentage = Math.round((event.loaded * 100) / event.total);
            set((state) => ({
              uploadProgress: { ...state.uploadProgress, [fileId]: percentage },
            }));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const res = JSON.parse(xhr.responseText);
              resolve(res);
            } catch (e) {
              resolve(xhr.responseText);
            }
          } else {
            reject(new Error(xhr.responseText || `Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload.'));
        });

        xhr.open('POST', `${API_BASE_URL}/knowledge/upload`);
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        xhr.send(formData);
      });

      await uploadPromise;
      
      // Upload finished, clear the progress for this file and fetch updated list
      set((state) => {
        const nextProgress = { ...state.uploadProgress };
        delete nextProgress[fileId];
        return { uploadProgress: nextProgress, isUploading: Object.keys(nextProgress).length > 0 };
      });

      await get().fetchDocuments();
    } catch (err: any) {
      set((state) => {
        const nextProgress = { ...state.uploadProgress };
        delete nextProgress[fileId];
        return {
          error: err.message || `Failed to upload ${file.name}`,
          uploadProgress: nextProgress,
          isUploading: Object.keys(nextProgress).length > 0,
        };
      });
    }
  },

  fetchFacts: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiClient.get('/knowledge/facts');
      set({ facts: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch facts', isLoading: false });
    }
  },

  createFact: async (content: string) => {
    set({ error: null });
    try {
      const newFact = await apiClient.post('/knowledge/facts', { content });
      set((state) => ({
        facts: [newFact, ...state.facts],
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to create fact' });
    }
  },

  deleteFact: async (id: string) => {
    set({ error: null });
    try {
      await apiClient.delete(`/knowledge/facts/${id}`);
      set((state) => ({
        facts: state.facts.filter((fact) => fact.id !== id),
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete fact' });
    }
  },
}));
