import { useState, useMemo } from 'react';
import { FiDownload, FiUpload, FiSearch } from 'react-icons/fi';
import { getAvatarUrl } from '../../utils/avatar';

/**
 * Student pool: filter/search the list, upload file, download template, and list.
 * Students are assigned via slot select or drag-and-drop in the modal.
 */
export default function StudentPoolSection({
  students = [],
  onDownloadTemplate,
  onFileSelect,
  fileInputRef,
  uploadProgress = 0,
  uploadStatus = 'idle',
  uploadFileName = '',
}) {
  const [filterQuery, setFilterQuery] = useState('');

  const filteredStudents = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        (s.name || '').toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q)
    );
  }, [students, filterQuery]);

  return (
    <div className="rounded-xl border border-base-200/60 bg-base-200/20 overflow-hidden">
      <div className="px-3 py-2 bg-[#3B613A]/5 border-b border-base-200/60">
        <span className="font-medium text-sm text-[#172b4d]">Students</span>
        <p className="text-xs text-[#5e6c84] mt-0.5">
          Search or filter the list below, or upload Excel/CSV to add students. Then assign to slots or groups.
        </p>
      </div>
      <div className="p-3 space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#5e6c84] flex items-center gap-1">
            <FiSearch className="w-3.5 h-3.5" />
            Search students
          </label>
          <input
            type="text"
            className="input input-bordered input-sm w-full rounded-lg h-9 text-sm"
            placeholder="Filter by name or email..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onDownloadTemplate && (
            <button
              type="button"
              className="btn btn-ghost btn-sm rounded-lg border border-base-300 gap-1.5"
              onClick={onDownloadTemplate}
            >
              <FiDownload className="w-4 h-4" />
              Download template
            </button>
          )}
          {onFileSelect && fileInputRef && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onFileSelect(f);
                  e.target.value = '';
                }}
              />
              <button
                type="button"
                className="btn btn-sm bg-[#3B613A] hover:bg-[#4a7549] border-0 text-white rounded-lg gap-1.5 disabled:opacity-60"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadStatus === 'uploading'}
              >
                <FiUpload className="w-4 h-4" />
                Upload Excel/CSV
              </button>
            </>
          )}
        </div>

        {uploadStatus === 'uploading' && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-[#5e6c84]">
              <span>{uploadFileName ? `Uploading ${uploadFileName}...` : 'Uploading...'}</span>
              <span>{Math.min(100, uploadProgress)}%</span>
            </div>
            <div className="h-2 rounded-full bg-base-300 overflow-hidden">
              <div
                className="h-full bg-[#3B613A] transition-all duration-300 ease-out"
                style={{ width: `${Math.min(100, uploadProgress)}%` }}
              />
            </div>
          </div>
        )}

        <div className="min-h-[8rem] max-h-56 sm:max-h-72 overflow-y-auto rounded-lg border border-base-200/60 bg-base-100">
          {students.length === 0 ? (
            <p className="text-sm text-[#5e6c84] py-4 px-3 text-center">
              No students yet. Upload a file to add students.
            </p>
          ) : filteredStudents.length === 0 ? (
            <p className="text-sm text-[#5e6c84] py-4 px-3 text-center">
              No students match &quot;{filterQuery.trim()}&quot;. Try a different filter.
            </p>
          ) : (
            <ul className="divide-y divide-base-200/60">
              {filteredStudents.map((s) => {
                const avatarSrc = getAvatarUrl(s.avatarUrl);
                const initials = (s.name || '?').split(/\s+/).map((n) => n[0]).join('').toUpperCase().slice(0, 2);
                return (
                  <li
                    key={s.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/student-id', s.id);
                      e.dataTransfer.effectAllowed = 'move';
                      e.currentTarget.classList.add('opacity-50', 'scale-95');
                    }}
                    onDragEnd={(e) => {
                      e.currentTarget.classList.remove('opacity-50', 'scale-95');
                    }}
                    className="flex items-center gap-2 px-2 py-2 text-sm cursor-grab active:cursor-grabbing hover:bg-base-200/40 transition-all duration-150 rounded-lg"
                  >
                    {avatarSrc ? (
                      <img src={avatarSrc} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#3B613A]/20 text-[#3B613A] flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[#172b4d] truncate">{s.name || '—'}</p>
                      <p className="text-xs text-[#5e6c84] truncate">{s.email}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
