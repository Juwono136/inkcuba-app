import { useSelector } from 'react-redux';
import Navbar from '../components/layout/Navbar';
import Loader from '../common/Loader';
import HeroSection from '../components/home/HeroSection';
import FeaturedProjects from '../components/home/FeaturedProjects';
import CategoriesSection from '../components/home/CategoriesSection';

export default function HomePage() {
  const { user, isAuthenticated, authLoading } = useSelector((state) => state.auth);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Loader size="lg" className="min-h-[50vh]" text="Loading..." />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F2E5]">
      <Navbar />
      <main className="flex-1">
        <HeroSection isAuthenticated={!!(isAuthenticated && user)} />
        <FeaturedProjects />
        <CategoriesSection />
      </main>
    </div>
  );
}
