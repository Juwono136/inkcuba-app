import Navbar from '../components/Navbar.jsx'

export default function SubmitGroupProject() {
  return (
    <div>
      <Navbar />
        <div className="min-h-screen bg-white">
            <div className="p-4 max-w-3xl mx-auto"> 
                <div>
                    <h1 className="mb-1 text-xl font-normal tracking-tight text-black ">
                        Submit your Project (Group)
                    </h1>
                    <p className="text-xs text-gray-600 mb-6">
                        Upload your individual project files here.
                    </p>
                </div>
                <div className="w-full mb-5 p-4 bg-gray-100 border border-gray-200 rounded-lg mb-">
                    <h1 className="mb-2 text-lg font-normal tracking-tight text-gray-900">Submitter Information</h1>
                        <div className="flex items-center rounded-lg mb-1">
                            <div className='shrink-0 p-2 mb-2 mt-2'>
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
                    <h1 className="mb-2 text-lg font-normal tracking-tight text-gray-900">Project Information</h1>
                        <div className="flex items-center rounded-lg mb-1">
                            <div className="flex-1 min-w-0 ms-2">
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend text-gray-500 truncate text-sm font-normal">Project Title</legend>
                                    <input type="text" placeholder="Enter Project Title" className="input input-md bg-white border border-gray-300 rounded-lg text-black" />
                                </fieldset>
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
                                <ul className="list bg-white border border-gray-200 rounded-lg text-black">
                                    <li className="list-row">
                                        <div className="avatar avatar-placeholder">
                                            <div className="bg-neutral text-neutral-content w-10 rounded-full">
                                                <span className="text-xs">AR</span>
                                            </div>
                                        </div>

                                        <div>
                                            <div>Amuro Ray</div>
                                            <div className="text-xs font-normal opacity-60">amuro.ray@gmail.com</div>
                                        </div>
                                    </li>
                                    
                                    <li className="list-row">
                                        <div className="avatar avatar-placeholder">
                                            <div className="bg-neutral text-neutral-content w-10 rounded-full">
                                                <span className="text-xs">CA</span>
                                            </div>
                                        </div>

                                        <div>
                                            <div>Char Aznable</div>
                                            <div className="text-xs font-normal opacity-60">sieg.zeon@gmail.com</div>
                                        </div>
                                        
                                    </li>
                                    
                                    <li className="list-row">
                                        <div className="avatar avatar-placeholder">
                                            <div className="bg-neutral text-neutral-content w-10 rounded-full">
                                                <span className="text-xs">SA</span>
                                            </div>
                                        </div>

                                            <div>
                                            <div>Seabook Arno</div>
                                        <div className="text-xs font-normal opacity-60">cincade.nau@gmail.com</div>
                                        </div>
                                        
                                    </li>
                                
                                </ul>
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


                <div className="w-full p-6 bg-white border border-gray-200 rounded-lg mb-3">
                    <h1 className="mb-2 text-lg font-normal tracking-tight text-gray-900">Project Preview</h1>
                        <div className="flex items-center rounded-lg mb-1">
                            <div className="flex-1 min-w-0 ms-2">
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend text-gray-500 truncate text-sm font-normal">Upload Image*</legend>                                  
                                    <div className="flex items-center justify-center w-full text-gray-600 mb-3">
                                        <label for="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 bg-neutral-secondary-medium border border-dashed border-default-strong rounded-base cursor-pointer hover:bg-neutral-tertiary-medium rounded-lg">
                                            <div className="flex flex-col items-center justify-center text-body pt-5 pb-6">
                                                <svg className="w-8 h-8 mb-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h3a3 3 0 0 0 0-6h-.025a5.56 5.56 0 0 0 .025-.5A5.5 5.5 0 0 0 7.207 9.021C7.137 9.017 7.071 9 7 9a4 4 0 1 0 0 8h2.167M12 19v-9m0 0-2 2m2-2 2 2"/></svg>
                                                <p className="mb-2 text-sm"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                                <p className="text-xs">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                                            </div>
                                            <input id="dropzone-file" type="file" class="hidden" />
                                        </label>
                                    </div> 
                                </fieldset>
                                <fieldset className="fieldset">
                                    <div className="flex items-center mb-4 bg-white">
                                        <input id="default-checkbox" type="checkbox" value="" className="w-4 h-4 border border-default-medium rounded-xs bg-neutral-secondary-medium focus:ring-2 focus:ring-brand-soft" />
                                        <label for="default-checkbox" className="select-none ms-2 text-sm font-normal text-heading text-gray-500">Default checkbox</label>
                                    </div>
                                    <div className="flex items-center justify-center w-full text-gray-600">
                                        <label for="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 bg-neutral-secondary-medium border border-dashed border-default-strong rounded-base cursor-pointer hover:bg-neutral-tertiary-medium rounded-lg">
                                            <div className="flex flex-col items-center justify-center text-body pt-5 pb-6">
                                                <svg className="w-8 h-8 mb-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h3a3 3 0 0 0 0-6h-.025a5.56 5.56 0 0 0 .025-.5A5.5 5.5 0 0 0 7.207 9.021C7.137 9.017 7.071 9 7 9a4 4 0 1 0 0 8h2.167M12 19v-9m0 0-2 2m2-2 2 2"/></svg>
                                                <p className="mb-2 text-sm"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                                <p className="text-xs">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                                            </div>
                                            <input id="dropzone-file" type="file" class="hidden" />
                                        </label>
                                    </div> 
                                </fieldset>

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

                    <h1 className="mb-2 font-normal tracking-tight text-black"> Documentation Files</h1>

                    <h3 className="font-normal text-xs tracking-tight text-gray-600 mb-2">Project Report</h3>
                    <div className="flex items-center justify-center w-full text-gray-600 mb-3">
                        <label for="dropzone-file" className="flex flex-col items-center justify-center w-full bg-neutral-secondary-medium border border-gray-200 border-default-strong rounded-base cursor-pointer hover:bg-neutral-tertiary-medium rounded-lg">
                            <div className="flex flex-col items-center justify-center text-body pt-3 pb-3">
                            <label for="uploadFile1"
                                className="flex bg-gray-200 hover:bg-gray-400 text-gray-600 text-base font-medium px-4 py-2.5 outline-none rounded-lg w-max cursor-pointer mx-auto">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 mr-2 fill-gray-600 inline" viewBox="0 0 32 32">
                                    <path
                                    d="M23.75 11.044a7.99 7.99 0 0 0-15.5-.009A8 8 0 0 0 9 27h3a1 1 0 0 0 0-2H9a6 6 0 0 1-.035-12 1.038 1.038 0 0 0 1.1-.854 5.991 5.991 0 0 1 11.862 0A1.08 1.08 0 0 0 23 13a6 6 0 0 1 0 12h-3a1 1 0 0 0 0 2h3a8 8 0 0 0 .75-15.956z"
                                    data-original="#000000" />
                                    <path
                                    d="M20.293 19.707a1 1 0 0 0 1.414-1.414l-5-5a1 1 0 0 0-1.414 0l-5 5a1 1 0 0 0 1.414 1.414L15 16.414V29a1 1 0 0 0 2 0V16.414z"
                                    data-original="#000000" />
                                </svg>
                                Upload PDF Documents
                                <input type="file" id='uploadFile1' class="hidden" />
                            </label>
                            </div>
                        </label>
                    </div>

                    <h3 className="font-normal text-xs tracking-tight text-gray-600 mb-2">Additional Documentations</h3>
                    <div className="flex items-center justify-center w-full text-gray-600 mb-3">
                        <label for="dropzone-file" className="flex flex-col items-center justify-center w-full bg-neutral-secondary-medium border border-gray-200 border-default-strong rounded-base cursor-pointer hover:bg-neutral-tertiary-medium rounded-lg">
                            <div className="flex flex-col items-center justify-center text-body pt-3 pb-3">
                            <label for="uploadFile1"
                                className="flex bg-gray-200 hover:bg-gray-400 text-gray-600 text-base font-medium px-4 py-2.5 outline-none rounded-lg w-max cursor-pointer mx-auto">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 mr-2 fill-gray-600 inline" viewBox="0 0 32 32">
                                    <path
                                    d="M23.75 11.044a7.99 7.99 0 0 0-15.5-.009A8 8 0 0 0 9 27h3a1 1 0 0 0 0-2H9a6 6 0 0 1-.035-12 1.038 1.038 0 0 0 1.1-.854 5.991 5.991 0 0 1 11.862 0A1.08 1.08 0 0 0 23 13a6 6 0 0 1 0 12h-3a1 1 0 0 0 0 2h3a8 8 0 0 0 .75-15.956z"
                                    data-original="#000000" />
                                    <path
                                    d="M20.293 19.707a1 1 0 0 0 1.414-1.414l-5-5a1 1 0 0 0-1.414 0l-5 5a1 1 0 0 0 1.414 1.414L15 16.414V29a1 1 0 0 0 2 0V16.414z"
                                    data-original="#000000" />
                                </svg>
                                Upload supporting documents
                                <input type="file" id='uploadFile1' class="hidden" />
                            </label>
                            </div>
                        </label>
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