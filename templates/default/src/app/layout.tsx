"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import {
  CaptifyProvider,
  CaptifyLayout,
  HashRouter,
} from "@captify-io/core/components";
import { config } from "../config";
import "./globals.css";

// Lazy load page components
const contentMap = {
  home: React.lazy(() => import("../app/page")),
};

// Suppress next-auth client errors when platform is offline
if (typeof window !== "undefined") {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    const errorMessage = args[0]?.toString() || "";
    if (
      (errorMessage.includes("ClientSessionError") && errorMessage.includes("authjs.dev")) ||
      (errorMessage.includes("Cannot read properties of null") && errorMessage.includes("'message'"))
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

interface CaptifyPageLayoutProps {
  children: React.ReactNode;
  params?: Promise<{}>;
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const memoizedConfig = useMemo(() => config, []);
  const capturedSessionRef = useRef<typeof session>(null);

  // Initialize hash on first load if not present
  useEffect(() => {
    if (!window.location.hash) {
      const defaultItem = config.menu.find((item: any) => item.isDefault);
      const fallback = defaultItem?.id || config.menu[0]?.id || 'home';
      window.location.hash = fallback;
    }
  }, []);

  // Clear redirect flag when we have a session
  useEffect(() => {
    if (session?.user) {
      sessionStorage.removeItem('auth-redirect-attempted');
    }
  }, []);

  // Capture session in ref
  if (session && !capturedSessionRef.current) {
    capturedSessionRef.current = session;
  }
  const capturedSession = capturedSessionRef.current || session;

  // If loading, show nothing
  if (status === "loading") {
    return null;
  }

  // If no session, redirect to platform for sign-in
  if (status === "unauthenticated" || !session?.user) {
    const hasRedirected = sessionStorage.getItem('auth-redirect-attempted');

    if (!hasRedirected) {
      sessionStorage.setItem('auth-redirect-attempted', 'true');
      const captifyUrl = process.env.NEXT_PUBLIC_CAPTIFY_URL!;
      const callbackUrl = encodeURIComponent(window.location.href);
      window.location.href = `${captifyUrl}/api/auth/signin?callbackUrl=${callbackUrl}`;
      return null;
    }

    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center max-w-md p-6">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-muted-foreground mb-6">
            Unable to connect to the authentication server. Please check that the Captify platform is running.
          </p>
          <button
            onClick={() => {
              sessionStorage.removeItem('auth-redirect-attempted');
              window.location.reload();
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <CaptifyProvider session={capturedSession}>
      <CaptifyLayout config={memoizedConfig} session={capturedSession}>
        <HashRouter contentMap={contentMap} defaultPage="home" />
      </CaptifyLayout>
    </CaptifyProvider>
  );
}

export default function CaptifyPageLayout({
  children,
  params,
}: CaptifyPageLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className="h-full m-0 p-0">
        <SessionProvider
          refetchInterval={0}
          refetchOnWindowFocus={false}
          refetchWhenOffline={false}
        >
          <LayoutContent>{children}</LayoutContent>
        </SessionProvider>
      </body>
    </html>
  );
}

// Force dynamic rendering for authentication
export const dynamic = "force-dynamic";
