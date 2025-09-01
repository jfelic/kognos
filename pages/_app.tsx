import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { withFronteggApp } from "@frontegg/nextjs/pages";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}

export default withFronteggApp(App, {
  // hostedLoginBox: false,
  authOptions: {
    keepSessionAlive: true // Keeps the session alive by refreshing the JWT in the background
  },
});
