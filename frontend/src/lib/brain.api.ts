import { apiClient } from './api';

export const brainApi = {
  getMemories: () => apiClient.get('/brain/memory'),
  
  saveMemory: (data: { category: string; key: string; value: string; confidence?: number }) => 
    apiClient.post('/brain/memory', data),
    
  forgetMemory: (id: string) => 
    apiClient.delete(`/brain/memory/${id}`),
    
  submitEvaluation: (data: { question: string; answer: string; modelName: string; rating: 'positive' | 'negative'; reason?: string }) => 
    apiClient.post('/brain/evaluation', data),
};
