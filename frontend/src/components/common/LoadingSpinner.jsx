export default function LoadingSpinner({ message = "Đang tải dữ liệu..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin-slow"></div>
      {message && <p className="mt-4 text-gray-500 text-sm font-medium">{message}</p>}
    </div>
  );
}
