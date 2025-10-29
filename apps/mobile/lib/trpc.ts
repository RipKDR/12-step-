import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@repo/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState } from 'react';
import { httpBatchLink } from '@trpc/client';
// FIX: Use relative paths for local module imports.
import { supabase } from './supabase';

// FIX: Removing explicit type annotation which did not solve the underlying issue
// and simplifying the createTRPCReact call. The root cause is likely a naming
// collision in the API router, which has been addressed there.
export const trpc = createTRPCReact<AppRouter>();

export const TRPCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          // This should point to your deployed or local Next.js tRPC server
          // TODO: Use an environment variable for this
          url: 'http://localhost:3000/api/trpc', 
          async headers() {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            return {
              authorization: token ? `Bearer ${token}` : undefined,
            };
          },
        }),
      ],
    })
  );

  // FIX: Replaced JSX with React.createElement to be valid in a .ts file.
  // FIX: Correctly nested providers. QueryClientProvider must be an ancestor of trpc.Provider.
  return React.createElement(
    QueryClientProvider,
    { client: queryClient },
    React.createElement(
      trpc.Provider,
      { client: trpcClient, queryClient: queryClient },
      children
    )
  );
};