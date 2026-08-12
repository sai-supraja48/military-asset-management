export default function FormField({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input {...props} className="mt-1 w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300" />
    </label>
  );
}
