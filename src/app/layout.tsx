// src/app/layout.tsx
import type { Metadata } from 'next';
import { Nav } from '@/components/ui/Nav';
import './globals.css';

export const metadata: Metadata = {
  title: 'QueueFlow',
  description: 'Queue & booking management for any activity',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <Nav />
        {children}
      </body>
    </html>
  );
}
