import { NextRequest, NextResponse } from 'next/server'
import { match as matchLocale } from '@formatjs/intl-localematcher'

const locales = ['en', 'ar']
const defaultLocale = 'en'

function getLocale(request: NextRequest) {
  const acceptLanguage = request.headers.get('accept-language')
  if (!acceptLanguage) return defaultLocale

  const languages = acceptLanguage.split(',').map(lang => lang.split(';')[0])
  return matchLocale(languages, locales, defaultLocale)
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip if already has locale
  if (locales.some((loc) => pathname.startsWith(`/${loc}`))) {
    return NextResponse.next()
  }

  const locale = getLocale(request)
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - API routes
     * - Static files
    */
    '/((?!api|_next|.*\\..*).*)',
  ],
}
