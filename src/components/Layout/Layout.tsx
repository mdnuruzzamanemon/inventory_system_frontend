import { type ReactNode } from 'react';
import Navbar from './Navbar';

interface Props {
  children: ReactNode;
  reservationCount?: number;
}

export default function Layout({ children, reservationCount = 0 }: Props) {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar reservationCount={reservationCount} />
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
