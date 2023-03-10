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
        {/* <Navbar /> */}
        <div className="min-h-screen bg-slate-200 pt-6">
          <div className="max-w-3xl mx-auto">
            <Component {...pageProps} />
          </div>
        </div>

        <ReactQueryDevtools />
      </QueryClientProvider>
    </>
  );
}
