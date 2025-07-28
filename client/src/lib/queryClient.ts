
import { QueryClient } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export async function apiRequest(
  method: string,
  endpoint: string,
  body?: any
): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`;

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity, // Nunca considera dados como stale
      gcTime: Infinity, // Nunca remove do cache
      refetchOnMount: false, // Nunca refetch ao montar
      refetchOnWindowFocus: false, // Nunca refetch ao focar
      refetchOnReconnect: false, // Nunca refetch ao reconectar
      refetchInterval: false, // Nunca refetch automático
      retry: 0, // Não tenta novamente em caso de erro
      retryOnMount: false, // Não retry ao montar
      networkMode: 'offlineFirst', // Prioriza cache
    },
    mutations: {
      retry: 0, // Não retry mutations
      networkMode: 'offlineFirst', // Prioriza cache
    },
  },
});
