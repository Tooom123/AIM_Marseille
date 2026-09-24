"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Shell from "./Shell";
import { useStore } from "@/lib/store";

/** Tant que le profil n'est pas rempli, on renvoie vers l'onboarding. */
export default function Guard({ children }: { children: React.ReactNode }) {
  const { profile, ready } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (ready && !profile.onboarded) router.replace("/bienvenue");
  }, [ready, profile.onboarded, router]);

  if (!ready || !profile.onboarded) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <div className="size-8 animate-spin rounded-full border-2 border-line border-t-turquoise" />
      </div>
    );
  }

  return <Shell>{children}</Shell>;
}
