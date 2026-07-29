"use server";

import { prisma } from "@/lib/prisma";

export async function redeemStore(guestId: string, storeId: string, storeName: string) {
  await prisma.redemption.upsert({
    where: { guestId_storeId: { guestId, storeId } },
    update: {},
    create: { guestId, storeId, storeName },
  });
}
