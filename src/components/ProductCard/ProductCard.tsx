import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { Product } from '../../types';

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface Props {
  product: Product;
  activeReservationId: string | null;
  onStockUpdate: (productId: string, availableStock: number) => void;
  onReservationCreated: (productId: string, reservationId: string) => void;
  onReservationCleared: (productId: string) => void;
}

export default function ProductCard({
  product,
  activeReservationId,
  onStockUpdate,
  onReservationCreated,
  onReservationCleared,
}: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reserving, setReserving] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  const outOfStock = product.availableStock <= 0;

  const handleReserve = async () => {
    if (!user) {
      toast('Sign up to reserve this item', {
        icon: '🔒',
        style: { background: '#1f2937', color: '#fff', border: '1px solid #374151' },
      });
      navigate('/register');
      return;
    }

    setReserving(true);
    try {
      const res = await api.post('/reservations', { productId: product.id });
      const data = res.data.data;
      onReservationCreated(product.id, data.reservation.id);
      onStockUpdate(product.id, data.product.availableStock);
      toast.success('Reserved! Complete purchase within 60 seconds');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to reserve';
      toast.error(msg);
    } finally {
      setReserving(false);
    }
  };

  const handlePurchase = async () => {
    if (!activeReservationId) {
      toast.error('No active reservation');
      return;
    }

    setPurchasing(true);
    try {
      const res = await api.post('/purchases', { reservationId: activeReservationId });
      const data = res.data.data;
      onStockUpdate(product.id, data.product.availableStock);
      onReservationCleared(product.id);
      toast.success('Purchase successful!');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Purchase failed';
      toast.error(msg);
      onReservationCleared(product.id);
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-white">{product.name}</h3>
          <p className="text-2xl font-bold text-violet-400 mt-1">${Number(product.price).toFixed(2)}</p>
        </div>
        <div className="text-right">
          <div className={`text-sm font-medium ${outOfStock ? 'text-red-400' : 'text-green-400'}`}>
            {product.availableStock} in stock
          </div>
          <div className="text-xs text-gray-500">{product.totalStock} total</div>
        </div>
      </div>

      {product.recentPurchasers.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recent purchases
          </p>
          <div className="flex flex-col gap-2">
            {product.recentPurchasers.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-violet-400">
                    {p.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm font-medium text-gray-200 truncate">{p.username}</span>
                  <span className="text-xs text-gray-500 whitespace-nowrap">{timeAgo(p.purchasedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-auto">
        {!activeReservationId ? (
          <button
            onClick={handleReserve}
            disabled={reserving || outOfStock}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all cursor-pointer
              ${outOfStock
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : reserving
                  ? 'bg-violet-800 text-violet-200 cursor-wait'
                  : 'bg-violet-600 hover:bg-violet-500 text-white'
              }`}
          >
            {reserving ? 'Reserving...' : outOfStock ? 'Out of Stock' : 'Reserve'}
          </button>
        ) : (
          <button
            onClick={handlePurchase}
            disabled={purchasing}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all cursor-pointer
              ${purchasing
                ? 'bg-emerald-800 text-emerald-200 cursor-wait'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
          >
            {purchasing ? 'Processing...' : 'Complete Purchase'}
          </button>
        )}
      </div>
    </div>
  );
}
