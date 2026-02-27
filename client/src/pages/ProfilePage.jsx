import { useSelector } from 'react-redux';
import Navbar from '../components/layout/Navbar';

export default function ProfilePage() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-base-100 rounded-2xl border border-base-200/80 p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-[#303030] tracking-tight">Edit profile</h1>
          <p className="mt-2 text-sm text-[#303030]/60">
            Profile editing will be available soon. For now, this page is a placeholder for the upcoming profile feature.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="p-4 rounded-xl bg-base-200/40 border border-base-200/60">
              <p className="text-xs text-[#303030]/50">Name</p>
              <p className="mt-1 font-medium text-[#303030]">{user?.name || '-'}</p>
            </div>
            <div className="p-4 rounded-xl bg-base-200/40 border border-base-200/60">
              <p className="text-xs text-[#303030]/50">Email</p>
              <p className="mt-1 font-medium text-[#303030]">{user?.email || '-'}</p>
            </div>
            <div className="p-4 rounded-xl bg-base-200/40 border border-base-200/60">
              <p className="text-xs text-[#303030]/50">Role</p>
              <p className="mt-1 font-medium text-[#303030] capitalize">{user?.role || '-'}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

