import { apiClient } from './api';

export const tradingApi = {
  getHistory: () => apiClient.get('/trading/history'),
  
  calculateProfitLoss: (data: { buyPrice: number; sellPrice: number; quantity: number }) => 
    apiClient.post('/trading/profit-loss', data),
    
  calculateProfitPercentage: (data: { buyPrice: number; sellPrice: number }) => 
    apiClient.post('/trading/profit-percentage', data),
    
  calculateAveragePrice: (data: { trades: { price: number; quantity: number }[] }) => 
    apiClient.post('/trading/average-price', data),
    
  calculateRiskReward: (data: { entryPrice: number; stopLoss: number; takeProfit: number }) => 
    apiClient.post('/trading/risk-reward', data),
    
  calculateFibonacci: (data: { high: number; low: number; trend: 'uptrend' | 'downtrend' }) => 
    apiClient.post('/trading/fibonacci', data),
    
  calculatePivotPoints: (data: { high: number; low: number; close: number }) => 
    apiClient.post('/trading/pivot-points', data),
};
