export default function LecturerHeader({ lecturer, projectCount }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
      <div className="flex items-start gap-6">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
          <span className="text-4xl font-bold text-gray-600">
            {lecturer.name.charAt(0)}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {lecturer.name}
          </h1>
          <p className="text-lg text-gray-700 mb-1">{lecturer.title}</p>
          <p className="text-sm text-purple-600 mb-4">{lecturer.department}</p>
          
          {/* Projects Approved Badge */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-medium">{projectCount} Projects Approved</span>
          </div>
        </div>
      </div>
    </div>
  );
}
