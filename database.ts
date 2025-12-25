export interface Product {
  id: string;
  name: string;
  description: string;
  created_at: string;
  user_id: string;
}

export interface PriceHistory {
  id: string;
  product_id: string;
  price: number;
  date: string;
  notes: string;
  created_at: string;
}

export interface PredictionResult {
  trend: 'up' | 'down' | 'stable';
  confidence: number;
  predictedPrice: number;
  analysis: string;
}
