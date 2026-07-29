"use client";

import { useActionState, useRef, useEffect } from "react";
import { createGuest } from "./actions";

export function GuestForm() {
  const [state, formAction, pending] = useActionState(createGuest, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state && !state.error) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="mb-8 flex flex-wrap items-end gap-3">
      <div className="flex flex-col">
        <label className="text-sm text-gray-600">お客様名（任意）</label>
        <input name="name" className="rounded border px-3 py-2" placeholder="山田様" />
      </div>
      <div className="flex flex-col">
        <label className="text-sm text-gray-600">チェックイン</label>
        <input type="date" name="checkIn" className="rounded border px-3 py-2" />
      </div>
      <div className="flex flex-col">
        <label className="text-sm text-gray-600">チェックアウト</label>
        <input type="date" name="checkOut" className="rounded border px-3 py-2" />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {pending ? "発行中..." : "URLを発行"}
      </button>
    </form>
  );
}
