"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth";

export async function createGuest(_prevState: { error: string | null } | undefined, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const checkInRaw = String(formData.get("checkIn") ?? "");
  const checkOutRaw = String(formData.get("checkOut") ?? "");

  await prisma.guest.create({
    data: {
      name: name || null,
      checkIn: checkInRaw ? new Date(checkInRaw) : null,
      checkOut: checkOutRaw ? new Date(checkOutRaw) : null,
    },
  });

  revalidatePath("/admin");
  return { error: null };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  redirect("/admin/login");
}
