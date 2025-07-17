// ✅ /app/(site)/[locale]/layout.tsx
import type { ReactNode } from "react";

export default function LocaleLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
