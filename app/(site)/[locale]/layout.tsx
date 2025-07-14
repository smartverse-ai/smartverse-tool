// app/(site)/[locale]/layout.tsx

import { ReactNode } from 'react'

export default function LocaleLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
