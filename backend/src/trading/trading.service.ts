import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TradingService {
  private readonly logger = new Logger(TradingService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Limit calculation history to 10 per user
  private async saveCalculation(userId: string, type: string, inputs: any, results: any, explanation: string) {
    const calc = await this.prisma.tradingCalculationHistory.create({
      data: {
        userId,
        type,
        inputs: JSON.stringify(inputs),
        results: JSON.stringify(results),
        explanation,
      },
    });

    // Prune old calculations
    const userCalculations = await this.prisma.tradingCalculationHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });

    if (userCalculations.length > 10) {
      const idsToDelete = userCalculations.slice(10).map(c => c.id);
      await this.prisma.tradingCalculationHistory.deleteMany({
        where: { id: { in: idsToDelete } },
      });
    }

    return calc;
  }

  async getHistory(userId: string) {
    return this.prisma.tradingCalculationHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  // 1. Profit Loss Simple
  async calculateProfitLoss(userId: string, buyPrice: number, sellPrice: number, quantity: number) {
    const profitLoss = (sellPrice - buyPrice) * quantity;
    const isProfit = profitLoss >= 0;
    
    const explanation = `طريقة الحساب: (سعر البيع - سعر الشراء) × الكمية\n(${sellPrice} - ${buyPrice}) × ${quantity} = ${profitLoss}`;
    
    return this.saveCalculation(userId, 'profit_loss', { buyPrice, sellPrice, quantity }, { profitLoss, isProfit }, explanation);
  }

  // 2. Profit Percentage
  async calculateProfitPercentage(userId: string, buyPrice: number, sellPrice: number) {
    const percentage = ((sellPrice - buyPrice) / buyPrice) * 100;
    
    const explanation = `طريقة الحساب: ((سعر البيع - سعر الشراء) / سعر الشراء) × 100\n((${sellPrice} - ${buyPrice}) / ${buyPrice}) × 100 = ${percentage.toFixed(2)}%`;
    
    return this.saveCalculation(userId, 'profit_percentage', { buyPrice, sellPrice }, { percentage }, explanation);
  }

  // 3. Average Price
  async calculateAveragePrice(userId: string, trades: { price: number; quantity: number }[]) {
    let totalCost = 0;
    let totalQuantity = 0;
    
    for (const trade of trades) {
      totalCost += trade.price * trade.quantity;
      totalQuantity += trade.quantity;
    }
    
    const averagePrice = totalQuantity > 0 ? totalCost / totalQuantity : 0;
    
    const explanation = `طريقة الحساب: إجمالي التكلفة / إجمالي الكمية\nإجمالي التكلفة = ${totalCost}، إجمالي الكمية = ${totalQuantity}\nمتوسط السعر = ${averagePrice.toFixed(4)}`;
    
    return this.saveCalculation(userId, 'average_price', { trades }, { averagePrice, totalCost, totalQuantity }, explanation);
  }

  // 4. Risk / Reward
  async calculateRiskReward(userId: string, entryPrice: number, stopLoss: number, takeProfit: number) {
    const risk = Math.abs(entryPrice - stopLoss);
    const reward = Math.abs(takeProfit - entryPrice);
    
    const ratio = risk > 0 ? reward / risk : 0;
    
    const explanation = `طريقة الحساب:\nالمخاطرة (Risk) = |سعر الدخول - وقف الخسارة| = ${risk.toFixed(2)}\nالعائد (Reward) = |جني الأرباح - سعر الدخول| = ${reward.toFixed(2)}\nالنسبة (Risk/Reward) = 1 : ${ratio.toFixed(2)}`;
    
    return this.saveCalculation(userId, 'risk_reward', { entryPrice, stopLoss, takeProfit }, { risk, reward, ratio }, explanation);
  }

  // 5. Fibonacci Retracement
  async calculateFibonacci(userId: string, high: number, low: number, trend: 'uptrend' | 'downtrend') {
    const diff = high - low;
    const levels = [0.236, 0.382, 0.5, 0.618, 0.786];
    const results: Record<string, number> = {};
    
    let explanation = `طريقة الحساب (فيبوناتشي):\nالفرق = القمة - القاع = ${diff}\n`;
    
    levels.forEach(level => {
      const price = trend === 'uptrend' ? high - (diff * level) : low + (diff * level);
      results[level.toString()] = price;
      explanation += `مستوى ${level * 100}% = ${price.toFixed(4)}\n`;
    });
    
    return this.saveCalculation(userId, 'fibonacci', { high, low, trend }, { diff, levels: results }, explanation);
  }

  // 6. Pivot Points (Standard)
  async calculatePivotPoints(userId: string, high: number, low: number, close: number) {
    const p = (high + low + close) / 3;
    const r1 = (p * 2) - low;
    const s1 = (p * 2) - high;
    const r2 = p + (high - low);
    const s2 = p - (high - low);
    const r3 = high + 2 * (p - low);
    const s3 = low - 2 * (high - p);
    
    const results = { p, r1, s1, r2, s2, r3, s3 };
    
    const explanation = `طريقة الحساب (نقاط البيفوت الكلاسيكية):\nنقطة الارتكاز (P) = (القمة + القاع + الإغلاق) / 3 = ${p.toFixed(4)}\nالمقاومة 1 (R1) = (P × 2) - القاع = ${r1.toFixed(4)}\nالدعم 1 (S1) = (P × 2) - القمة = ${s1.toFixed(4)}\n...وهكذا لباقي المستويات.`;
    
    return this.saveCalculation(userId, 'pivot_points', { high, low, close }, results, explanation);
  }
}
