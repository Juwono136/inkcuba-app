export default function ReviewStatusCard({ project }) {
  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Status</h2>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Current Status:</span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            project.status === 'approved' 
              ? 'bg-green-100 text-green-800'
              : project.status === 'needs_revision'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-blue-100 text-blue-800'
          }`}>
            {project.status === 'approved' 
              ? 'Approved' 
              : project.status === 'needs_revision'
              ? 'Needs Revision'
              : 'Awaiting Review'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Project Type:</span>
          <span className="text-sm font-medium text-gray-900">
            {project.projectType === 'group' ? 'Group Project' : 'Individual'}
          </span>
        </div>
      </div>
    </section>
  );
}
