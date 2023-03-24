import Navbar from "@/components/Navbar/Navbar";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <>
      <ToastContainer autoClose={2000} />
      <QueryClientProvider client={queryClient}>
        <Navbar />

        <div className="max-w-3xl mx-auto min-h-screen pt-14">
          <Component {...pageProps} />
        </div>

        <ReactQueryDevtools />
      </QueryClientProvider>
    </>
  );
}
