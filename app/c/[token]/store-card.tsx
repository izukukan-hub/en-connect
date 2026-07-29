"use client";

import { useState, useTransition } from "react";
import type { Store } from "@/lib/notion";
import { redeemStore } from "./actions";

export function StoreCard({
  store,
  guestId,
  initiallyUsed,
}: {
  store: Store;
  guestId: string;
  initiallyUsed: boolean;
}) {
  const [used, setUsed] = useState(initiallyUsed);
  const [isPending, startTransition] = useTransition();

  function handleRedeem() {
    const ok = window.confirm(
      `【店舗スタッフの方へ】\n「${store.name}」のクーポンを使用済みにします。よろしいですか？`,
    );
    if (!ok) return;

    startTransition(async () => {
      await redeemStore(guestId, store.id, store.name);
      setUsed(true);
    });
  }

  return (
    <div className="flex gap-4 rounded-lg border p-4">
      {store.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={store.imageUrl}
          alt={store.name}
          className="h-20 w-20 shrink-0 rounded object-cover"
        />
      )}
      <div className="flex flex-1 flex-col gap-1">
        <h2 className="font-semibold">{store.name}</h2>
        {store.address && <p className="text-xs text-gray-500">{store.address}</p>}
        {store.description && <p className="text-sm text-gray-700">{store.description}</p>}
        {store.couponText && (
          <p className="mt-1 text-sm font-medium text-rose-600">{store.couponText}</p>
        )}
        <div className="mt-2">
          {used ? (
            <span className="inline-block rounded bg-gray-200 px-3 py-1 text-sm text-gray-500">
              使用済み
            </span>
          ) : (
            <button
              type="button"
              onClick={handleRedeem}
              disabled={isPending}
              className="rounded bg-black px-3 py-1 text-sm text-white disabled:opacity-50"
            >
              {isPending ? "処理中..." : "来店済みにする（店舗スタッフ操作）"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
