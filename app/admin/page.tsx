import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { GuestForm } from "./guest-form";
import { CopyLinkButton } from "./copy-link-button";
import { logout } from "./actions";

export const dynamic = "force-dynamic";

function formatDate(date: Date | null): string {
  if (!date) return "-";
  return date.toLocaleDateString("ja-JP");
}

export default async function AdminPage() {
  const guests = await prisma.guest.findMany({
    orderBy: { createdAt: "desc" },
    include: { redemptions: true },
  });

  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const origin = `${protocol}://${host}`;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">クーポンURL管理</h1>
        <form action={logout}>
          <button type="submit" className="text-sm text-gray-500 underline">
            ログアウト
          </button>
        </form>
      </div>

      <GuestForm />

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500">
            <th className="py-2">お客様名</th>
            <th className="py-2">チェックイン</th>
            <th className="py-2">チェックアウト</th>
            <th className="py-2">来店済み数</th>
            <th className="py-2">クーポンURL</th>
          </tr>
        </thead>
        <tbody>
          {guests.map((guest) => {
            const url = `${origin}/c/${guest.token}`;
            return (
              <tr key={guest.id} className="border-b">
                <td className="py-2">{guest.name ?? "-"}</td>
                <td className="py-2">{formatDate(guest.checkIn)}</td>
                <td className="py-2">{formatDate(guest.checkOut)}</td>
                <td className="py-2">{guest.redemptions.length}</td>
                <td className="py-2">
                  <div className="flex items-center gap-2">
                    <span className="max-w-[220px] truncate text-gray-600">{url}</span>
                    <CopyLinkButton url={url} />
                  </div>
                </td>
              </tr>
            );
          })}
          {guests.length === 0 && (
            <tr>
              <td colSpan={5} className="py-6 text-center text-gray-400">
                まだお客様が登録されていません
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
