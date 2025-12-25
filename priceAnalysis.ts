import { PriceHistory, PredictionResult } from '../types/database';

export function analyzePrices(prices: PriceHistory[]): PredictionResult | null {
  if (prices.length < 2) {
    return null;
  }

  const sortedPrices = [...prices].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const priceValues = sortedPrices.map((p) => Number(p.price));
  const n = priceValues.length;

  const average = priceValues.reduce((sum, price) => sum + price, 0) / n;

  const recentPrices = priceValues.slice(-Math.min(3, n));
  const recentAverage = recentPrices.reduce((sum, price) => sum + price, 0) / recentPrices.length;

  const olderPrices = priceValues.slice(0, Math.max(1, n - 3));
  const olderAverage = olderPrices.reduce((sum, price) => sum + price, 0) / olderPrices.length;

  const priceDifferences: number[] = [];
  for (let i = 1; i < priceValues.length; i++) {
    priceDifferences.push(priceValues[i] - priceValues[i - 1]);
  }

  const averageChange =
    priceDifferences.reduce((sum, diff) => sum + diff, 0) / priceDifferences.length;

  let xSum = 0;
  let ySum = 0;
  let xySum = 0;
  let xSquareSum = 0;

  for (let i = 0; i < n; i++) {
    xSum += i;
    ySum += priceValues[i];
    xySum += i * priceValues[i];
    xSquareSum += i * i;
  }

  const slope = (n * xySum - xSum * ySum) / (n * xSquareSum - xSum * xSum);
  const intercept = (ySum - slope * xSum) / n;

  const predictedPrice = slope * n + intercept;

  const latestPrice = priceValues[n - 1];
  const priceChangePercent = ((recentAverage - olderAverage) / olderAverage) * 100;

  let trend: 'up' | 'down' | 'stable';
  if (Math.abs(priceChangePercent) < 2) {
    trend = 'stable';
  } else if (priceChangePercent > 0) {
    trend = 'up';
  } else {
    trend = 'down';
  }

  const variance =
    priceValues.reduce((sum, price) => sum + Math.pow(price - average, 2), 0) / n;
  const standardDeviation = Math.sqrt(variance);
  const coefficientOfVariation = (standardDeviation / average) * 100;

  const confidence = Math.max(0, Math.min(100, 100 - coefficientOfVariation * 2));

  let analysis = '';

  if (trend === 'up') {
    analysis = `Based on recent trends, prices are moving upward. The analysis shows a ${Math.abs(priceChangePercent).toFixed(1)}% increase in recent weeks. `;
    if (slope > 0) {
      analysis += `The overall trend suggests continued growth. `;
    }
    if (coefficientOfVariation < 15) {
      analysis += `Price movements are relatively stable, indicating a consistent upward trajectory.`;
    } else {
      analysis += `However, price volatility is moderate, so expect some fluctuations.`;
    }
  } else if (trend === 'down') {
    analysis = `Recent data indicates a downward trend with a ${Math.abs(priceChangePercent).toFixed(1)}% decrease. `;
    if (slope < 0) {
      analysis += `The overall pattern suggests this decline may continue. `;
    }
    if (coefficientOfVariation < 15) {
      analysis += `Price changes are consistent, indicating a steady decline.`;
    } else {
      analysis += `Price volatility is present, which could lead to potential recovery opportunities.`;
    }
  } else {
    analysis = `Prices are currently stable with minimal fluctuation (${Math.abs(priceChangePercent).toFixed(1)}% change). `;
    if (coefficientOfVariation < 10) {
      analysis += `This stability is consistent across the data, suggesting a mature market phase.`;
    } else {
      analysis += `While the overall trend is flat, there's some volatility that could signal an upcoming directional move.`;
    }
  }

  return {
    trend,
    confidence: Math.round(confidence),
    predictedPrice: Math.max(0, predictedPrice),
    analysis,
  };
}
