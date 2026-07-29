"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, createSessionToken, verifyAdminPassword } from "@/lib/auth";

export async function login(_prevState: { error: string } | undefined, formData: FormData) {
  const password = String(formData.get("password") ?? "");

  if (!verifyAdminPassword(password)) {
    return { error: "パスワードが違います" };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect("/admin");
}
