import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { LanguageProvider } from "./contexts/LanguageContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import { useActor } from "./hooks/useActor";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";

import { CommunityPage } from "./pages/CommunityPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RequestsPage } from "./pages/RequestsPage";
import { WorkerDashboardPage } from "./pages/WorkerDashboardPage";
import { getAuthUser } from "./utils/auth";

function AppInitializer() {
  // Silent database resets are fully disabled to guarantee permanent persistence of registrations and profiles.
  // Standard Railpack deployment trigger v5!
  return null;
}

function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppInitializer />
      <Toaster position="bottom-right" richColors />
      <Outlet />
    </div>
  );
}

function MainLayout() {
  const user = getAuthUser();
  const isWorker = user?.role === "worker";
  // If the worker is approved, cert status in localStorage will be "approved"
  const isApproved = isWorker ? localStorage.getItem(`knot_cert_status_${user.id}`) === "approved" : true;
  const hideLayout = isWorker && !isApproved;

  return (
    <>
      {!hideLayout && <Navbar />}
      <div className="flex-1 flex flex-col animate-page-shift">
        <Outlet />
      </div>
      {!hideLayout && <Footer />}
    </>
  );
}

// Route definitions
const rootRoute = createRootRoute({
  component: RootLayout,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: () => (
    <div className="flex-1 flex flex-col animate-page-shift">
      <LoginPage />
    </div>
  ),
});

const mainLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "main",
  component: MainLayout,
  beforeLoad: ({ location }) => {
    const user = getAuthUser();
    if (!user) {
      throw redirect({ to: "/login" });
    }
    if (user.role === "worker") {
      const isApproved = localStorage.getItem(`knot_cert_status_${user.id}`) === "approved";
      if (!isApproved && location.pathname !== "/worker-dashboard") {
        throw redirect({ to: "/worker-dashboard" });
      }
    }
  },
});

const homeRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/",
  component: HomePage,
});

const profileRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/profile/$id",
  component: ProfilePage,
});

const communityRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/community/$skill",
  component: CommunityPage,
});

const requestsRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/requests",
  component: RequestsPage,
});

const workerDashboardRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/worker-dashboard",
  component: WorkerDashboardPage,
});



const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-login",
  component: () => (
    <div className="flex-1 flex flex-col animate-page-shift">
      <AdminLoginPage />
    </div>
  ),
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: () => (
    <div className="flex-1 flex flex-col animate-page-shift">
      <AdminDashboardPage />
    </div>
  ),
  beforeLoad: () => {
    const user = getAuthUser();
    if (!user || user.role !== "admin") {
      throw redirect({ to: "/admin-login" });
    }
  },
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  adminLoginRoute,
  adminRoute,
  mainLayoutRoute.addChildren([
    homeRoute,
    profileRoute,
    communityRoute,
    requestsRoute,
    workerDashboardRoute,

  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <LanguageProvider>
      <NotificationsProvider>
        <RouterProvider router={router} />
      </NotificationsProvider>
    </LanguageProvider>
  );
}
