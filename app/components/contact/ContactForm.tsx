"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";

interface CaptchaState {
  question: string;
  token: string;
}

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const t = useTranslations();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captcha, setCaptcha] = useState<CaptchaState | null>(null);
  const [captchaLoading, setCaptchaLoading] = useState(false);

  const [status, setStatus] = useState<Status>("idle");
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const loadCaptcha = useCallback(async () => {
    setCaptchaLoading(true);
    setCaptchaAnswer("");
    try {
      const res = await fetch("/api/contact/captcha", { cache: "no-store" });
      if (!res.ok) throw new Error("captcha_fetch_failed");
      const data = (await res.json()) as CaptchaState;
      setCaptcha(data);
    } catch {
      setCaptcha(null);
    } finally {
      setCaptchaLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCaptcha();
  }, [loadCaptcha]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captcha) return;
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
          captchaToken: captcha.token,
          captchaAnswer,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        const code = body.error || "send_failed";
        setStatus("error");
        setErrorKey(code);
        if (code === "captcha_failed") void loadCaptcha();
        return;
      }
      setStatus("success");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setCaptchaAnswer("");
      void loadCaptcha();
    } catch {
      setStatus("error");
      setErrorKey("network_error");
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

      <div className="space-y-2">
        <Label htmlFor="contact-captcha">
          {t("public.contact.captchaLabel", "Anti-spam check")}
        </Label>
        <div className="flex items-center gap-3">
          <span
            className="inline-flex min-w-[120px] items-center justify-center rounded-md border bg-muted px-3 py-2 font-mono text-sm"
            aria-live="polite"
          >
            {captchaLoading || !captcha ? "…" : captcha.question}
          </span>
          <Input
            id="contact-captcha"
            inputMode="numeric"
            value={captchaAnswer}
            onChange={(e) => setCaptchaAnswer(e.target.value)}
            required
            className="max-w-[120px]"
            autoComplete="off"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => void loadCaptcha()}
            aria-label={t("public.contact.captchaRefresh", "Refresh challenge")}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

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
          disabled={status === "submitting" || !captcha}
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
