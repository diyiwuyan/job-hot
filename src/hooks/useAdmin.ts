'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/lib/supabase';

export type AdminRole = 'super_admin' | 'admin';

interface AdminInfo {
  isAdmin: boolean;
  role: AdminRole | null;
  loading: boolean;
}

export function useAdmin(): AdminInfo {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState<AdminRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user || !supabase) {
      setIsAdmin(false);
      setRole(null);
      setLoading(false);
      return;
    }

    supabase
      .from('admins')
      .select('role')
      .eq('user_id', user.id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setIsAdmin(false);
          setRole(null);
        } else {
          setIsAdmin(true);
          setRole(data.role as AdminRole);
        }
        setLoading(false);
      });
  }, [user, authLoading]);

  return { isAdmin, role, loading };
}
