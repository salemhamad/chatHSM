import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TradingService } from './trading.service';

@Controller('trading')
@UseGuards(JwtAuthGuard)
export class TradingController {
  constructor(private readonly tradingService: TradingService) {}

  @Get('history')
  async getHistory(@Req() req) {
    return this.tradingService.getHistory(req.user.userId);
  }

  @Post('profit-loss')
  async calculateProfitLoss(@Req() req, @Body() body: { buyPrice: number; sellPrice: number; quantity: number }) {
    return this.tradingService.calculateProfitLoss(req.user.userId, body.buyPrice, body.sellPrice, body.quantity);
  }

  @Post('profit-percentage')
  async calculateProfitPercentage(@Req() req, @Body() body: { buyPrice: number; sellPrice: number }) {
    return this.tradingService.calculateProfitPercentage(req.user.userId, body.buyPrice, body.sellPrice);
  }

  @Post('average-price')
  async calculateAveragePrice(@Req() req, @Body() body: { trades: { price: number; quantity: number }[] }) {
    return this.tradingService.calculateAveragePrice(req.user.userId, body.trades);
  }

  @Post('risk-reward')
  async calculateRiskReward(@Req() req, @Body() body: { entryPrice: number; stopLoss: number; takeProfit: number }) {
    return this.tradingService.calculateRiskReward(req.user.userId, body.entryPrice, body.stopLoss, body.takeProfit);
  }

  @Post('fibonacci')
  async calculateFibonacci(@Req() req, @Body() body: { high: number; low: number; trend: 'uptrend' | 'downtrend' }) {
    return this.tradingService.calculateFibonacci(req.user.userId, body.high, body.low, body.trend);
  }

  @Post('pivot-points')
  async calculatePivotPoints(@Req() req, @Body() body: { high: number; low: number; close: number }) {
    return this.tradingService.calculatePivotPoints(req.user.userId, body.high, body.low, body.close);
  }
}
