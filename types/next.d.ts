// next.d.ts pada root project
import "next/server";

declare module "next/server" {
  interface NextRequest {
    params?: Record<string, string>;
  }
}
