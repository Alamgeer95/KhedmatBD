// utils/abs.ts
export const abs = (p = '/') => {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return p.startsWith('http') ? p : `${base}${p.startsWith('/') ? '' : '/'}${p}`;
};
