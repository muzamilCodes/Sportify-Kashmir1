"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OTPPage() {
  const router = useRouter();

  useEffect(() => {
    // OTP UI ko disable rakha gaya hai. Registration now direct hai (without OTP).
    router.replace("/login");
  }, [router]);

  return null;
}

