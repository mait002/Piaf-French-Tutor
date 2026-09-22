import { NextResponse } from "next/server";
import { createTutorPrompt } from "../../../../lib/tutorPrompt";
import { format } from "path";

const schema = {
    type: "object",
    properties: {
        reply: {
            type: "string"
        },

        corrections: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    original: { type: "string" },
                    corrected: { type: "string" },
                    category: { type: "string" },
                    explanation: { type: "string" }
                },

                required: [
                    "original",
                    "corrected",
                    "category",
                    "explanation"
                ]
            }
        },
        weaknesses: {
            type: "array",
            items: {
                type: "string"
            }
        }
    },
    required: [
        "reply",
        "corrections",
        "weaknesses"
    ]
};

export async function POST(request: Request) {
    const {
        level,
        messages,
        weakAreas
    } = await request.json();
    
    const systemPrompt = createTutorPrompt(level, weakAreas);

    const response = await fetch(
        "http://localhost:11434/api/chat",

        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                model: "qwen3:4b-instruct",

                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    ...messages
                ],
                format: schema,

                stream: false,

                options: {
                    temperature: 0.4
                }
            })
        }
    );

    const data = await response.json();

    const result = JSON.parse(
        data.message.content
    );

    const total_latency = JSON.parse(
        data.total_duration
    );
    console.log("Total latency: ", total_latency)

    return NextResponse.json(result);
}