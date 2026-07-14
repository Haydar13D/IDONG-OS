"use client";

import React, { useState } from "react";
import WidgetCard from "./WidgetCard";

interface QuestionCardProps {
  question: string;
  answer: string;
}

function QuestionCard({ question, answer }: QuestionCardProps) {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="rounded-lg border border-card-border bg-card p-4.5 shadow-sm space-y-3 transition duration-150 hover:border-muted-foreground/20">
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-sans text-xs font-semibold text-foreground leading-snug">
          {question}
        </h4>
        <button
          onClick={() => setShowAnswer(!showAnswer)}
          className="font-sans text-[10px] font-bold text-primary hover:underline whitespace-nowrap cursor-pointer"
        >
          {showAnswer ? "Sembunyikan" : "Buka Jawaban"}
        </button>
      </div>
      {showAnswer && (
        <p className="font-sans text-xs text-muted-foreground leading-relaxed bg-background/50 p-3 rounded border border-card-border/30 animate-fade-in font-mono text-[11px]">
          {answer}
        </p>
      )}
    </div>
  );
}

/**
 * InterviewPrep Component.
 * Dynamic review Q&A flashcards repository for tech interview practice.
 */
export default function InterviewPrep() {
  const flashcards = [
    {
      question: "Jelaskan perbedaan antaran REST API dan GraphQL!",
      answer: "REST API memiliki endpoint tetap untuk setiap resource, sehingga rentan over-fetching / under-fetching. GraphQL menggunakan satu endpoint pusat (/graphql) di mana client dapat menulis query khusus untuk mengambil data yang dibutuhkan saja.",
    },
    {
      question: "Apa perbedaan antara Server-Side Rendering (SSR) dan Static Site Generation (SSG) di Next.js?",
      answer: "SSG me-render halaman menjadi file HTML statis saat proses build (build time), sangat cepat dan hemat resource. SSR me-render halaman secara dinamis pada server setiap kali ada request masuk dari pengguna (request time), cocok untuk data dinamis yang sering berubah.",
    },
    {
      question: "Bagaimana cara kerja cookie SameSite=Strict dalam memitigasi serangan CSRF?",
      answer: "SameSite=Strict menginstruksikan peramban untuk tidak pernah mengirimkan cookie sesi bersama dengan request lintas situs (cross-site request). Jadi, jika pengguna mengklik link phishing dari email/situs lain yang mengarah ke aplikasi kita, cookie autentikasi tidak akan disertakan, sehingga request ilegal tersebut ditolak oleh middleware.",
    },
    {
      question: "Mengapa Singleton Pattern krusial saat menginisialisasi PrismaClient di Next.js development?",
      answer: "Fitur Hot Module Replacement (HMR) di Next.js development terus memuat ulang modul setiap kali kode berubah. Jika tidak menggunakan Singleton, instance PrismaClient baru akan terus dibuat di global context, mengakibatkan kebocoran koneksi dan database SQLite terkunci (database locked).",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-card-border pb-3">
        <h3 className="font-sans text-base font-bold text-foreground">Interview Preparation Bank</h3>
        <p className="font-sans text-xs text-muted-foreground mt-0.5">
          Gunakan kartu flashcard di bawah untuk mengasah pemahaman konsep teknologi Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {flashcards.map((card, i) => (
          <QuestionCard key={i} question={card.question} answer={card.answer} />
        ))}
      </div>
    </div>
  );
}
