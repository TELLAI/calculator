"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";

type NavigationContextValue = {
  navigate: (url: string) => void;
  navigating: boolean;
};

const NavigationContext = createContext<NavigationContextValue>({
  navigate: () => {},
  navigating: false,
});

export function useNavigation() {
  return useContext(NavigationContext);
}

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [navigating, setNavigating] = useState(false);

  const navigate = useCallback(
    (url: string) => {
      setNavigating(true);
      router.push(url);
    },
    [router],
  );

  useEffect(() => {
    setNavigating(false);
  }, [pathname]);

  return (
    <NavigationContext.Provider value={{ navigate, navigating }}>
      {navigating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-10 py-8 shadow-xl">
            <svg
              className="h-10 w-10 animate-spin text-[var(--accent)]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <p className="text-sm font-medium text-[var(--foreground)]">
              Chargement…
            </p>
          </div>
        </div>
      )}
      {children}
    </NavigationContext.Provider>
  );
}
