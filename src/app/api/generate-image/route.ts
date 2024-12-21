import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;

    console.log("Received prompt:", text);

    const api = process.env.api; // Ensure you have API_URL defined in your .env file
    const modalEndpoint = api;
    console.log("Calling Modal endpoint:", modalEndpoint);

    const response = await fetch(
      `${modalEndpoint}?prompt=${encodeURIComponent(text)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    console.log("Modal response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response from Modal:", errorText);
      throw new Error(
        `Failed to generate image: ${response.status} ${errorText}`
      );
    }

    const data = await response.json();
    const imageBytes = Buffer.from(data.image_bytes, "hex");
    const base64Image = `data:image/jpeg;base64,${imageBytes.toString("base64")}`;

    return NextResponse.json({
      success: true,
      image: base64Image,
      caption: data.caption,
    });
  } catch (error) {
    console.error("Detailed error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to generate image",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
