import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Generates an AI-powered email reply using Google Gemini.
export async function POST(request: Request) {
  try {
    // ensure API key is configured 
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOGLE_AI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // parse and validate request body
    const { emailSubject, emailFrom, emailBody, tone } = await request.json();

    if (!emailBody && !emailSubject) {
      return NextResponse.json(
        { error: "Email content is required" },
        { status: 400 }
      );
    }

    // initialize Gemini client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // map tone to instruction for the AI
    const toneInstruction =
      tone === "professional"
        ? "Write in a professional, formal tone."
        : tone === "casual"
          ? "Write in a casual, friendly tone."
          : "Write in a warm, friendly but balanced tone.";

    // Build the prompt: original email + tone instruction
    const cleanBody =
      typeof emailBody === "string"
        ? emailBody.replace(/<[^>]*>/g, " ").trim().slice(0, 4000)
        : "";

    const prompt = `You are helping to draft an email reply. Write a concise, appropriate reply to this email.

Original email:
From: ${emailFrom ?? "Unknown"}
Subject: ${emailSubject ?? "(no subject)"}

${cleanBody}

${toneInstruction}
Reply with only the email body text, no subject line. Keep it brief (2-4 sentences unless more is needed).`;

    // call Gemini and extract the generated reply
    const result = await model.generateContent(prompt);
    const response = result.response;
    const reply = response.text()?.trim() ?? "";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("AI reply error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate reply" },
      { status: 500 }
    );
  }
}
