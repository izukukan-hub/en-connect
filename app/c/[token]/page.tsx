import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getActiveStores, type Store } from "@/lib/notion";
import { StoreCard } from "./store-card";

export default async function GuestCouponPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const guest = await prisma.guest.findUnique({
    where: { token },
    include: { redemptions: true },
  });
  if (!guest) notFound();

  let stores: Store[] = [];
  let loadError = false;
  try {
    stores = await getActiveStores();
  } catch {
    loadError = true;
  }

  const usedStoreIds = new Set(guest.redemptions.map((r) => r.storeId));

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-1 text-xl font-semibold">
        {guest.name ? `${guest.name}様` : "ご宿泊のお客様"}限定クーポン
      </h1>
      <p className="mb-8 text-sm text-gray-500">伊東エリアの提携店舗でご利用いただけます。</p>

      {loadError && (
        <p className="text-sm text-red-500">
          店舗情報の取得に失敗しました。時間をおいて再度お試しください。
        </p>
      )}

      <div className="flex flex-col gap-4">
        {stores.map((store) => (
          <StoreCard
            key={store.id}
            store={store}
            guestId={guest.id}
            initiallyUsed={usedStoreIds.has(store.id)}
          />
        ))}
        {!loadError && stores.length === 0 && (
          <p className="text-gray-400">現在ご利用いただけるクーポンはありません。</p>
        )}
      </div>
    </div>
  );
}
