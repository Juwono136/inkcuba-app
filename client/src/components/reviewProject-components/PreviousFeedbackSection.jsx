export default function PreviousFeedbackSection({ project, formatDate }) {
  if (!project.feedback) return null;

  return (
    <section className="bg-amber-50 border border-amber-200 rounded-lg p-6">
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-amber-900 mb-2">Previous Feedback</h3>
          <p className="text-sm text-amber-800 mb-2">
            Reviewed by {project.reviewedBy || 'Unknown'} on {formatDate(project.reviewedDate || project.reviewedAt)}
          </p>
          <p className="text-sm text-amber-900 whitespace-pre-wrap">
            {project.feedback}
          </p>
        </div>
      </div>
    </section>
  );
}
