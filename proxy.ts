import type {NextRequest} from "next/server";
import {NextResponse} from "next/server";

export function proxy(req: NextRequest) {
    const refresh = req.cookies.get("refresh_token")?.value;

    if (!refresh) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!login|sign_up|verify_otp|forgot_password|api|_next|favicon.ico).*)",
    ],
};