import { redirect } from "@/i18n/routing";
import { createClient } from "@/utils/supabase/server";
import { getProfiles } from "@/services/saju/profile-actions";
import SajuLayout from "@/components/saju/layout/SajuLayout";
import ProfilesClient from "./ProfilesClient";

export default async function MyProfilesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: "/", locale: "ko" });
    return null;
  }

  const { data: profiles } = await getProfiles();

  return (
    <SajuLayout>
      <main className="max-w-3xl mx-auto px-5 py-8">
        <h1 className="text-2xl font-bold text-[#191F28] mb-6">
          내 프로필
        </h1>
        <ProfilesClient initialProfiles={profiles} />
      </main>
    </SajuLayout>
  );
}
