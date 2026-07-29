import { Client } from "@notionhq/client";
import type {
  PageObjectResponse,
  QueryDataSourceParameters,
} from "@notionhq/client/build/src/api-endpoints";
import { unstable_cache } from "next/cache";

export type Store = {
  id: string;
  name: string;
  description: string;
  address: string;
  couponText: string;
  imageUrl: string | null;
};

function getClient() {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error("NOTION_TOKEN is not set");
  return new Client({ auth: token });
}

function plainText(prop: PageObjectResponse["properties"][string] | undefined): string {
  if (!prop) return "";
  if (prop.type === "title") return prop.title.map((t) => t.plain_text).join("");
  if (prop.type === "rich_text") return prop.rich_text.map((t) => t.plain_text).join("");
  return "";
}

function firstImageUrl(prop: PageObjectResponse["properties"][string] | undefined): string | null {
  if (!prop || prop.type !== "files" || prop.files.length === 0) return null;
  const file = prop.files[0];
  if (file.type === "external") return file.external.url;
  if (file.type === "file") return file.file.url;
  return null;
}

function pageCoverUrl(page: PageObjectResponse): string | null {
  const cover = page.cover;
  if (!cover) return null;
  if (cover.type === "external") return cover.external.url;
  if (cover.type === "file") return cover.file.url;
  return null;
}

function toStore(page: PageObjectResponse): Store {
  const props = page.properties;
  return {
    id: page.id,
    name: plainText(props["Name"] ?? props["名前"]),
    description: plainText(props["Description"] ?? props["説明"] ?? props["概要"]),
    address: plainText(props["Address"] ?? props["住所"]),
    couponText: plainText(props["Coupon"] ?? props["クーポン内容"]),
    imageUrl: firstImageUrl(props["Image"] ?? props["画像"]) ?? pageCoverUrl(page),
  };
}

/** Notion「Stores」データベースの最初のデータソースIDを取得する */
async function getStoresDataSourceId(notion: Client, databaseId: string): Promise<string> {
  const database = await notion.databases.retrieve({ database_id: databaseId });
  const dataSourceId = "data_sources" in database ? database.data_sources[0]?.id : undefined;
  if (!dataSourceId) throw new Error("No data source found on the Stores database");
  return dataSourceId;
}

/** Notion「Stores」データベースから、公開中（Active）の店舗一覧を取得する（60秒キャッシュ） */
export const getActiveStores = unstable_cache(
  fetchActiveStores,
  ["active-stores"],
  { revalidate: 60 },
);

async function fetchActiveStores(): Promise<Store[]> {
  const databaseId = process.env.NOTION_STORES_DATABASE_ID;
  if (!databaseId) throw new Error("NOTION_STORES_DATABASE_ID is not set");

  const notion = getClient();
  const filterProperty = process.env.NOTION_STORES_ACTIVE_PROPERTY ?? "クーポン対象";
  const dataSourceId = await getStoresDataSourceId(notion, databaseId);

  const query: QueryDataSourceParameters = {
    data_source_id: dataSourceId,
    filter: {
      property: filterProperty,
      checkbox: { equals: true },
    },
  };

  const results: PageObjectResponse[] = [];
  let cursor: string | undefined;
  do {
    const response = await notion.dataSources.query({ ...query, start_cursor: cursor });
    results.push(...(response.results as PageObjectResponse[]));
    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return results.map(toStore);
}
