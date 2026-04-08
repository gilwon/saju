import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import SajuLayout from "@/components/saju/layout/SajuLayout";
import CoinShopClient from "@/components/saju/coin-shop/CoinShopClient";

export default async function CoinShopPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/ko?login=required");
  }

  // user_stars에서 잔액 조회 (없으면 신규 유저 → 3개 보너스로 생성)
  let { data: stars } = await supabase
    .from("user_stars")
    .select("balance")
    .eq("user_id", user.id)
    .single();

  if (!stars) {
    await supabase
      .from("user_stars")
      .insert({ user_id: user.id, balance: 3 });
    stars = { balance: 3 };
  }

  return (
    <SajuLayout>
      <CoinShopClient
        totalCoins={stars.balance}
        userId={user.id}
        userEmail={user.email}
      />
    </SajuLayout>
  );
}
