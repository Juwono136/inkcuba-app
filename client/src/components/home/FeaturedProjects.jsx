import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ProjectCard from './ProjectCard';

const FEATURED_PROJECTS = [
  {
    id: '1',
    title: 'EduConnect Platform Redesign',
    category: 'UI/UX Design',
    description: 'A comprehensive redesign of the campus learning management system with improved accessibility and modern interface.',
    rating: '4.9',
    authorName: 'Jane Doe',
    authorAvatarUrl: null,
  },
  {
    id: '2',
    title: 'Smart Campus Chatbot',
    category: 'Artificial Intelligence',
    description: 'AI-powered chatbot to assist students with course information, schedules, and campus navigation.',
    rating: '5.0',
    authorName: 'John Smith',
    authorAvatarUrl: null,
  },
  {
    id: '3',
    title: 'Virtual Reality Campus Tour',
    category: 'Game Design',
    description: 'Immersive VR experience showcasing Binus University campus for prospective students and visitors.',
    rating: '4.8',
    authorName: 'Alice Johnson',
    authorAvatarUrl: null,
  },
  {
    id: '4',
    title: 'Mobile Learning App',
    category: 'Mobile Development',
    description: 'Cross-platform app for accessing course materials and submitting assignments on the go.',
    rating: '4.7',
    authorName: 'Bob Wilson',
    authorAvatarUrl: null,
  },
  {
    id: '5',
    title: 'Data Analytics Dashboard',
    category: 'Data Science',
    description: 'Interactive dashboard for visualizing academic performance and enrollment trends.',
    rating: '4.9',
    authorName: 'Carol Lee',
    authorAvatarUrl: null,
  },
  {
    id: '6',
    title: 'E-Commerce Redesign',
    category: 'UI/UX Design',
    description: 'User-centered redesign of an online store with improved checkout flow and accessibility.',
    rating: '4.6',
    authorName: 'David Kim',
    authorAvatarUrl: null,
  },
  {
    id: '7',
    title: 'Automated Grading System',
    category: 'Artificial Intelligence',
    description: 'ML-based tool to assist lecturers with consistent feedback and grading criteria.',
    rating: '5.0',
    authorName: 'Eva Martinez',
    authorAvatarUrl: null,
  },
  {
    id: '8',
    title: 'Sustainable Campus Map',
    category: 'Game Design',
    description: 'Gamified map encouraging eco-friendly routes and sustainability initiatives on campus.',
    rating: '4.8',
    authorName: 'Frank Chen',
    authorAvatarUrl: null,
  },
];

/**
 * Featured Projects section: slider with 8 cards, left/right buttons, and See more projects link.
 */
export default function FeaturedProjects() {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const step = 320;
    const newScrollLeft =
      scrollRef.current.scrollLeft + (direction === 'left' ? -step : step);
    scrollRef.current.scrollTo({
      left: Math.max(0, newScrollLeft),
      behavior: 'smooth',
    });
  };

  return (
    <section id="featured-projects" className="bg-[#F0F2E5] pt-12 sm:pt-14 md:pt-16 lg:pt-20 pb-12 md:pb-16 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[#303030] tracking-tight">
            Featured Projects
          </h2>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-base-300 bg-white text-[#303030] hover:bg-base-200 hover:border-[#3B613A]/30 hover:text-[#3B613A] transition-colors shadow-sm"
              aria-label="Previous projects"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-base-300 bg-white text-[#303030] hover:bg-base-200 hover:border-[#3B613A]/30 hover:text-[#3B613A] transition-colors shadow-sm"
              aria-label="Next projects"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="featured-projects-slider flex gap-4 sm:gap-5 overflow-x-auto overflow-y-hidden pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {FEATURED_PROJECTS.map((project) => (
            <div
              key={project.id}
              className="flex-shrink-0 w-[min(280px,85vw)] sm:w-[300px]"
            >
              <ProjectCard
                imageUrl={project.imageUrl}
                imageAlt={project.imageAlt}
                category={project.category}
                title={project.title}
                description={project.description}
                rating={project.rating}
                authorName={project.authorName}
                authorAvatarUrl={project.authorAvatarUrl}
                to="/projects"
              />
            </div>
          ))}
        </div>

        <div className="mt-8 sm:mt-10 flex justify-center">
          <Link
            to="/projects"
            className="inline-flex items-center justify-center h-11 px-8 rounded-xl bg-[#3B613A] hover:bg-[#4a7549] text-white font-medium text-sm sm:text-base transition-colors shadow-md shadow-[#3B613A]/20"
          >
            See more projects
          </Link>
        </div>
      </div>
    </section>
  );
}
