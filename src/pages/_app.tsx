import Navbar from "@/components/Navbar/Navbar";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Navbar />
        <Component {...pageProps} />
        <ReactQueryDevtools />
      </QueryClientProvider>
    </>
  );
}
