import Navbar from '../components/Navbar.jsx'
import { useState } from "react";

export default function ReviseProjectSubm() {
  const [projectReport, setProjectReport] = useState({
    name: "Final_Project_Report.pdf",
    size: "2.4 MB",
    type: "pdf",
  });

  const [additionalFiles, setAdditionalFiles] = useState([
    { name: "Technical_Documentation.docx", size: "1.8 MB", type: "docx" },
    { name: "Presentation_Slides.pptx", size: "5.2 MB", type: "pptx" },
  ]);

  const removeAdditional = (index) => {
    setAdditionalFiles(additionalFiles.filter((_, i) => i !== index));
  };

  return (
    <div>
      <Navbar />
        <div className="min-h-screen bg-gray-100">
            <div className="p-4 max-w-3xl mx-auto text-black"> 
                {/* ---------------- PAGE TITLE + STATUS TAG ---------------- */}
                <div className="flex items-center justify-between mb-6 text-black">
                    <div>
                        <h1 className="text-xl font-normal">Revise Project Submission</h1>
                        <p className="text-sm text-gray-600">
                            Review feedback and update your project submission
                        </p>
                    </div>

                    <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full border">
                    ● Under Review
                    </span>
                </div>


                <div className="w-full p-6 bg-white border border-gray-200 rounded-lg mb-3">
                    {/* ---------------- LECTURER FEEDBACK SECTION ---------------- */}
                    <h2 className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 text-gray-700"
                        viewBox="0 0 24 24"
                        fill="none"
                        >
                        <path
                            d="M3 5h18M3 12h18M3 19h18"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                        </svg>
                        Lecturer Feedback
                    </h2>

                    {/* ---------------- FEEDBACK CARD ---------------- */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex gap-3">
                        {/* Avatar */}
                        <div className="avatar">
                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700">
                            👩‍🏫
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <p className="font-medium">Dr. Sarah Johnson</p>
                            <p className="text-xs text-gray-500 mb-2">January 15, 2025</p>

                            <p className="text-sm text-gray-700 leading-relaxed">
                            Please update the following items:
                            <br />1) Add more detailed technical documentation,
                            <br />2) Include proper citations in your report,
                            <br />3) Update the live demo URL as it's currently not accessible,
                            <br />4) Add team member contribution details.
                            </p>
                        </div>
                        </div>
                    </div>

                </div>



                <div className="w-full p-6 bg-white border border-gray-200 rounded-lg mb-3">
                    <h1 className="mb-2 text-lg font-normal tracking-tight text-gray-900">Project Information</h1>
                        <div className="flex items-center rounded-lg mb-1">
                            <div className="flex-1 min-w-0 ms-2">
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend text-gray-500 truncate text-sm font-normal">Project Title</legend>
                                    <input type="text" placeholder="Enter Project Title" className="w-full input input-md bg-white border border-gray-300 rounded-lg text-black" />
                                </fieldset>
                            </div>
                        </div>
                </div>

                <div className="w-full mb-5 p-4 bg-white border border-gray-200 rounded-lg mb-">
                    <h1 className="mb-2 text-lg font-normal tracking-tight text-gray-900">Submitter Information</h1>
                        <div className="flex items-center rounded-lg mb-1">
                            <div className='shrink-0 p-2 mt-2'>
                                <img className="h-15 w-15 rounded-full" src="src/assets/Diona.png" alt="project" />
                            </div>
                            <div className="flex-1 min-w-0 ms-4">
                                <p className="text-sm font-bold text-black truncate">Diona Grace</p>
                                <p className="text-sm text-gray-500 truncate">Student ID: STU-2025-001</p>
                                <p className="text-sm text-gray-500 truncate">dionaspecial@university.edu</p>
                            </div>
                        </div>
                </div>

                <div className="w-full p-6 bg-white border border-gray-200 rounded-lg mb-3">
                    <h1 className="text-lg font-normal tracking-tight text-gray-900">Team Collaborators</h1>
                    <h3 className="font-normal text-sm tracking-tight text-gray-600 mb-2">Add your team members and define their roles in this project</h3>
                        <div className="flex items-center rounded-lg mb-4 gap-2">
                            <div className="avatar avatar-placeholder">
                                <div className="bg-gray-200 text-neutral-content w-10 rounded-full">
                                    <span className="text-lg text-black">+</span>
                                </div>
                            </div>

                            <fieldset className="fieldset w-full">
                                <input type="text" placeholder="Search team members by name or email" className="input input-md bg-white border border-gray-300 rounded-lg text-black w-full" />
                            </fieldset>

                            <button className="btn btn-neutral join-item rounded-lg shadow">Add Member</button>
                        </div>

                        <div className="flex items-center rounded-lg mb-1">
                            <div className="flex-1 min-w-0 ms-2">
                                <div className="w-full p-6 bg-white border border-gray-200 rounded-lg mb-3"> 
                                        <div className="flex items-center rounded-lg mb-4 mt-4">
                                            <div className="avatar avatar-placeholder">
                                                <div className="bg-neutral text-neutral-content w-16 rounded-full">
                                                    <span className="text-xl">AR</span>
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0 ms-4">
                                                <p className="text-sm font-bold text-black truncate">Amuro Ray</p>
                                                <p className="text-sm text-gray-500 truncate">amuro.ray@gmail.com</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-rows">
                                            <div className="flex-1 min-w-0">
                                                <fieldset className="fieldset">
                                                    <legend className="fieldset-legend text-gray-500 truncate text-xs font-normal">Role</legend>
                                                    <input type="text" placeholder="Describe your role in this project" className="w-full input input-md bg-white border border-gray-300 rounded-lg text-black" />
                                                </fieldset>
                                            </div>
                                                
                                            <div className="flex-1 min-w-0">
                                                <fieldset className="fieldset">
                                                    <legend className="fieldset-legend text-gray-500 truncate text-xs font-normal">Responsibilities (Optional) (shown only for lecturers)</legend>
                                                    <textarea className="textarea h-24 w-full bg-white border border-gray-300 text-gray-500" placeholder="Describe your project contribution in detail . . . . ."></textarea>
                                                </fieldset>
                                            </div>
                                        </div>
                                </div>


                                <div className="w-full p-6 bg-white border border-gray-200 rounded-lg mb-3"> 
                                        <div className="flex items-center rounded-lg mb-4 mt-4">
                                            <div className="avatar avatar-placeholder">
                                                <div className="bg-neutral text-neutral-content w-16 rounded-full">
                                                    <span className="text-xl">CA</span>
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0 ms-4">
                                                <p className="text-sm font-bold text-black truncate">Char Aznable</p>
                                                <p className="text-sm text-gray-500 truncate">sieg.zeon@gmail.com</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-rows">
                                            <div className="flex-1 min-w-0">
                                                <fieldset className="fieldset">
                                                    <legend className="fieldset-legend text-gray-500 truncate text-xs font-normal">Role</legend>
                                                    <input type="text" placeholder="Describe your role in this project" className="w-full input input-md bg-white border border-gray-300 rounded-lg text-black" />
                                                </fieldset>
                                            </div>
                                                
                                            <div className="flex-1 min-w-0">
                                                <fieldset className="fieldset">
                                                    <legend className="fieldset-legend text-gray-500 truncate text-xs font-normal">Responsibilities (Optional) (shown only for lecturers)</legend>
                                                    <textarea className="textarea h-24 w-full bg-white border border-gray-300 text-gray-500" placeholder="Describe your project contribution in detail . . . . ."></textarea>
                                                </fieldset>
                                            </div>
                                        </div>
                                </div>

                            </div>
                        </div>
                </div>


                <div className="w-full p-6 bg-white border border-gray-200 rounded-lg mb-3"> 
                        <div className="flex items-center rounded-lg mb-4 mt-4">
                            <div className="avatar avatar-placeholder">
                                <div className="bg-neutral text-neutral-content w-16 rounded-full">
                                    <span className="text-xl">AR</span>
                                </div>
                            </div>

                            <div className="flex-1 min-w-0 ms-4">
                                <p className="text-sm font-bold text-black truncate">Amuro Ray</p>
                                <p className="text-sm text-gray-500 truncate">amuro.ray@gmail.com</p>
                            </div>
                        </div>
                        <div className="grid grid-rows">
                            <div className="flex-1 min-w-0">
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend text-gray-500 truncate text-xs font-normal">Role</legend>
                                    <input type="text" placeholder="https://your-project-demo.com" className="w-full input input-md bg-white border border-gray-300 rounded-lg text-black" />
                                </fieldset>
                            </div>
                                
                            <div className="flex-1 min-w-0">
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend text-gray-500 truncate text-xs font-normal">Responsibilities (Optional) (shown only for lecturers)</legend>
                                    <textarea className="textarea h-24 w-full bg-white border border-gray-300 text-gray-500" placeholder="Describe your project contribution in detail . . . . ."></textarea>
                                </fieldset>
                            </div>
                        </div>
                </div>


                <div className="w-full p-6 bg-white border border-gray-200 rounded-lg mb-3">
                    <h1 className="mb-2 text-lg font-normal tracking-tight text-gray-900">Lecturer Information</h1>
                        <div class="grid grid-cols-2 gap-4">
                            <div className="flex-1 min-w-0">
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend text-gray-500 truncate text-xs font-normal">Lecturer name</legend>
                                    <input type="text" placeholder="Enter Lecturer name" className="input input-md bg-white border border-gray-300 rounded-lg text-black" />
                                </fieldset>
                            </div>
                                
                            <div className="flex-1 min-w-0">
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend text-gray-500 truncate text-xs font-normal">Lecturer ID</legend>
                                    <input type="text" placeholder="Enter Lecturer ID" className="input input-md bg-white border border-gray-300 rounded-lg text-black" />
                                </fieldset>
                            </div>
                        </div>
                </div>


                <div className="w-full p-6 bg-white border border-gray-200 rounded-lg mb-3">
                    <h1 className="mb-2 text-lg font-normal tracking-tight text-gray-900">Academic Information</h1>
                        <div class="grid grid-cols-3 gap-4">
                            
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend text-black font-normal text-sm">Batch</legend>
                                <select defaultValue="Pick a browser" className="select bg-white text-black border border-gray-400">
                                    <option className="text-gray-500">Select Batch</option>
                                    <option>2026</option>
                                    <option>2027</option>
                                    <option>2028</option>
                                </select>
                            </fieldset>
                            
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend text-black font-normal text-sm">Program</legend>
                                <select defaultValue="Pick a browser" className="select bg-white text-black border border-gray-400">
                                    <option className="text-gray-500">Select Program</option>
                                    <option>Computer Science</option>
                                    <option>Business Information Systems</option>
                                    <option>Graphic Design</option>
                                    <option>Communications</option>
                                </select>
                            </fieldset>
                            
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend text-black font-normal text-sm">Course</legend>
                                <select defaultValue="Pick a browser" className="select bg-white text-black border border-gray-400">
                                    <option className="text-gray-500">Select Course</option>
                                    <option>Software Engineering</option>
                                    <option>Artificial Intelligence</option>
                                    <option>Illustration</option>
                                    <option>3D Animation</option>
                                    <option>Advanced Game Development and Programming</option>
                                </select>
                            </fieldset>
                            
                        </div>
                </div>


                <div className="w-full p-6 bg-white border border-gray-200 rounded-lg text-black">
                    <h1 className="text-lg font-normal mb-6">Project Preview</h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* --------------------- Project Images --------------------- */}
                        <div>
                        <h2 className="text-sm font-normal mb-3">Project Images</h2>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Image Card 1 */}
                            <div className="relative card bg-gray-200 h-36 flex items-center justify-center rounded-lg">
                            <button className="absolute top-2 right-2 btn btn-xs btn-circle btn-outline">✕</button>
                            <span className="text-gray-600 text-sm">Dashboard Screenshot</span>
                            </div>

                            {/* Image Card 2 */}
                            <div className="relative card bg-gray-200 h-36 flex items-center justify-center rounded-lg">
                            <button className="absolute top-2 right-2 btn btn-xs btn-circle btn-outline">✕</button>
                            <span className="text-gray-600 text-sm">Login Interface</span>
                            </div>
                        </div>

                        {/* Upload New Images Button */}
                        <button className="btn btn-outline border border-dashed border-gray-400 w-full mt-4 flex items-center gap-2">
                            <span className="text-lg">📁</span>
                            Upload New Images
                        </button>
                        </div>

                        {/* --------------------- Demo Video --------------------- */}
                        <div>
                        <h2 className="text-sm font-normal mb-3">Demo Video</h2>

                        <div className="relative card bg-gray-200 h-40 flex items-center justify-center rounded-lg">
                            <button className="absolute top-2 right-2 btn btn-xs btn-circle btn-outline">✕</button>

                            {/* Play Icon */}
                            <div className="flex flex-col items-center">
                            <div className="text-3xl mb-1">▶</div>
                            <span className="text-gray-600 text-sm">Project Demo Video</span>
                            </div>
                        </div>

                        {/* Upload New Video Button */}
                        <button className="btn btn-outline border border-dashed border-gray-400 w-full mt-4 flex items-center gap-2">
                            <span className="text-lg">🎥</span>
                            Upload New Video
                        </button>
                        </div>
                    </div>
                    </div>


                <div className="w-full p-6 bg-white border border-gray-200 rounded-lg mb-3">
                    <h1 className="mb-1 text-lg font-normal tracking-tight text-gray-900">Project Submission</h1>
                    <h2 className="mb-2 text-xs font-normal tracking-tight text-gray-600"> Project Description</h2>


                    <fieldset className="fieldset">
                        <textarea className="textarea h-24 w-full bg-white border border-gray-300 text-gray-500" placeholder="Describe your project in detail..."></textarea>
                    </fieldset>

                    <div class="grid grid-cols-2 gap-4">
                        <div className="flex-1 min-w-0">
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend text-gray-500 truncate text-xs font-normal">Live Demo URL</legend>
                                <input type="text" placeholder="https://your-project-demo.com" className="input input-md bg-white border border-gray-300 rounded-lg text-black" />
                            </fieldset>
                        </div>
                            
                        <div className="flex-1 min-w-0">
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend text-gray-500 truncate text-xs font-normal">Video Demo URL</legend>
                                <input type="text" placeholder="https://youtube.com?watch?v=" className="input input-md bg-white border border-gray-300 rounded-lg text-black" />
                            </fieldset>
                        </div>
                    </div>

                    <div className="flex items-center rounded-lg mb-1">
                        <div className="flex-1 min-w-0">
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend text-gray-500 truncate text-xs font-normal">Source Code Repository</legend>
                                <input type="text" placeholder="https://github.com/usrname/repository" className="input input-md bg-white border border-gray-300 rounded-lg text-black w-full" />
                            </fieldset>
                        </div>
                    </div>
                </div>

                <div className="w-full p-6 bg-white border border-gray-200 rounded-lg text-black">
                    <h1 className="text-lg font-medium mb-6">Documentation Files</h1>

                    {/* -------------------- PROJECT REPORT -------------------- */}
                    <h3 className="text-xs text-gray-600 mb-2">Project Report</h3>

                    <div className="text-gray-800">
                        {/* File Preview */}
                        {projectReport && (
                            <div className="flex items-center justify-between border border-gray-400 rounded-lg p-3 mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl">📄</div>
                                        <div>
                                            <p className="font-medium">{projectReport.name}</p>
                                            <p className="text-xs text-gray-500">{projectReport.size}</p>
                                        </div>
                                </div>

                                <button className="btn btn-xs btn-circle" onClick={() => setProjectReport(null)}>
                                    ✕
                                </button>
                            </div>
                        )}

                        {/* Replace File button */}
                        <button className="border-gray-400 btn btn-outline w-max mb-6">⬆ Replace File</button>

                        {/* -------------------- ADDITIONAL DOCS -------------------- */}
                        <h3 className="text-xs text-gray-600 mb-2">Additional Documentation</h3>

                        {additionalFiles.map((file, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between border rounded-lg p-3 mb-2 border-gray-400"
                            >
                            <div className="flex items-center gap-3">
                                <div className="text-2xl">📑</div>
                                    <div>
                                        <p className="font-medium">{file.name}</p>
                                        <p className="text-xs text-gray-500">{file.size}</p>
                                    </div>
                            </div>

                                <button className="btn btn-xs btn-circle" onClick={() => removeAdditional(index)}>
                                    ✕
                                </button>
                            </div>
                        ))}

                        {/* Add more files */}
                        <button className="border-gray-400 border-dashed btn btn-outline w-full mt-2">＋ Add More Files</button>
                    </div>
                </div>
                

                <div className="flex-col mt-4 mb-10 grid grid-cols-2 gap-5">
                    <button className="btn bg-white text-gray-600 hover:bg-gray-100 border border-gray-400 shadow-none rounded-lg">Save as draft</button>
                    <button className="btn btn-neutral shadow-none rounded-lg">Submit Project</button>
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
    </div>
  )
}