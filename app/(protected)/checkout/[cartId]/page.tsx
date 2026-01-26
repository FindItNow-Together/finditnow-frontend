import { redirect } from "next/navigation";
import Checkout from "@/app/(protected)/checkout/[cartId]/Checkout";

export default async function CheckoutSP({ params }: { params: Promise<{ cartId: string }> }) {
  const { cartId } = await params;

  if (!cartId) redirect("/cart");

  return <Checkout cartId={cartId} />;
}
