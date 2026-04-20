"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "./LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (!token) {
          router.push("/login");
          return;
        }

        if (userData) {
          const user = JSON.parse(userData);
          setIsAuthenticated(true);
          setIsAdmin(user.isAdmin);

          if (requireAdmin && !user.isAdmin) {
            router.push("/");
          }
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [router, requireAdmin]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated || (requireAdmin && !isAdmin)) {
    return null;
  }

  return <>{children}</>;
}
