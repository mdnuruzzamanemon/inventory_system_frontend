import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard/ProductCard';
import Layout from '../components/Layout/Layout';
import type { Drop } from '../types';

export default function Dashboard() {
  const { user } = useAuth();
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeReservations, setActiveReservations] = useState<Record<string, string>>({});

  const reservationCount = Object.keys(activeReservations).length;

  const handleStockUpdate = useCallback((productId: string, availableStock: number) => {
    setDrops((prev) =>
      prev.map((drop) => ({
        ...drop,
        products: drop.products.map((p) =>
          p.id === productId ? { ...p, availableStock } : p,
        ),
      })),
    );
  }, []);

  const handleReservationExpired = useCallback((_reservationId: string, productId: string) => {
    setActiveReservations((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  }, []);

  const handlePurchaseNew = useCallback((productId: string, username: string, purchasedAt: string) => {
    setDrops((prev) =>
      prev.map((drop) => ({
        ...drop,
        products: drop.products.map((p) => {
          if (p.id !== productId) return p;
          const existing = p.recentPurchasers;
          const updated = [{ username, purchasedAt }, ...existing].slice(0, 3);
          return { ...p, recentPurchasers: updated };
        }),
      })),
    );
  }, []);

  useSocket({
    onStockUpdate: handleStockUpdate,
    onReservationExpired: handleReservationExpired,
    onPurchaseNew: handlePurchaseNew,
  });

  useEffect(() => {
    fetchDrops();
  }, []);

  useEffect(() => {
    if (user) {
      fetchActiveReservations();
    } else {
      setActiveReservations({});
    }
  }, [user]);

  const fetchDrops = async () => {
    try {
      const res = await api.get('/drops/active');
      setDrops(res.data.data);
    } catch {
      console.error('Failed to fetch drops');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveReservations = async () => {
    try {
      const res = await api.get('/reservations/me');
      const reservations = res.data.data;
      const map: Record<string, string> = {};
      for (const r of reservations) {
        map[r.productId] = r.id;
      }
      setActiveReservations(map);
    } catch {
      console.error('Failed to fetch reservations');
    }
  };

  const handleReservationCreated = useCallback((productId: string, reservationId: string) => {
    setActiveReservations((prev) => ({ ...prev, [productId]: reservationId }));
  }, []);

  const handleReservationCleared = useCallback((productId: string) => {
    setActiveReservations((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-gray-400">Loading drops...</div>
        </div>
      </Layout>
    );
  }

  if (drops.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-300 mb-2">No Active Drops</h2>
            <p className="text-gray-500">Check back later for new sneaker drops!</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout reservationCount={reservationCount}>
      <div className="space-y-12">
        {drops.map((drop) => (
          <section key={drop.id}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">{drop.name}</h2>
              {drop.description && (
                <p className="text-gray-400 mt-1">{drop.description}</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drop.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  activeReservationId={activeReservations[product.id] || null}
                  onStockUpdate={handleStockUpdate}
                  onReservationCreated={handleReservationCreated}
                  onReservationCleared={handleReservationCleared}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </Layout>
  );
}
