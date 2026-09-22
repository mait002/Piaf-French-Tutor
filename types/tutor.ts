export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1";

export type Correction = {
    original: string;
    corrected: string;
    category: string;
    explanation: string;
};

export type TutorResponse = {
    reply: string;
    corrections: Correction[];
    weaknesses: string[];
};

export type ChatMessage = {
    id: string;
    role: "user" | "assistant";
    content: string;
    corrections?: Correction[];
}