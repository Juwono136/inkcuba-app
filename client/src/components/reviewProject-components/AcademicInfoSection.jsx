export default function AcademicInfoSection({ project }) {
  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Academic Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Batch</label>
          <p className="text-base text-gray-900 mt-1">{project.batch || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Program</label>
          <p className="text-base text-gray-900 mt-1">{project.program || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Course</label>
          <p className="text-base text-gray-900 mt-1">{project.course || 'N/A'}</p>
        </div>
      </div>
    </section>
  );
}
