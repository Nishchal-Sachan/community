import { redirect } from "next/navigation";

export default async function MarriageProfileAliasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/matrimony/profile/${id}`);
}
