import ReactDOM from "react-dom/client";
import { createRouter } from "@tanstack/react-router";

import * as TanStackQueryProvider from "./integrations/tanstack-query/root-provider.tsx";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

import "./styles.css";
import reportWebVitals from "./reportWebVitals.ts";
import { Toaster } from "sonner";
import { SocketInitializer } from "./components/socketInitializer.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthHidratationGate } from "./domains/auth/components/AuthHidratationGate.tsx";
import { useAuthStore } from "./domains/auth/store/auth.store.ts";
import type { MyRouterContext } from "./routes/__root.tsx";

// Create a new router instance

const TanStackQueryProviderContext = TanStackQueryProvider.getContext();
const router = createRouter({
  routeTree,
  context: {
    ...TanStackQueryProviderContext,
  } as MyRouterContext,
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient();
// Render the app
const rootElement = document.getElementById("app");
await useAuthStore.persist.rehydrate();
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
      <TanStackQueryProvider.Provider {...TanStackQueryProviderContext}>
        <SocketInitializer />        
        <QueryClientProvider client={queryClient}>
          <AuthHidratationGate router={router} />
        </QueryClientProvider>
        <Toaster />
      </TanStackQueryProvider.Provider>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
