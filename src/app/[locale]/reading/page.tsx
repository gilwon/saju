import { Suspense } from "react";
import SajuLayout from "@/components/saju/layout/SajuLayout";
import ReadingClient from "./ReadingClient";

export default function ReadingPage() {
  return (
    <SajuLayout>
      <Suspense>
        <ReadingClient />
      </Suspense>
    </SajuLayout>
  );
}
