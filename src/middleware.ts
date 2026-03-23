import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const legacyAdminForm =
    pathname === "/admin/add-product" ||
    pathname.startsWith("/admin/edit-product/") ||
    pathname.endsWith("/admin/add-product") ||
    pathname.includes("/admin/edit-product/");
  if (legacyAdminForm) {
    const url = request.nextUrl.clone();
    const locale = pathname.startsWith("/ar/") ? "ar" : "fr";
    url.pathname = `/${locale}/admin/products`;
    return NextResponse.redirect(url);
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const url = request.nextUrl.clone();
    url.pathname = `/fr${pathname}`;
    return NextResponse.redirect(url);
  }
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", "/(fr|ar)/:path*", "/admin", "/admin/:path*"],
};
