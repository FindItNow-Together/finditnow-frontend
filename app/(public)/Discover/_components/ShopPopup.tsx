export default function ShopPopup({ opportunity }: any) {
    return (
        <div className="p-2">
            <div className="font-semibold">{opportunity.shop.name}</div>
            <div className="text-sm">
                ₹{opportunity.price} ·{" "}
                {opportunity.shop.deliveryAvailable ? "Delivery" : "Pickup"}
            </div>
        </div>
    );
}
