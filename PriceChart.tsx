import { useEffect, useRef } from 'react';
import { PriceHistory } from '../types/database';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PriceChartProps {
  prices: PriceHistory[];
  prediction?: { trend: 'up' | 'down' | 'stable'; predictedPrice: number };
}

export function PriceChart({ prices, prediction }: PriceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || prices.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const padding = { top: 40, right: 40, bottom: 60, left: 60 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;

    const sortedPrices = [...prices].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const priceValues = sortedPrices.map((p) => Number(p.price));
    const minPrice = Math.min(...priceValues);
    const maxPrice = Math.max(...priceValues);
    const priceRange = maxPrice - minPrice || 1;

    ctx.clearRect(0, 0, rect.width, rect.height);

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
    }

    ctx.fillStyle = '#64748b';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const price = maxPrice - (priceRange / 5) * i;
      const y = padding.top + (chartHeight / 5) * i;
      ctx.fillText(`$${price.toFixed(2)}`, padding.left - 10, y + 4);
    }

    if (sortedPrices.length > 0) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.beginPath();

      sortedPrices.forEach((entry, index) => {
        const x = padding.left + (chartWidth / (sortedPrices.length - 1 || 1)) * index;
        const normalizedPrice = (Number(entry.price) - minPrice) / priceRange;
        const y = padding.top + chartHeight - normalizedPrice * chartHeight;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      sortedPrices.forEach((entry, index) => {
        const x = padding.left + (chartWidth / (sortedPrices.length - 1 || 1)) * index;
        const normalizedPrice = (Number(entry.price) - minPrice) / priceRange;
        const y = padding.top + chartHeight - normalizedPrice * chartHeight;

        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#64748b';
        ctx.font = '11px system-ui';
        ctx.textAlign = 'center';
        const date = new Date(entry.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        ctx.fillText(date, x, rect.height - padding.bottom + 20);
      });
    }

    if (prediction && sortedPrices.length > 0) {
      const lastX =
        padding.left + (chartWidth / (sortedPrices.length - 1 || 1)) * (sortedPrices.length - 1);
      const predictedX = lastX + chartWidth / (sortedPrices.length || 1);
      const normalizedPredicted = (prediction.predictedPrice - minPrice) / priceRange;
      const predictedY = padding.top + chartHeight - normalizedPredicted * chartHeight;

      const lastPrice = sortedPrices[sortedPrices.length - 1];
      const normalizedLast = (Number(lastPrice.price) - minPrice) / priceRange;
      const lastY = padding.top + chartHeight - normalizedLast * chartHeight;

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(predictedX, predictedY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(predictedX, predictedY, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Prediction', predictedX, rect.height - padding.bottom + 20);
    }
  }, [prices, prediction]);

  if (prices.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="text-center py-16">
          <TrendingUp className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Add price entries to see the chart and predictions</p>
        </div>
      </div>
    );
  }

  const sortedPrices = [...prices].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const latestPrice = sortedPrices[sortedPrices.length - 1];
  const previousPrice = sortedPrices.length > 1 ? sortedPrices[sortedPrices.length - 2] : null;

  const priceChange = previousPrice
    ? ((Number(latestPrice.price) - Number(previousPrice.price)) / Number(previousPrice.price)) * 100
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-800">Price Analysis</h2>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-slate-500">Current Price</p>
            <p className="text-2xl font-bold text-slate-800">${latestPrice.price}</p>
          </div>
          {previousPrice && (
            <div
              className={`flex items-center gap-1 px-3 py-1 rounded-lg ${
                priceChange > 0 ? 'bg-green-100 text-green-700' : priceChange < 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {priceChange > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : priceChange < 0 ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <Minus className="w-4 h-4" />
              )}
              <span className="text-sm font-semibold">{Math.abs(priceChange).toFixed(1)}%</span>
            </div>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="w-full" style={{ height: '400px' }} />
    </div>
  );
}
