"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="mb-6 text-xl font-semibold">管理画面ログイン</h1>
      <form action={formAction} className="flex flex-col gap-4">
        <input
          type="password"
          name="password"
          placeholder="パスワード"
          required
          className="rounded border px-3 py-2"
        />
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {pending ? "確認中..." : "ログイン"}
        </button>
      </form>
    </div>
  );
}
