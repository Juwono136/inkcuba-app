import Navbar from './Navbar';

export default function AuthLayout({ children, title, subtitle, loading = false }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F0F2E5]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-8 relative">
        <div className="w-full max-w-[420px]">
          <div className="relative bg-base-100 rounded-3xl shadow-xl border border-base-200/60 overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-[#3B613A] to-[#4a7549]" aria-hidden="true" />
            <div className="p-8 sm:p-10">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <span className="loading loading-spinner loading-lg text-[#3B613A]" />
                  <p className="mt-4 text-sm text-base-content/60">Please wait...</p>
                </div>
              ) : (
                <>
                  {title && (
                    <h1 className="text-2xl font-bold text-[#303030] text-center tracking-tight">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-center text-base-content/60 text-sm mt-2">
                      {subtitle}
                    </p>
                  )}
                  <div className="mt-8">
                    {children}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-4 text-sm text-[#5a5a5a]">
        Inkcuba · Binus University International
      </footer>
    </div>
  );
}
