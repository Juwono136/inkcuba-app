export default function SubmitterInfoSection({ project, getInitial }) {
  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Submitter Information</h2>
      
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          <span className="text-lg font-medium text-gray-600">
            {getInitial(project.author?.name || project.submitter?.name)}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{project.author?.name || project.submitter?.name || 'Unknown'}</h3>
          <p className="text-sm text-gray-600">{project.author?.email || project.submitter?.email || 'N/A'}</p>
          <p className="text-sm text-gray-500 mt-1">Student ID: {project.author?.studentId || project.submitter?.studentId || 'N/A'}</p>
        </div>
      </div>

      {/* Team Collaborators */}
      {project.teamCollaborators && project.teamCollaborators.length > 0 && (
        <div className="mt-6">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Team Collaborators</h3>
          <div className="space-y-3">
            {project.teamCollaborators.map((collaborator, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-gray-600">
                    {getInitial(collaborator.name)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{collaborator.name}</p>
                  <p className="text-xs text-gray-600">{collaborator.email}</p>
                  <p className="text-xs text-gray-500">ID: {collaborator.studentId}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
