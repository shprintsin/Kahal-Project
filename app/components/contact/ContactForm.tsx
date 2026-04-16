"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const TURNSTILE_SITEKEY = "0x4AAAAAAC-d2seHpwP8sGzQ";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const t = useTranslations();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot

  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [errorKey, setErrorKey] = useState<string | null>(null);

  // Load the Turnstile script once and render the widget explicitly.
  useEffect(() => {
    const SCRIPT_ID = "cf-turnstile-script";

    function renderWidget() {
      if (!containerRef.current || !window.turnstile) return;
      // Avoid double-rendering if already rendered.
      if (widgetIdRef.current !== null) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: TURNSTILE_SITEKEY,
        callback: (token) => setTurnstileToken(token),
        "expired-callback": () => setTurnstileToken(null),
        "error-callback": () => setTurnstileToken(null),
        theme: "light",
      });
    }

    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = renderWidget;
      document.head.appendChild(script);
    } else if (window.turnstile) {
      // Script already loaded (e.g. hot reload).
      renderWidget();
    }

    return () => {
      if (widgetIdRef.current !== null && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

  function resetWidget() {
    setTurnstileToken(null);
    if (widgetIdRef.current !== null && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnstileToken) return;
    setStatus("submitting");
    setErrorKey(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          website,
          cfTurnstileToken: turnstileToken,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        const code = body.error || "send_failed";
        setStatus("error");
        setErrorKey(code);
        resetWidget();
        return;
      }
      setStatus("success");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      resetWidget();
    } catch {
      setStatus("error");
      setErrorKey("network_error");
      resetWidget();
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 p-6 text-green-900">
        <h2 className="text-lg font-semibold mb-2">
          {t("public.contact.successTitle", "Message sent")}
        </h2>
        <p className="text-sm">
          {t(
            "public.contact.successBody",
            "Thanks for reaching out — we'll get back to you soon."
          )}
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => setStatus("idle")}
        >
          {t("public.contact.sendAnother", "Send another message")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="contact-name">
            {t("public.contact.name", "Name")}
          </Label>
          <Input
            id="contact-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            maxLength={120}
            autoComplete="name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email">
            {t("public.contact.email", "Email")}
          </Label>
          <Input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={200}
            autoComplete="email"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-subject">
          {t("public.contact.subject", "Subject")}
        </Label>
        <Input
          id="contact-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={200}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-message">
          {t("public.contact.message", "Message")}
        </Label>
        <Textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          minLength={10}
          maxLength={5000}
          rows={7}
        />
      </div>

      {/* Honeypot — hidden from real users, bots tend to fill every field. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-10000px",
          top: "auto",
          width: "1px",
          height: "1px",
          overflow: "hidden",
        }}
      >
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      {/* Cloudflare Turnstile widget — rendered explicitly via JS */}
      <div ref={containerRef} />

      {status === "error" && errorKey && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900"
        >
          {t(`public.contact.errors.${errorKey}`, errorKey)}
        </div>
      )}

      <div className="pt-2">
        <Button
          type="submit"
          disabled={status === "submitting" || !turnstileToken}
          className="min-w-[140px]"
        >
          {status === "submitting" ? (
            <>
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
              {t("public.contact.sending", "Sending…")}
            </>
          ) : (
            t("public.contact.send", "Send message")
          )}
        </Button>
      </div>
    </form>
  );
}
