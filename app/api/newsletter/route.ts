import { NextResponse } from "next/server";

// In-memory subscriber storage for launch notifications
const subscribers: Array<{ email: string; createdAt: string }> = [];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Zadejte prosím platnou e-mailovou adresu." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const alreadyExists = subscribers.some((s) => s.email === trimmedEmail);

    if (!alreadyExists) {
      subscribers.push({
        email: trimmedEmail,
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Váš e-mail byl úspěšně zaregistrován.",
    });
  } catch {
    return NextResponse.json(
      { error: "Došlo k chybě při ukládání e-mailu." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    count: subscribers.length,
    subscribers,
  });
}
