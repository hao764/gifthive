import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { url, headers } = request;
  const host = headers.get("host") || "";

  // 旧 Netlify 域名遗留链接 → 跳新首页
  if (
    host === "giftfinder.netlify.app" ||
    host === "gifthive.netlify.app" ||
    host.endsWith(".giftfinder.netlify.app") ||
    host.endsWith(".gifthive.netlify.app")
  ) {
    return NextResponse.redirect(new URL("/", url), 301);
  }

  // 把 /favicon.ico 重定向到 SVG favicon（避免 404）
  if (request.nextUrl.pathname === "/favicon.ico") {
    return NextResponse.redirect(new URL("/favicon.svg", url), 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/((?!_next/static|_next/image|favicon.svg).*)",
  ],
};
