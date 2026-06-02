'use client';

import { SessionProvider } from 'next-auth/react';
import { AlertProvider } from './AlertProvider';
import { CallProvider } from '../context/CallContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AlertProvider>
        <CallProvider>
          {children}
        </CallProvider>
      </AlertProvider>
    </SessionProvider>
  );
}