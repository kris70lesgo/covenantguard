'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

interface ClientShellProps {
  children: React.ReactNode;
}

export default function ClientShell({ children }: ClientShellProps) {
  const pathname = usePathname();
  const isLanding = pathname === '/';
  const isAuth = pathname.startsWith('/login');

  if (isLanding || isAuth) return <>{children}</>;

  return <Sidebar>{children}</Sidebar>;
}
