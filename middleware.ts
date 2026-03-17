import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const { auth } = NextAuth(authConfig)

const securityHeaders = new Headers({
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-XSS-Protection": "1; mode=block",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
})

const LOCALES = ["he", "en", "pl"]
const DEFAULT_LOCALE = "he"

const SKIP_LOCALE_PREFIXES = ["/admin", "/api", "/login", "/_next", "/favicon.ico"]

function shouldSkipLocaleRouting(pathname: string): boolean {
  return SKIP_LOCALE_PREFIXES.some(prefix => pathname.startsWith(prefix)) ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$/.test(pathname)
}

function getPathnameLocale(pathname: string): string | null {
  const segments = pathname.split("/")
  if (segments.length > 1 && LOCALES.includes(segments[1])) {
    return segments[1]
  }
  return null
}

function detectLocale(req: NextRequest): string {
  const cookieLocale = req.cookies.get("NEXT_LOCALE")?.value
  if (cookieLocale && LOCALES.includes(cookieLocale)) {
    return cookieLocale
  }

  const acceptLang = req.headers.get("Accept-Language")
  if (acceptLang) {
    const preferred = acceptLang.split(",").map(l => l.split(";")[0].trim().split("-")[0])
    for (const lang of preferred) {
      if (LOCALES.includes(lang)) {
        return lang
      }
    }
  }

  return DEFAULT_LOCALE
}

export default auth((req) => {
  const response = NextResponse.next()

  securityHeaders.forEach((value, key) => {
    response.headers.set(key, value)
  })

  const { pathname } = req.nextUrl

  if (shouldSkipLocaleRouting(pathname)) {
    return response
  }

  const pathnameLocale = getPathnameLocale(pathname)

  if (pathnameLocale) {
    response.cookies.set("NEXT_LOCALE", pathnameLocale, { path: "/", maxAge: 31536000 })
    return response
  }

  const locale = detectLocale(req)
  const url = req.nextUrl.clone()
  url.pathname = `/${locale}${pathname}`
  const redirectResponse = NextResponse.redirect(url)
  redirectResponse.cookies.set("NEXT_LOCALE", locale, { path: "/", maxAge: 31536000 })

  securityHeaders.forEach((value, key) => {
    redirectResponse.headers.set(key, value)
  })

  return redirectResponse
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
