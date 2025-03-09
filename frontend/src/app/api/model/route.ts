import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const backendUrl = "http://localhost:8000/api/model";
  try {
    const body = await req.json();
    console.log("API Route received body:", body);

    const forwardedBody = JSON.stringify(body);
    console.log("Forwarded body to backend:", forwardedBody);

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: forwardedBody,
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Backend response error:", response.status, response.statusText, data);
      return NextResponse.json({ error: data.error || "Backend error" }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("API Route error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}