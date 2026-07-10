"use client";

import React, { useState, useTransition } from "react";
import { handleLogin } from "./actions";

/**
 * LoginPage view component.
 * Renders a secure centered PIN entry card matching the design guidelines.
 */
export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!pin) {
      setError("Please enter your passcode.");
      return;
    }

    startTransition(async () => {
      const result = await handleLogin(pin);
      if (result && result.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-lg border border-card-border bg-card p-6 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground">
            IDONG OS
          </h1>
          <p className="font-sans text-sm text-muted-foreground mt-1">
            Enter passcode to access terminal
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="passcode"
              className="block font-sans text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2"
            >
              Passcode
            </label>
            <input
              id="passcode"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••••••"
              disabled={isPending}
              className="w-full rounded border border-card-border bg-background px-3 py-2 font-mono text-center text-lg tracking-widest text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
              maxLength={12}
            />
          </div>

          {error && (
            <p className="font-sans text-xs text-destructive text-center font-medium">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded bg-primary px-4 py-2 font-sans text-sm font-semibold text-primary-foreground transition hover:opacity-90 active:opacity-100 disabled:opacity-50 cursor-pointer"
          >
            {isPending ? "Authenticating..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
