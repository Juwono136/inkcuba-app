export default function ProjectSubmissionSection({ project }) {
  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Submission</h2>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Project Description</label>
          <p className="text-base text-gray-900 mt-1 whitespace-pre-wrap">
            {project.description || 'No description provided.'}
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500 mb-2 block">Links/Demo URL</label>
          <div className="space-y-2">
            {project.links?.liveDemo ? (
              <a 
                href={project.links.liveDemo} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="text-sm">Live Demo: {project.links.liveDemo}</span>
              </a>
            ) : (
              <p className="text-sm text-gray-400">No live demo link provided</p>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500 mb-2 block">Source Code Repository</label>
          <div className="space-y-2">
            {project.links?.sourceCode ? (
              <a 
                href={project.links.sourceCode} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="text-sm">Source Code: {project.links.sourceCode}</span>
              </a>
            ) : (
              <p className="text-sm text-gray-400">No source code link provided</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
