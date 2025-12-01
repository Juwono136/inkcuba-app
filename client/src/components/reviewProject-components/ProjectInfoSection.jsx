export default function ProjectInfoSection({ project, formatDate }) {
  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Information</h2>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Project Title</label>
          <p className="text-base text-gray-900 mt-1">{project.title}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">Submission Date</label>
          <p className="text-base text-gray-900 mt-1">{formatDate(project.submittedDate || project.date)}</p>
        </div>
      </div>
    </section>
  );
}
