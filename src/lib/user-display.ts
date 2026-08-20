import type { User } from '@supabase/supabase-js';

export function getUserDisplayName(user: User | null | undefined): string {
  if (!user) return '用户';

  const nickname = typeof user.user_metadata?.nickname === 'string'
    ? user.user_metadata.nickname.trim()
    : '';
  const fullName = typeof user.user_metadata?.full_name === 'string'
    ? user.user_metadata.full_name.trim()
    : '';

  return nickname || fullName || user.email?.split('@')[0] || '用户';
}

export function getUserInitial(user: User | null | undefined): string {
  return getUserDisplayName(user).charAt(0).toUpperCase() || '用';
}
