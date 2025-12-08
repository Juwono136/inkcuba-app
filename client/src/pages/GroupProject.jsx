import Navbar from '../components/Navbar.jsx'
import ResourceCard from '../components/ResourceCard.jsx'



export default function GroupProject() {
    return (
        <>
            <Navbar />

            {/* ====== page container ====== */}
            <div className="min-h-screen bg-white">
                <div className="breadcrumbs text-sm text-black mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-20 bg-white">
                    {/* Breadcrumbs */}
                    <ul className="flex gap-6 p-4 items-center flex-wrap">
                        <li><a>Projects</a></li>
                        <li><a>Computer Science</a></li>
                        <li>AI-Powered Task Manager</li>
                    </ul>

                    {/* ====== two-column layout: main + sidebar ====== */}
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8">
                        {/* Main content column */}
                        <main className="space-y-6">
                            {/* Card to Display Project begins */}
                            <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm mb-5">
                                <a href="#">
                                    <img className="rounded-t-lg w-full object-cover" src="src/assets/Aiproject.jpg" alt="" />
                                </a>

                                <div className="p-5">
                                    <a href="#">
                                        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">AI Use in automated targetting system with Foresight Using Quantum Processors</h5>
                                    </a>

                                    <div className="flex items-center rounded-lg p-2 mb-4 border border-gray-200">
                                        <div className='shrink-0 p-4'>
                                            <img className="h-10 w-10 rounded-full" src="src/assets/Diona.png" alt="lecturer"/>
                                        </div>
                                        <div className="flex-1 min-w-0 ms-4">
                                            <p className="text-sm font-bold text-gray-900 truncate">
                                                Lecturer
                                            </p>
                                            <p className="text-sm text-gray-900 truncate">
                                                Professor Diona
                                            </p>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            {/* Card to Display Project ends */}

                            {/* Detailed Project Information Card begins */}
                            <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                                <div className="p-6">
                                    <h5 className="mb-4 text-2xl font-bold tracking-tight text-gray-900 ">
                                        AI Use in automated targetting system with Foresight Using Quantum Processors
                                    </h5>

                                    {/* Info cards row */}
                                    <div className="w-full mb-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="bg-gray-100 border border-gray-200 rounded-lg p-3">
                                                <h2 className="text-sm font-semibold">Timeline</h2>
                                                <p className="text-sm text-gray-600">2024-2025</p>
                                            </div>

                                            <div className="bg-gray-100 border border-gray-200 rounded-lg p-3">
                                                <h2 className="text-sm font-semibold">Program</h2>
                                                <span className="text-sm text-gray-600">Computer Science</span>
                                            </div>

                                            <div className="bg-gray-100 border border-gray-200 rounded-lg p-3">
                                                <h2 className="text-sm font-semibold">Course</h2>
                                                <p className="text-sm text-gray-600">Artificial Intelligence</p>
                                            </div>

                                            <div className="bg-gray-100 border border-gray-200 rounded-lg p-3">
                                                <h2 className="text-sm font-semibold">Approved by</h2>
                                                <p className="text-sm text-gray-600">Professor Diona</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Project Description */}
                                    <div>
                                        <p className="text-lg font-medium text-gray-700 mb-2">Project Description</p>
                                        <p className="text-sm text-gray-700">
                                            This AI-powered task manager is a comprehensive web application designed to help users organize, prioritize, and manage their daily tasks efficiently. The application leverages machine learning algorithms to provide intelligent task suggestions, deadline predictions, and productivity insights. Users can create tasks, set deadlines, and categorize them based on priority levels. The AI component analyzes user behavior and task patterns to offer personalized recommendations, such as optimal times for task completion and reminders for upcoming deadlines. Additionally, the application features a user-friendly interface with drag-and-drop functionality, making it easy to rearrange tasks and track progress. Overall, this project aims to enhance productivity and time management through the integration of AI technologies.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {/* Detailed Project Information Card ends */}

                            {/* Project Resources */}
                            <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm mb-10">
                                <div className="p-6">
                                    <h5 className="mb-5 text-2xl font-bold tracking-tight text-gray-900">Project Resources</h5>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <ResourceCard 
                                            title="Live Demo" 
                                            subtitle="View the working application" 
                                            link="https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
                                            linkLabel="Watch Live Video Demo"
                                            videoUrl="https://www.youtube.com/watch?v=jfKfPfyJRdk"
                                        />

                                        <ResourceCard
                                            title="Source Code"
                                            subtitle="Github Repository"
                                            actions={[
                                                { type: 'link', label: 'Open Repository', href: 'https://github.com/EMIRBEN001/NotReally_Pacman_AI_DS_Project' },
                                                { type: 'download', label: 'Download ZIP (main)', href: 'https://github.com/your-username/your-repo/archive/refs/heads/main.zip' },
                                            ]}
                                       />

                                        <ResourceCard 
                                            title="Documentation" 
                                            subtitle="Project Report and Documentation" 
                                            link="https://example.com/docs" 
                                            linkLabel="Open Docs"
                                            pdfUrl="/docs/project-documentation.pdf"
                                        />

                                        <ResourceCard 
                                            title="Video Demo" 
                                            subtitle="Project Presentation video" 
                                            link="https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
                                            linkLabel="Watch Presentation Video"
                                            videoUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                                            
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* Project Resources ends */}
                        </main>

                        {/* Sidebar (right column) */}
                        <aside className="w-full">
                            <div className="sticky space-y-2">
                                {/* Project Collaborators */}
                                <div className="w-full p-6 bg-white border border-gray-200 rounded-lg mb-">
                                    <h5 className="mb-2 text-2xl font-normal tracking-tight text-gray-900">Contributors</h5>
                                    <div className="flex items-center rounded-lg mb-1">
                                        <div className='shrink-0 p-2 mb-2 mt-2'>
                                            <img className="h-10 w-10 rounded-full" src="src/assets/Diona.png" alt="project" />
                                        </div>
                                        <div className="flex-1 min-w-0 ms-4">
                                            <p className="text-sm font-bold text-gray-900 truncate">Diona Grace</p>
                                            <p className="text-sm text-gray-900 truncate">Team Leader</p>
                                        </div>
                                    </div>


                                    <div className="flex items-center rounded-lg mb-1">
                                        <div className='shrink-0 p-2 mb-2 mt-2'>
                                            <img className="h-10 w-10 rounded-full" src="src/assets/Diona.png" alt="project" />
                                        </div>
                                        <div className="flex-1 min-w-0 ms-4">
                                            <p className="text-sm font-bold text-gray-900 truncate">Amuro Ray</p>
                                            <p className="text-sm text-gray-900 truncate">Figma</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center rounded-lg mb-1">
                                        <div className='shrink-0 p-2 mb-2 mt-2'>
                                            <img className="h-10 w-10 rounded-full" src="src/assets/Diona.png" alt="project" />
                                        </div>
                                        <div className="flex-1 min-w-0 ms-4">
                                            <p className="text-sm font-bold text-gray-900 truncate">Tem Ray</p>
                                            <p className="text-sm text-gray-900 truncate">Back-End Developer</p>
                                        </div>
                                    </div>


                                    <div className="flex items-center rounded-lg mb-1">
                                        <div className='shrink-0 p-2 mb-2 mt-2'>
                                            <img className="h-10 w-10 rounded-full" src="src/assets/Diona.png" alt="project" />
                                        </div>
                                        <div className="flex-1 min-w-0 ms-4">
                                            <p className="text-sm font-bold text-gray-900 truncate">Seabook Arno</p>
                                            <p className="text-sm text-gray-900 truncate">Front-End Developer</p>
                                        </div>
                                    </div>


                                </div>
                                {/* Project Tags */}
                                <div className="w-full p-6 bg-white border border-gray-200 rounded-lg mb-4">
                                    <h5 className="mb-5 text-2xl font-normal tracking-tight text-gray-900">Project Tags</h5>
                                    <div className="text-black rounded-lg flex flex-wrap gap-3">
                                        <div className="badge badge-neutral badge-outline">Artificial Intelligence</div>
                                        <div className="badge badge-neutral badge-dash">React</div>
                                        <div className="badge badge-neutral badge-outline">Node.Js</div>
                                        <div className="badge badge-neutral badge-dash">Web App</div>
                                    </div>
                                </div>

                                {/* More Projects */}
                                <div className="w-full p-6 bg-white border border-gray-200 rounded-lg">
                                    <h5 className="mb-5 text-2xl font-normal tracking-tight text-gray-900">More Projects</h5>

                                    <div className="flex items-center rounded-lg mb-2 border border-gray-200">
                                        <div className='shrink-0 p-4'>
                                            <img className="h-10 w-10 rounded-full" src="src/assets/Diona.png" alt="project" />
                                        </div>
                                        <div className="flex-1 min-w-0 ms-4">
                                            <p className="text-sm font-bold text-gray-900 truncate">Mobile Suit Circuit</p>
                                            <p className="text-sm text-gray-900 truncate">Tem Ray</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center rounded-lg mb-2 border border-gray-200">
                                        <div className='shrink-0 p-4'>
                                            <img className="h-10 w-10 rounded-full" src="src/assets/Diona.png" alt="project" />
                                        </div>
                                        <div className="flex-1 min-w-0 ms-4">
                                            <p className="text-sm font-bold text-gray-900 truncate">Psycho Frame for NT</p>
                                            <p className="text-sm text-gray-900 truncate">Amuro Ray</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center rounded-lg mb-2 border border-gray-200">
                                        <div className='shrink-0 p-4'>
                                            <img className="h-10 w-10 rounded-full" src="src/assets/Diona.png" alt="project" />
                                        </div>
                                        <div className="flex-1 min-w-0 ms-4">
                                            <p className="text-sm font-bold text-gray-900 truncate">Minovsky Particle Visualizer</p>
                                            <p className="text-sm text-gray-900 truncate">Professor Diona</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>

                <footer className="w-full bg-neutral-300 py-6 px-8 flex items-center justify-between">
                    {/* Left side */}
                    <div className="flex items-center gap-3 text-gray-700">
                        <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        className="fill-gray-700"
                        >
                            <path d="M22.672 15.226l-2.432.811.841 2.515c...."></path>
                        </svg>

                        <span className="text-lg font-semibold">Inkcuba</span>
                    </div>

                    {/* Right side */}
                    <p className="text-gray-700 text-sm">
                        © 2025 ProjectHub. All rights reserved.
                    </p>
                </footer>
                
            </div>
        </>
    )
}