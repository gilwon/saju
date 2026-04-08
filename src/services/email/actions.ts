"use server";

import { getResend } from "@/lib/resend/client";
import WelcomeEmail from "@/components/emails/WelcomeEmail";

interface SendWelcomeEmailParams {
  email: string;
  userName: string;
  planName?: string;
  locale?: "en" | "ko";
}

export async function sendWelcomeEmail({
  email,
  userName,
  planName = "Basic",
  locale = "en",
}: SendWelcomeEmailParams) {
  const resend = getResend();
  if (!resend) {
    console.warn("Resend not configured, skipping welcome email");
    return { error: "Email service not configured" };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const dashboardUrl = `${baseUrl}/${locale}/dashboard`;

  const subjects = {
    en: "Welcome to SajuLab! 🎉",
    ko: "사주랩에 오신 것을 환영해요! 🎉",
  };

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@resend.dev",
      to: [email],
      subject: subjects[locale],
      react: WelcomeEmail({
        userName,
        planName,
        dashboardUrl,
        locale,
      }),
    });

    if (error) {
      console.error("Resend Error:", error);
      return { error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Email Sending Failed:", error);
    return { error: "Failed to send email" };
  }
}
