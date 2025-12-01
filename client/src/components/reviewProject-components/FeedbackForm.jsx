export default function FeedbackForm({ 
  feedback, 
  setFeedback, 
  submitting, 
  onApprove, 
  onReject, 
  onCancel,
  isReviewed,
  isApproved,
  canEdit = true
}) {
  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {isReviewed ? 'Update Feedback' : 'Provide Feedback'}
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Feedback <span className="text-red-500">*</span>
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Enter your feedback regarding this project submission..."
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
            disabled={submitting || (isApproved && !canEdit)}
            readOnly={!canEdit}
          />
          <p className="text-xs text-gray-500 mt-1">
            Provide constructive feedback for the student
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {/* Show buttons only if user has permission */}
          {!canEdit ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
              <p className="text-sm text-amber-800">
                You don't have permission to edit this project. Only the original reviewer can request revisions.
              </p>
            </div>
          ) : !isApproved ? (
            <>
              {/* Side-by-side buttons for Reject and Accept */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onReject}
                  disabled={submitting || !feedback.trim()}
                  className="px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {submitting ? 'Submitting...' : 'Reject Submission'}
                </button>

                <button
                  onClick={onApprove}
                  disabled={submitting || !feedback.trim()}
                  className="px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {submitting ? 'Submitting...' : 'Accept Submission'}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Only show Request Revision button for approved projects */}
              <button
                onClick={onReject}
                disabled={submitting || !feedback.trim()}
                className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {submitting ? 'Submitting...' : 'Request Revision'}
              </button>
            </>
          )}

          {canEdit && (
            <button
              onClick={onCancel}
              disabled={submitting}
              className="w-full px-4 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
