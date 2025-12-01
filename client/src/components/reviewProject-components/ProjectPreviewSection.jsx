export default function ProjectPreviewSection({ project }) {
  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Preview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Project Poster */}
        <div>
          <label className="text-sm font-medium text-gray-500 mb-2 block">Project Poster</label>
          <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
            {project.thumbnail ? (
              <img 
                src={project.thumbnail} 
                alt="Project poster" 
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="text-center text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">No poster available</p>
              </div>
            )}
          </div>
        </div>

        {/* Demo Video */}
        <div>
          <label className="text-sm font-medium text-gray-500 mb-2 block">Demo Video</label>
          <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
            {project.demoVideo ? (
              <video 
                src={project.demoVideo} 
                controls 
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="text-center text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">No video available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
