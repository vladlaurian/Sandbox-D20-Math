import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Football D20 Sandbox',
  description: 'Mathematical sandbox for D20 football board game calibration',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  );
}
