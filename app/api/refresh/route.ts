import {NextRequest, NextResponse} from "next/server";
import {cookies} from "next/headers";

export async function POST(request: NextRequest) {
    const cookieStore = await cookies();

    const refreshToken = cookieStore.get("refresh_token")?.value

    if (!refreshToken) {
        return NextResponse.json({error: "missing_refresh_token"});
    }

    return fetch("http://localhost/api/auth/refresh", {method: "POST"})
}