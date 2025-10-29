"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Session, SupabaseClient } from '@supabase/supabase-js';

import { useRouter } from 'next/navigation';

type SupabaseContextType = {
  supabase: SupabaseClient;
  session: Session | null;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function SupabaseProvider({ children, session }: { children: React.ReactNode; session: Session | null }) {
  const [supabase] = useState(() => createClient());
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  return (
    <SupabaseContext.Provider value={{ supabase, session }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}