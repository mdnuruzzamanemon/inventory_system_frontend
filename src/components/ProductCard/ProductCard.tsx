import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { Product } from '../../types';

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
          <p className="text-xs text-gray-400 mb-1">Recent buyers</p>
          <div className="flex flex-col gap-0.5">
            {product.recentPurchasers.map((p, i) => (
              <div key={i} className="text-sm text-gray-300">
                #{i + 1} {p.username}
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
