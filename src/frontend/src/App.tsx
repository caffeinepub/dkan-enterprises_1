import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import React from "react";
import AdminPasswordGate from "./components/AdminPasswordGate";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { LanguageProvider } from "./hooks/useLanguage";
import AdminDashboard from "./pages/AdminDashboard";
import HomePage from "./pages/HomePage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

// Root layout with Navbar + Footer
function RootLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

// Admin page — password gate + identity login required
function AdminPage() {
  const [authenticated, setAuthenticated] = React.useState(false);
  const [isAdminReady, setIsAdminReady] = React.useState(false);

  // Re-check when identity changes (after login)
  const handleAuthenticated = React.useCallback(() => {
    setAuthenticated(true);
    // Give the backend a moment to settle before enabling bookings query
    // 1500ms delay ensures _initializeAccessControlWithSecret has completed
    setTimeout(() => setIsAdminReady(true), 1500);
  }, []);

  if (!authenticated) {
    return <AdminPasswordGate onAuthenticated={handleAuthenticated} />;
  }

  return <AdminDashboard isAdminReady={isAdminReady} />;
}

// Routes
const rootRoute = createRootRoute({ component: RootLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([indexRoute, adminRoute]);

const router = createRouter({ routeTree });

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <LanguageProvider>
          <RouterProvider router={router} />
          <Toaster />
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
