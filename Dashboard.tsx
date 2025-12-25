import { useState, useEffect } from 'react';
import { LogOut, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ProductList } from './ProductList';
import { PriceEntry } from './PriceEntry';
import { PriceChart } from './PriceChart';
import { PredictionPanel } from './PredictionPanel';
import { supabase } from '../lib/supabase';
import { Product, PriceHistory } from '../types/database';
import { analyzePrices } from '../utils/priceAnalysis';

export function Dashboard() {
  const { signOut } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (selectedProduct) {
      loadPriceHistory();
    }
  }, [selectedProduct, refreshKey]);

  const loadPriceHistory = async () => {
    if (!selectedProduct) return;

    const { data, error } = await supabase
      .from('price_history')
      .select('*')
      .eq('product_id', selectedProduct.id)
      .order('date', { ascending: true });

    if (!error && data) {
      setPriceHistory(data);
    }
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  const handlePriceAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const prediction = priceHistory.length >= 2 ? analyzePrices(priceHistory) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2.5 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Price Tracker Pro</h1>
                <p className="text-sm text-slate-600">AI-Powered Market Analysis</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ProductList
              onSelectProduct={handleProductSelect}
              selectedProductId={selectedProduct?.id}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            {selectedProduct ? (
              <>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">{selectedProduct.name}</h2>
                  {selectedProduct.description && (
                    <p className="text-slate-600">{selectedProduct.description}</p>
                  )}
                </div>

                <PriceEntry productId={selectedProduct.id} onPriceAdded={handlePriceAdded} />

                {priceHistory.length > 0 && (
                  <>
                    <PriceChart
                      prices={priceHistory}
                      prediction={
                        prediction
                          ? { trend: prediction.trend, predictedPrice: prediction.predictedPrice }
                          : undefined
                      }
                    />
                    <PredictionPanel prediction={prediction} />
                  </>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                <TrendingUp className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  Welcome to Price Tracker Pro
                </h3>
                <p className="text-slate-600">
                  Create a product to start tracking prices and get AI-powered market predictions
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
