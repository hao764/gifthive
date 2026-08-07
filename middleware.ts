import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale } from "./i18n/config";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip for static assets and internal routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    /\.(svg|png|jpg|jpeg|gif|ico|css|js|woff2?)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Read locale from cookie
  let locale = request.cookies.get("NEXT_LOCALE")?.value;

  // If no cookie, detect from Accept-Language
  if (!locale) {
    const acceptLanguage = request.headers.get("Accept-Language") || "";
    const matched = locales.find((loc) =>
      acceptLanguage.toLowerCase().startsWith(loc)
    );
    locale = matched || defaultLocale;
  }

  // Validate locale
  if (!locales.includes(locale as (typeof locales)[number])) {
    locale = defaultLocale;
  }

  // Set locale cookie and continue
  const response = NextResponse.next();
  response.cookies.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 31536000, // 1 year
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
