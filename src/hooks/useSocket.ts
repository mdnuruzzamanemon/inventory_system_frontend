import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:4000';

interface SocketCallbacks {
  onStockUpdate: (productId: string, availableStock: number) => void;
  onReservationExpired: (reservationId: string, productId: string) => void;
  onPurchaseNew: (productId: string, username: string, purchasedAt: string) => void;
}

export function useSocket(callbacks: SocketCallbacks) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('stock:update', (data: { productId: string; availableStock: number }) => {
      callbacks.onStockUpdate(data.productId, data.availableStock);
    });

    socket.on('reservation:expired', (data: { reservationId: string; productId: string }) => {
      callbacks.onReservationExpired(data.reservationId, data.productId);
    });

    socket.on('purchase:new', (data: { productId: string; username: string; purchasedAt: string }) => {
      callbacks.onPurchaseNew(data.productId, data.username, data.purchasedAt);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  return socketRef;
}
