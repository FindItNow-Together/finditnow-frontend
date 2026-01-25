import OrderDetails from "@/app/(protected)/orders/[id]/OrderDetails";

interface PageProps {
  params: Promise<{ id: string }>;
}

const OrderDetailsPage = async ({ params }: PageProps) => {
  const { id } = await params;
  return <OrderDetails id={id} />;
};

export default OrderDetailsPage;
