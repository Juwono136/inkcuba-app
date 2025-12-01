export default function ReviewProjectCard({ project, onReview }) {
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'S';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      {/* Author & Avatar */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          <span className="text-sm font-medium text-gray-600">
            {getInitial(project.author?.name || project.submitter?.name)}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{project.title}</h3>
          <p className="text-sm text-gray-600">
            by {project.author?.name || project.submitter?.name || 'Unknown'}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {project.description}
      </p>

      {/* Submission Date and Button */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Submitted: {formatDate(project.submittedDate || project.submittedAt)}
        </span>
        
        {/* Action Button */}
        <button
          onClick={() => onReview(project)}
          className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-900 transition-colors text-sm font-medium"
        >
          Review
        </button>
      </div>
    </div>
  );
}