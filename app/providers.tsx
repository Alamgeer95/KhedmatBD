'use client'

import { ReactNode } from 'react'
import { HelmetProvider } from 'react-helmet-async'

export default function Providers({ children }: { children: ReactNode }) {
  return <HelmetProvider>{children}</HelmetProvider>
}
