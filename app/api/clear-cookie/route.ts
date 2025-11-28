import {NextResponse} from "next/server";

export default async function POST(request: Request) {
    const res = NextResponse.json({ok: true});

    res.cookies.set("refresh_token", "", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        maxAge: 0
    });

    return res;
}