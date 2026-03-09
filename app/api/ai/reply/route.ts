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

    const { emailSubject, emailFrom, emailBody, tone, userName } =
      await request.json();

    if (!emailBody && !emailSubject) {
      return NextResponse.json(
        { error: "Email content is required" },
        { status: 400 }
      );
    }

    // initialize Gemini client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    // map tone to instruction for the AI
    const toneInstruction =
      tone === "professional"
        ? "Write the reply in a formal and respectful tone suitable for business communication. Use polite language and complete sentences. Avoid slang or overly casual expressions."
        : tone === "casual"
          ? "Write the reply in a relaxed and conversational tone while still being respectful. Keep it short and natural, similar to how colleagues might communicate informally."
          : "Write the reply in a warm and approachable tone while still maintaining professionalism. Be polite and positive, but slightly more relaxed than formal business language.";

    const cleanBody =
      typeof emailBody === "string"
        ? emailBody.replace(/<[^>]*>/g, " ").trim().slice(0, 4000)
        : "";

    const prompt = `You are an AI assistant that helps users write email replies.

Your task is to generate a clear and appropriate reply to the provided email.

Rules:
- Always respect proper email structure.
- Keep the response concise, clear, and relevant to the email.
- Maintain the requested tone (friendly, casual, or professional).
- Do not invent information that was not mentioned in the email.
- If the email contains questions, answer them clearly.
- If the email requests action, acknowledge it politely.

Email structure to follow:

Greeting
Short acknowledgement of the message
Main response or answers
Optional closing sentence
Sign-off

Example structure:

Hello [Name],

Thank you for your message.

[Main reply here]

Best regards,
[Sender Name]

${userName && typeof userName === "string" ? `The sender's name is ${userName.trim()}. Use this exact name in the sign-off instead of [Sender Name] or [Your Name].` : ""}

Tone: ${tone === "professional" ? "Professional" : tone === "casual" ? "Casual" : "Friendly"}.

${toneInstruction}

Reply with only the email body text, no subject line.`;

    const fullPrompt = `${prompt}

Original email:
From: ${emailFrom ?? "Unknown"}
Subject: ${emailSubject ?? "(no subject)"}

${cleanBody}`;

    const result = await model.generateContent(fullPrompt);
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
