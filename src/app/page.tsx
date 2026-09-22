"use client";
import { Fredoka } from "next/font/google";
import piaf from "../../public/piaf.png";
import Image from "next/image";

const fredoka = Fredoka({
  weight: "600",
  subsets: ["latin"],
});

import { SubmitEvent, useEffect, useState } from "react";
import type { CEFRLevel, ChatMessage, TutorResponse } from "../../types/tutor";

export default function Home() {
  const [level, setLevel] = useState<CEFRLevel>("A1");
  const [input, setInput] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content:
        "Bonjour! Je suis Piaf, ton tuteur du français. Comment ça va aujourd'hui ?",
    },
  ]);

  const [weakAreas, setWeakAreas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] =
    useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    function loadVoices() {
      const frenchVoices = window.speechSynthesis
        .getVoices()
        .filter((voice) => voice.lang.startsWith("fr"));
      voices.forEach((voice) => {
        console.log(voice.name, voice.lang, voice.localService);
      });

      setVoices(frenchVoices);

      if (frenchVoices.length > 0) {
        setSelectedVoice(frenchVoices[0]);
      }
    }

    loadVoices();

    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  function speakFrench(text: string) {
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = "fr-FR";
    utterance.rate = 0.7;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    window.speechSynthesis.cancel();

    window.speechSynthesis.speak(utterance);
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedInput = input.trim();

    if (!trimmedInput || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedInput,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          level,

          messages: updatedMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),

          weakAreas,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to get a response from Piaf.");
      }

      const data: TutorResponse = await response.json();

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply,
        corrections: data.corrections,
      };

      setMessages((current) => [...current, assistantMessage]);

      setWeakAreas((current) => [...new Set([...current, ...data.weaknesses])]);
    } catch (err) {
      console.error(err);

      setError("Something went wrong while contacting your French tutor.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="w-full bg-[#FFF9ED]">
      <div className="mx-auto flex w-full flex-col gap-5">
        {/* NAVBAR */}
        <nav
          className="
        grid w-full grid-cols-[1fr_auto_1fr]
        items-center
        rounded-[2rem]
        border-2 border-yellow-100
        bg-yellow-200
        px-7 py-4
        shadow-lg
      "
        >
          {/* Logo */}
          <div className="flex items-center gap-2 justify-self-start">
            <Image
              src={piaf}
              alt="Yellow sparrow"
              className="h-12 w-12
                object-contain
                rounded-2xl
                bg-orange-100
                p-1.5
                shadow-[0_4px_12px_rgba(251,146,60,0.35)]"
            />

            <h1
              className={`
          ${fredoka.className}
          justify-self-start
          text-4xl
          text-orange-400
        `}
            >
              Piaf
            </h1>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-4">
            <button
              className="
            rounded-2xl border-2 border-indigo-500
            bg-indigo-300 px-5 py-2
            font-semibold
            shadow-[0_4px_0_#6366f1]
            transition
            hover:translate-y-1
            hover:shadow-none
          "
            >
              Reading
            </button>

            <button
              className="
            rounded-2xl border-2 border-pink-500
            bg-pink-300 px-5 py-2
            font-semibold
            shadow-[0_4px_0_#ec4899]
            transition
            hover:translate-y-1
            hover:shadow-none
          "
            >
              Writing
            </button>

            <button
              className="
            rounded-2xl border-2 border-red-500
            bg-red-300 px-5 py-2
            font-semibold
            shadow-[0_4px_0_#ef4444]
            transition
            hover:translate-y-1
            hover:shadow-none
          "
            >
              Listening
            </button>

            <button
              className="
            rounded-2xl border-2 border-teal-500
            bg-teal-300 px-5 py-2
            font-semibold
            shadow-[0_4px_0_#14b8a6]
            transition
            hover:translate-y-1
            hover:shadow-none
          "
            >
              Speaking
            </button>
          </div>

          {/* Empty column keeps navigation perfectly centered */}
          <div />
        </nav>

        <div className="min-h-[calc(100vh-120px)] bg-[#FFF9ED] px-4 py-6">
          {/* Main Chat Container */}
          <div
            className="
      mx-auto flex h-[calc(100vh-165px)] max-w-5xl flex-col
      overflow-hidden rounded-[2rem]
      border-2 border-orange-200
      bg-[#FFFDF8]
      shadow-lg
    "
          >
            {/* TOP CONTROLS */}
            <div
              className="
        flex items-center justify-end gap-4
        border-b border-orange-100
        bg-yellow-50
        px-6 py-4
      "
            >
              {/* Proficiency */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="level"
                  className="text-sm font-semibold text-orange-700"
                >
                  Proficiency
                </label>

                <select
                  id="level"
                  value={level}
                  onChange={(event) =>
                    setLevel(event.target.value as CEFRLevel)
                  }
                  className="
            cursor-pointer rounded-2xl
            border-2 border-orange-200
            bg-white px-3 py-2
            text-sm
            outline-none
            transition
            focus:border-orange-400
          "
                >
                  <option value="A1">A1 - Beginner</option>
                  <option value="A2">A2 - Elementary</option>
                  <option value="B1">B1 - Intermediate</option>
                  <option value="B2">B2 - Upper Intermediate</option>
                  <option value="C1">C1 - Advanced</option>
                </select>
              </div>

              {/* French Voice */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-orange-700">
                  Voice
                </label>

                <select
                  value={selectedVoice?.name ?? ""}
                  onChange={(e) => {
                    const voice = voices.find((v) => v.name === e.target.value);

                    if (voice) {
                      setSelectedVoice(voice);
                    }
                  }}
                  className="
            max-w-[220px]
            cursor-pointer rounded-2xl
            border-2 border-orange-200
            bg-white px-3 py-2
            text-sm
            outline-none
            transition
            focus:border-orange-400
          "
                >
                  {voices.map((voice) => (
                    <option key={voice.voiceURI} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* CHAT MESSAGES */}
            <section
              className="
    flex-1 space-y-6
    overflow-y-auto
    px-8 py-8
    md:px-12
  "
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={
                    message.role === "user"
                      ? `
            relative
            ml-auto max-w-[70%]
            rounded-[1.5rem]
            rounded-br-md
            border border-orange-200
            bg-orange-100
            px-5 py-4
          `
                      : `
            relative
            ml-5 mr-auto max-w-[70%]
            rounded-[1.5rem]
            rounded-bl-md
            border border-yellow-200
            bg-yellow-50
            px-5 py-4
            shadow-sm
          `
                  }
                >
                  {/* Piaf avatar */}
                  {message.role === "assistant" && (
                    <Image
                      src={piaf}
                      alt="Piaf"
                      className="
                          absolute
                          -left-12
                          -bottom-7
                          h-11 w-11
                          object-contain
                          rounded-full
                          bg-yellow-100
                          p-1
                          shadow-md
                        "
                    />
                  )}

                  {/* Message heading */}
                  <div className="flex items-center justify-between gap-5">
                    <strong className="text-sm text-orange-700">
                      {message.role === "user" ? "You" : "Piaf"}
                    </strong>

                    {message.role === "assistant" && (
                      <button
                        type="button"
                        onClick={() => speakFrench(message.content)}
                        className="
              flex h-9 w-9 items-center justify-center
              rounded-full
              bg-yellow-200
              transition
              hover:scale-110
              hover:bg-yellow-300
            "
                        title="Listen"
                      >
                        🔊
                      </button>
                    )}
                  </div>

                  {/* Message */}
                  <p className="mt-2 leading-7 text-gray-800">
                    {message.content}
                  </p>

                  {/* Corrections */}
                  {message.corrections?.map((correction, index) => (
                    <div
                      key={index}
                      className="
            mt-4
            rounded-2xl
            border border-orange-100
            bg-white/80
            p-4
          "
                    >
                      <p className="text-sm">
                        <strong className="mr-2 text-red-500">✕</strong>
                        {correction.original}
                      </p>

                      <p className="mt-2 text-sm">
                        <strong className="mr-2 text-green-600">✓</strong>
                        {correction.corrected}
                      </p>

                      <p className="mt-3 text-sm leading-6 text-gray-600">
                        {correction.explanation}
                      </p>

                      <span
                        className="
              mt-3 inline-block
              rounded-full
              bg-yellow-100
              px-3 py-1
              text-xs text-orange-700
            "
                      >
                        {correction.category}
                      </span>
                    </div>
                  ))}
                </div>
              ))}

              {/* Loading */}
              {isLoading && (
                <div className="ml-5 mr-auto w-fit rounded-2xl bg-yellow-50 px-4 py-3 text-sm text-orange-500">
                  Piaf is thinking... 🐥
                </div>
              )}
            </section>

            {/* Error */}
            {error && <p className="px-6 pb-2 text-sm text-red-500">{error}</p>}

            {/* BOTTOM MESSAGE BAR */}
            <div
              className="
        border-t border-orange-100
        bg-yellow-50
        px-5 py-4
      "
            >
              <form
                onSubmit={handleSubmit}
                className="mx-auto flex max-w-4xl items-center gap-3"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Écris ton message en français..."
                  disabled={isLoading}
                  className="
            flex-1
            rounded-2xl
            border-2 border-orange-200
            bg-white
            px-5 py-3
            outline-none
            transition
            placeholder:text-gray-400
            focus:border-orange-400
            focus:ring-2
            focus:ring-orange-100
          "
                />

                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="
            rounded-2xl
            border-2 border-orange-500
            bg-orange-400
            px-6 py-3
            font-semibold text-white
            shadow-[0_4px_0_#c2410c]
            transition

            hover:translate-y-[2px]
            hover:bg-orange-500
            hover:shadow-[0_2px_0_#c2410c]

            disabled:cursor-not-allowed
            disabled:opacity-40
          "
                >
                  {isLoading ? "..." : "Send"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <footer
        className="
            mt-6
            flex
            w-full
            items-center
            justify-center
            py-4
            text-sm
            text-orange-500
          "
      >
        © Maitreyee 💛 2026
      </footer>
    </main>
  );
}
