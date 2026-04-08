/**
 * Discord Webhook 알림 (리드/결제 채널 분리)
 */

const LEADS_WEBHOOK_URL = process.env.DISCORD_LEADS_WEBHOOK_URL;
const PAYMENTS_WEBHOOK_URL = process.env.DISCORD_PAYMENTS_WEBHOOK_URL;

interface DiscordEmbed {
  title: string;
  description?: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text: string };
  timestamp?: string;
}

async function send(webhookUrl: string | undefined, embeds: DiscordEmbed[]) {
  if (!webhookUrl) {
    console.warn("[Discord] Webhook URL not set, skipping");
    return;
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds }),
    });

    if (!res.ok) {
      console.error("[Discord] Webhook failed:", res.status, await res.text());
    }
  } catch (err) {
    console.error("[Discord] Webhook error:", err);
  }
}

/** 새 리드 알림 → #leads 채널 */
export async function notifyNewLead(opts: {
  name: string | null;
  email: string | null;
  phone: string | null;
  score: number;
  interestLevel: string;
  interestedPlan: string;
  summary: string;
  painPoints: string[];
}) {
  const scoreEmoji = opts.score >= 70 ? "🔥" : opts.score >= 40 ? "⚡" : "💡";

  await send(LEADS_WEBHOOK_URL, [
    {
      title: `${scoreEmoji} New Lead — Score ${opts.score}/100`,
      color: opts.score >= 70 ? 0xef4444 : opts.score >= 40 ? 0xf59e0b : 0x6b7280,
      fields: [
        { name: "Name", value: opts.name || "Anonymous", inline: true },
        { name: "Email", value: opts.email || "-", inline: true },
        { name: "Phone", value: opts.phone || "-", inline: true },
        { name: "Interest", value: opts.interestLevel, inline: true },
        { name: "Plan", value: opts.interestedPlan || "Unknown", inline: true },
        { name: "Score", value: `${opts.score}/100`, inline: true },
        ...(opts.painPoints.length > 0
          ? [{ name: "Pain Points", value: opts.painPoints.join(", ") }]
          : []),
        { name: "Summary", value: opts.summary || "No summary" },
      ],
      footer: { text: "SajuLab Chatbot Lead" },
      timestamp: new Date().toISOString(),
    },
  ]);
}

/** 구독 결제 알림 → #payments 채널 */
export async function notifySubscription(opts: {
  event: "created" | "renewed" | "cancelled" | "failed";
  userName: string;
  userEmail: string;
  planName: string;
  amount?: string;
}) {
  const emojiMap = {
    created: "💰",
    renewed: "🔄",
    cancelled: "❌",
    failed: "⚠️",
  };
  const colorMap = {
    created: 0x22c55e,
    renewed: 0x3b82f6,
    cancelled: 0xef4444,
    failed: 0xf59e0b,
  };
  const titleMap = {
    created: "New Subscription",
    renewed: "Subscription Renewed",
    cancelled: "Subscription Cancelled",
    failed: "Payment Failed",
  };

  await send(PAYMENTS_WEBHOOK_URL, [
    {
      title: `${emojiMap[opts.event]} ${titleMap[opts.event]}`,
      color: colorMap[opts.event],
      fields: [
        { name: "User", value: opts.userName, inline: true },
        { name: "Email", value: opts.userEmail, inline: true },
        { name: "Plan", value: opts.planName, inline: true },
        ...(opts.amount ? [{ name: "Amount", value: opts.amount, inline: true }] : []),
      ],
      footer: { text: "SajuLab Payments" },
      timestamp: new Date().toISOString(),
    },
  ]);
}
