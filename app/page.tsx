import { redirect } from "next/navigation";

type HomeSearchParams = Promise<{ auth?: string | string[] }>;

export default async function Home({
  searchParams,
}: {
  searchParams: HomeSearchParams;
}) {
  const q = await searchParams;
  const raw = q.auth;
  const auth = Array.isArray(raw) ? raw[0] : raw;
  if (auth === "login" || auth === "register") {
    redirect(`/dashboard?auth=${auth}`);
  }
  redirect("/dashboard");
}
