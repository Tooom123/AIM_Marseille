"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Avatar from "./Avatar";
import { ME, useStore } from "@/lib/store";

const NAV = [
  { href: "/accueil", label: "Accueil", icon: HomeIcon },
  { href: "/carte", label: "Carte", icon: MapIcon },
  { href: "/agenda", label: "Agenda", icon: CalIcon },
  { href: "/reseau", label: "Réseau", icon: UsersIcon },
  { href: "/messages", label: "Messages", icon: ChatIcon },
  { href: "/marrainage", label: "Marrainage", icon: GiftIcon },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, events, unreadCount } = useStore();
  const nextEvent = [...events]
    .filter((e) => new Date(e.date) > new Date() && e.attendees.includes(ME))
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))[0];

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-line bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-4 sm:px-6">
          <Link href="/accueil" className="flex items-center gap-2.5">
            <Logo />
            <span className="hidden text-[15px] font-semibold tracking-tight sm:block">
              Les Épaulettes
            </span>
          </Link>

          <nav className="ml-4 hidden items-center gap-1 md:flex">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition ${
                    active ? "bg-turquoise/14 text-[#0E7C8C]" : "text-ink-soft hover:bg-cream hover:text-ink"
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                  {href === "/messages" && unreadCount > 0 && (
                    <span className="grid size-4 place-items-center rounded-full bg-rose text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {nextEvent && (
              <Link
                href="/agenda"
                className="hidden items-center gap-1.5 rounded-full bg-rose/12 px-3 py-1.5 text-xs font-medium text-[#C22B52] transition hover:bg-rose/20 lg:flex"
              >
                <span className="size-1.5 rounded-full bg-rose" />
                Prochain : {new Date(nextEvent.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
              </Link>
            )}
            <Link href="/profil" aria-label="Mon profil">
              <Avatar
                seed={profile.avatarSeed}
                first={profile.firstName || "É"}
                last={profile.lastName}
                photo={profile.photo} config={profile.avatar}
                size={36}
              />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 pb-28 pt-6 sm:px-6 md:pb-12">{children}</main>

      {/* Navigation mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-lg items-stretch justify-between px-2">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition ${
                  active ? "text-[#0E7C8C]" : "text-ink-soft"
                }`}
              >
                <Icon className={`size-5 ${active ? "" : "opacity-70"}`} />
                {label}
                {href === "/messages" && unreadCount > 0 && (
                  <span className="absolute right-[22%] top-1 grid size-4 place-items-center rounded-full bg-rose text-[9px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function Logo({ size = 34 }: { size?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="Les Épaulettes"
      width={size}
      height={size}
      priority
      className="shrink-0"
    />
  );
}

type IconProps = { className?: string };
const base = "none";

function HomeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H4a1 1 0 0 1-1-1z" strokeLinejoin="round" />
    </svg>
  );
}
function MapIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z" strokeLinejoin="round" />
      <path d="M9 4v14M15 6v14" />
    </svg>
  );
}
function CalIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  );
}
function UsersIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" strokeLinecap="round" />
      <path d="M16 5.5a3.2 3.2 0 0 1 0 6M18 20c0-2.6-1-4.4-2.5-5.2" strokeLinecap="round" />
    </svg>
  );
}
function ChatIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-5A8 8 0 1 1 21 12z" strokeLinejoin="round" />
    </svg>
  );
}
function GiftIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={base} stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="3" y="9" width="18" height="12" rx="2" />
      <path d="M3 13h18M12 9v12" />
      <path d="M12 9S9.5 4 7.5 4a2.5 2.5 0 0 0 0 5zM12 9s2.5-5 4.5-5a2.5 2.5 0 0 1 0 5z" strokeLinejoin="round" />
    </svg>
  );
}
