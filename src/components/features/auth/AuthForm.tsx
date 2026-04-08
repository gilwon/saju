"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { loginWithEmail, signUpWithEmail } from "@/services/auth/actions";

export function AuthForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (mode === "login") {
      const result = await loginWithEmail(email, password);
      if (result?.error) setError(result.error);
    } else {
      const result = await signUpWithEmail(email, password);
      if (result?.error) setError(result.error);
      else setSuccess("가입 확인 이메일을 발송했습니다. 이메일을 확인해주세요.");
    }
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-[380px]">
      <CardHeader>
        <CardTitle>사주랩 {mode === "login" ? "로그인" : "회원가입"}</CardTitle>
        <CardDescription>
          {mode === "login" ? "이메일과 비밀번호로 로그인하세요." : "새 계정을 만드세요."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-3">
          <Input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="비밀번호 (6자 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
          )}
          {success && (
            <p className="text-xs text-green-600 bg-green-500/10 rounded-lg px-3 py-2">{success}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "처리 중..." : mode === "login" ? "로그인" : "회원가입"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); setSuccess(null); }}
          className="w-full mt-3 text-xs text-center text-muted-foreground hover:text-foreground transition-colors"
        >
          {mode === "login" ? "계정이 없으신가요? 회원가입" : "이미 계정이 있으신가요? 로그인"}
        </button>

        <p className="text-xs text-center text-muted-foreground mt-4">
          로그인하면{" "}
          <Link href="/terms" className="underline hover:text-primary">이용약관</Link>{" "}
          및{" "}
          <Link href="/privacy-policy" className="underline hover:text-primary">개인정보처리방침</Link>
          에 동의하게 됩니다.
        </p>
      </CardContent>
    </Card>
  );
}
