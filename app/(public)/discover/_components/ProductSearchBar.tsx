export default function ProductSearchBar({
  value,
  onChange,
  category,
  onCategoryChange,
}: {
  value: string;
  onChange: (v: string) => void;
  category: string;
  onCategoryChange: (v: string) => void;
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm flex gap-4">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search products..."
        className="flex-1 outline-none"
      />
      <select value={category} onChange={(e) => onCategoryChange(e.target.value)}>
        <option value="all">All</option>
        <option value="grocery">Grocery</option>
        <option value="bakery">Bakery</option>
      </select>
    </div>
  );
}
