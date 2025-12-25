import { useState, useEffect } from 'react';
import { DollarSign, Calendar, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { PriceHistory } from '../types/database';

interface PriceEntryProps {
  productId: string;
  onPriceAdded: () => void;
}

export function PriceEntry({ productId, onPriceAdded }: PriceEntryProps) {
  const [prices, setPrices] = useState<PriceHistory[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadPrices();
  }, [productId]);

  const loadPrices = async () => {
    const { data, error } = await supabase
      .from('price_history')
      .select('*')
      .eq('product_id', productId)
      .order('date', { ascending: false });

    if (!error && data) {
      setPrices(data);
    }
  };

  const handleAddPrice = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase
      .from('price_history')
      .insert([{ product_id: productId, price: parseFloat(price), date, notes }])
      .select()
      .single();

    if (!error && data) {
      setPrices([data, ...prices]);
      setPrice('');
      setNotes('');
      setShowAddForm(false);
      onPriceAdded();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('price_history').delete().eq('id', id);

    if (!error) {
      setPrices(prices.filter((p) => p.id !== id));
      onPriceAdded();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold text-slate-800">Price History</h2>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Price
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddPrice} className="mb-6 p-4 bg-green-50 rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                required
              />
            </div>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-sm font-medium"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {prices.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No price data yet. Add your first price entry!</p>
          </div>
        ) : (
          prices.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-green-600">${entry.price}</span>
                  <span className="text-sm text-slate-500">{formatDate(entry.date)}</span>
                </div>
                {entry.notes && <p className="text-sm text-slate-600 mt-1">{entry.notes}</p>}
              </div>
              <button
                onClick={() => handleDelete(entry.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
