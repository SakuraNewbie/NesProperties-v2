import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1
    }
  }
});

// Use window location to check if we're in development mode
const isDevelopment = () => {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1';
};

export const QueryProvider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only render DevTools in development */}
      {isDevelopment() && 
        (() => {
          try {
            // Dynamically import DevTools only if needed
            // eslint-disable-next-line no-undef
            const { ReactQueryDevtools } = require('@tanstack/react-query-devtools');
            // Set position to top-left to avoid chatbot overlap
            return <ReactQueryDevtools initialIsOpen={false} position="top-left" />;
          // eslint-disable-next-line no-unused-vars
          } catch (e) {
            return null;
          }
        })()
      }
    </QueryClientProvider>
  );
};
