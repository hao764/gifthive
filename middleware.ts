import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { url, headers } = request;
  const host = headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  // 旧 Netlify 域名遗留链接 → 跳新首页（301，永久）
  if (
    host === "giftfinder.netlify.app" ||
    host === "gifthive.netlify.app" ||
    host.endsWith(".giftfinder.netlify.app") ||
    host.endsWith(".gifthive.netlify.app")
  ) {
    return NextResponse.redirect(new URL("/", url), 301);
  }

  // 把 /favicon.ico 重定向到 SVG favicon（避免 404）
  if (pathname === "/favicon.ico") {
    return NextResponse.redirect(new URL("/favicon.svg", url), 301);
  }

  return NextResponse.next();
}

// 关键：收紧 matcher，只处理真正需要拦截的路径
// 绝对不要碰 /_next/*、/public 静态文件、/ph/* 等，否则会导致边缘侧静态资源 404 算 4xx
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static build assets)
     * - _next/image  (image optimization)
     * - .svg/.png/.jpg/.jpeg/.gif/.webp/.ico 等静态图片
     * - ph/*  (Product Hunt 画廊图片)
     * - favicon.svg, icon.svg, robots.txt, sitemap.xml
     * - manifest files (.json, .webmanifest)
     */
    "/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest|json|css|js|woff|woff2|ttf|eot)$|ph/|favicon\\.svg|icon\\.svg|robots\\.txt|sitemap\\.xml).*)",
  ],
};
