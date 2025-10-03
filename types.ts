export type ActionState =
  | { ok: false; error: string }
  | { ok: true; slug?: string; message?: string }