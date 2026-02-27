import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { FiArrowLeft } from 'react-icons/fi';

export default function PlaceholderPage({ title = 'Coming soon', message = 'This feature is under development.' }) {
  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-[#303030]">{title}</h1>
          <p className="mt-2 text-base-content/70">{message}</p>
          <Link to="/" className="btn btn-ghost mt-6 gap-2">
            <FiArrowLeft className="w-4 h-4" /> Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
