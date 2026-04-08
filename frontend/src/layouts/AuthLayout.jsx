import { Outlet, Link } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-primary/10 rounded-b-[50%] transform -translate-y-1/2 scale-[1.5] z-0"></div>
      <div className="absolute bottom-0 right-[-10%] w-64 h-64 bg-info/10 rounded-full blur-3xl z-0"></div>
      <div className="absolute top-[20%] left-[-5%] w-48 h-48 bg-warning/10 rounded-full blur-3xl z-0"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-primary font-heading font-bold text-3xl">
          <span className="text-4xl hover:rotate-12 transition-transform">🌍</span>
          LingoVoyage
        </Link>
        <h2 className="mt-6 text-center text-3xl font-heading font-extrabold text-gray-900">
          Chào mừng trở lại!
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Học ngoại ngữ qua từng bước chân.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-[450px] z-10">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100 backdrop-blur-xl animate-fade-in relative z-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
