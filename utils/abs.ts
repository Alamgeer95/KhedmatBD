// utils/abs.ts
export const abs = (p = '/') => {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://khedmatbd.com';
  return p.startsWith('http') ? p : `${base}${p.startsWith('/') ? '' : '/'}${p}`;
};
