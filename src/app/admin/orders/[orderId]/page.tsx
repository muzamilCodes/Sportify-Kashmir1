import { redirect } from "next/navigation";

/**
 * Keep old/direct admin order URLs working. The orders screen owns the detail
 * modal, so redirect there with the selected order in the query string.
 */
export default async function AdminOrderRedirect({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  redirect(`/admin/orders?orderId=${encodeURIComponent(orderId)}`);
}
