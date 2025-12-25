import { TrendingUp, TrendingDown, Minus, Brain, AlertCircle } from 'lucide-react';
import { PredictionResult } from '../types/database';

interface PredictionPanelProps {
  prediction: PredictionResult | null;
}

export function PredictionPanel({ prediction }: PredictionPanelProps) {
  if (!prediction) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-violet-600" />
          <h2 className="text-lg font-semibold text-slate-800">AI Market Prediction</h2>
        </div>
        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
          <AlertCircle className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <p className="text-slate-600 text-sm">
            Add at least 2 price entries to generate AI-powered predictions and market analysis.
          </p>
        </div>
      </div>
    );
  }

  const getTrendIcon = () => {
    switch (prediction.trend) {
      case 'up':
        return <TrendingUp className="w-6 h-6" />;
      case 'down':
        return <TrendingDown className="w-6 h-6" />;
      default:
        return <Minus className="w-6 h-6" />;
    }
  };

  const getTrendColor = () => {
    switch (prediction.trend) {
      case 'up':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'down':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTrendLabel = () => {
    switch (prediction.trend) {
      case 'up':
        return 'Upward Trend';
      case 'down':
        return 'Downward Trend';
      default:
        return 'Stable Market';
    }
  };

  const getConfidenceColor = () => {
    if (prediction.confidence >= 70) return 'text-green-600';
    if (prediction.confidence >= 40) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="w-5 h-5 text-violet-600" />
        <h2 className="text-lg font-semibold text-slate-800">AI Market Prediction</h2>
      </div>

      <div className="space-y-6">
        <div className={`flex items-center justify-between p-5 rounded-xl border-2 ${getTrendColor()}`}>
          <div className="flex items-center gap-3">
            {getTrendIcon()}
            <div>
              <p className="text-sm font-medium opacity-80">Market Direction</p>
              <p className="text-xl font-bold">{getTrendLabel()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium opacity-80">Confidence</p>
            <p className={`text-2xl font-bold ${getConfidenceColor()}`}>
              {prediction.confidence}%
            </p>
          </div>
        </div>

        <div className="p-5 bg-gradient-to-br from-violet-50 to-blue-50 rounded-xl border border-violet-200">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-sm font-medium text-violet-700">Next Period Prediction</span>
          </div>
          <p className="text-3xl font-bold text-violet-900">
            ${prediction.predictedPrice.toFixed(2)}
          </p>
        </div>

        <div className="p-5 bg-slate-50 rounded-xl">
          <h3 className="font-semibold text-slate-800 mb-3">Market Analysis</h3>
          <p className="text-slate-700 leading-relaxed">{prediction.analysis}</p>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">Analysis Method</p>
              <p className="text-sm text-blue-700">
                Predictions are generated using linear regression, trend analysis, and volatility
                metrics based on your historical price data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
