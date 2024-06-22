import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface Request {
  nextUrl: URL;
}

const PROJECT_PLAN_CSV = /^\/downloads\/project-plan-\w+.csv$/;

export default function middleware(request: NextRequest): NextResponse {
  if (request.nextUrl.pathname.startsWith("/downloads/")) {
    request.nextUrl.pathname = `/api${request.nextUrl.pathname}`;
    return NextResponse.rewrite(request.nextUrl);
  }

  return NextResponse.next();
}
