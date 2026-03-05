import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { FiX, FiShuffle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getAvatarUrl } from '../../utils/avatar';
import StudentPoolSection from './StudentPoolSection';

export { getAvatarUrl };

/**
 * Student row with avatar and name/email. Used in lists and pickers.
 */
function StudentChip({ student, onRemove, showRemove = false }) {
  const avatarSrc = getAvatarUrl(student.avatarUrl);
  const initials = (student.name || '?').split(/\s+/).map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div className="flex items-center gap-2 min-w-0">
      {avatarSrc ? (
        <img src={avatarSrc} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
      ) : (
        <div className="w-8 h-8 rounded-full bg-[#3B613A]/20 text-[#3B613A] flex items-center justify-center text-xs font-semibold flex-shrink-0">
          {initials}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[#172b4d] truncate">{student.name || '—'}</p>
        <p className="text-xs text-[#5e6c84] truncate">{student.email}</p>
      </div>
      {showRemove && onRemove && (
        <button
          type="button"
          className="btn btn-ghost btn-xs btn-circle text-[#5e6c84] hover:bg-error/10 hover:text-error flex-shrink-0"
          onClick={onRemove}
          aria-label="Remove"
        >
          <FiX className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

const PICKER_DEBOUNCE_MS = 400;
const PICKER_MIN_SEARCH_LENGTH = 2;

function slotPickerStudentId(s) {
  const id = s?.id ?? s?._id;
  return id != null ? String(id) : '';
}

/**
 * Searchable student list for picking one student (individual slot).
 * When students is empty and onSearchFromApi is provided, allows searching from API and adding to pool.
 */
function StudentSlotPicker({ students, selectedId, onChange, placeholder, onSearchFromApi, onAddToPool }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [apiResults, setApiResults] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);
  const listRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const searchAbortedRef = useRef(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        (s.name || '').toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q)
    );
  }, [students, search]);

  const selected = useMemo(
    () => students.find((s) => slotPickerStudentId(s) === String(selectedId)),
    [students, selectedId]
  );

  useEffect(() => {
    if (!open) {
      setApiResults([]);
      return;
    }
    if (!onSearchFromApi) {
      setApiResults([]);
      return;
    }
    const trimmed = search.trim();
    if (!trimmed || trimmed.length < PICKER_MIN_SEARCH_LENGTH) {
      setApiResults([]);
      return;
    }
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchAbortedRef.current = false;
    searchTimeoutRef.current = setTimeout(() => {
      setApiLoading(true);
      Promise.resolve(onSearchFromApi(trimmed))
        .then((res) => {
          if (searchAbortedRef.current) return;
          const list = Array.isArray(res) ? res : (res?.data ?? []);
          setApiResults(list || []);
        })
        .catch(() => {
          if (!searchAbortedRef.current) setApiResults([]);
        })
        .finally(() => {
          if (!searchAbortedRef.current) setApiLoading(false);
        });
    }, PICKER_DEBOUNCE_MS);
    return () => {
      searchAbortedRef.current = true;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    };
  }, [open, search, onSearchFromApi]);

  const useApiSearch = students.length === 0 && onSearchFromApi;
  const displayList = useApiSearch ? apiResults : filtered;
  const showEmptyMessage = !useApiSearch && filtered.length === 0 && !search.trim();
  const showNoMatch = !useApiSearch && filtered.length === 0 && search.trim();
  const showApiNoMatch = useApiSearch && !apiLoading && apiResults.length === 0 && search.trim().length >= PICKER_MIN_SEARCH_LENGTH;
  const showApiMinLength = useApiSearch && search.trim().length > 0 && search.trim().length < PICKER_MIN_SEARCH_LENGTH;

  useEffect(() => {
    function handleClickOutside(e) {
      if (listRef.current && !listRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = async (s) => {
    const id = slotPickerStudentId(s);
    if (useApiSearch && onAddToPool) await Promise.resolve(onAddToPool({ ...s, id }));
    onChange(id);
    setOpen(false);
    setSearch('');
    setApiResults([]);
  };

  return (
    <div ref={listRef} className="relative w-full min-w-0">
      <button
        type="button"
        className="w-full flex items-center gap-2 p-2.5 sm:p-3 rounded-xl border-2 border-dashed border-base-300 bg-base-100 hover:border-[#3B613A]/50 hover:bg-base-200/30 text-left min-h-[2.75rem] sm:min-h-[3rem] transition-all duration-200"
        onClick={() => setOpen((o) => !o)}
      >
        {selected ? (
          <StudentChip student={selected} />
        ) : (
          <span className="text-sm text-[#5e6c84] truncate">{placeholder}</span>
        )}
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-base-100 border border-base-200 rounded-xl shadow-xl max-h-56 sm:max-h-64 overflow-hidden flex flex-col min-w-[200px]">
          <div className="p-2 border-b border-base-200/60 flex-shrink-0">
            <input
              type="text"
              className="input input-bordered input-sm w-full rounded-lg h-9 text-sm"
              placeholder={useApiSearch ? `Search by name or email (min ${PICKER_MIN_SEARCH_LENGTH} chars)...` : 'Filter list...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <ul className="overflow-y-auto flex-1 min-h-0 p-1">
            {showApiMinLength && (
              <li className="px-3 py-4 text-sm text-[#5e6c84] text-center">
                Type at least {PICKER_MIN_SEARCH_LENGTH} characters to search.
              </li>
            )}
            {apiLoading && (
              <li className="px-3 py-4 text-sm text-[#5e6c84] text-center">Searching...</li>
            )}
            {!apiLoading && displayList.map((s) => (
              <li key={slotPickerStudentId(s)}>
                <button
                  type="button"
                  className="w-full px-3 py-2.5 rounded-lg hover:bg-[#3B613A]/10 text-left transition-colors"
                  onClick={() => handleSelect(s)}
                >
                  <StudentChip student={s} />
                </button>
              </li>
            ))}
            {!apiLoading && showEmptyMessage && (
              <li className="px-3 py-4 text-sm text-[#5e6c84] text-center">
                Add students in the pool above (search or upload), then select here.
              </li>
            )}
            {!apiLoading && showNoMatch && (
              <li className="px-3 py-4 text-sm text-[#5e6c84] text-center">No matching students in list.</li>
            )}
            {!apiLoading && showApiNoMatch && (
              <li className="px-3 py-4 text-sm text-[#5e6c84] text-center">No students found. Try another search.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * CardAssignmentModal — assign students to a card (individual slots or groups).
 * Pool: upload file (with progress) + template. Assign via slot select or drag-and-drop.
 * One student per slot (individual); one student per group (group).
 */
export default function CardAssignmentModal({
  open,
  onClose,
  card,
  students = [],
  onSave,
  showPoolManagement = false,
  onDownloadTemplate,
  onFileSelect,
  fileInputRef,
  uploadProgress = 0,
  uploadStatus = 'idle',
  uploadFileName = '',
  onSearchStudents,
  onAddStudent,
}) {
  const isGroup = card?.isGroupCard ?? false;
  const quantity = Math.max(1, card?.quantity ?? 1);
  const groupCount = Math.max(1, card?.groupCount ?? 2);

  const [individualSlots, setIndividualSlots] = useState(() =>
    Array(quantity)
      .fill(null)
      .map((_, i) => {
        const a = (card?.assignments || []).find(
          (x) => x.slotIndex === i || x.slotIndex === Number(i)
        );
        return a?.studentId ?? null;
      })
  );
  const slotsPerGroup = Math.max(1, quantity);
  const initGroupSlots = () => {
    const byGroup = (card?.assignments || []).reduce((acc, a) => {
      const gi = a.groupIndex ?? a.group;
      if (gi == null) return acc;
      const members = Array.isArray(a.memberIds) ? [...a.memberIds] : [];
      acc[gi] = [...members, ...Array(Math.max(0, slotsPerGroup - members.length)).fill(null)].slice(0, slotsPerGroup);
      return acc;
    }, {});
    return Array.from({ length: groupCount }, (_, i) => byGroup[i] || Array(slotsPerGroup).fill(null));
  };
  const [groupSlots, setGroupSlots] = useState(initGroupSlots);
  const [dragOverSlotIndex, setDragOverSlotIndex] = useState(null);
  const [dragOverGroupSlot, setDragOverGroupSlot] = useState(null);

  useEffect(() => {
    if (!open) {
      setDragOverSlotIndex(null);
      setDragOverGroupSlot(null);
      return;
    }
    setIndividualSlots(
      Array(quantity)
        .fill(null)
        .map((_, i) => {
          const a = (card?.assignments || []).find(
            (x) => x.slotIndex === i || x.slotIndex === Number(i)
          );
          return a?.studentId ?? null;
        })
    );
    const byGroup = (card?.assignments || []).reduce((acc, a) => {
      const gi = a.groupIndex ?? a.group;
      if (gi == null) return acc;
      const members = Array.isArray(a.memberIds) ? [...a.memberIds] : [];
      acc[gi] = [...members, ...Array(Math.max(0, slotsPerGroup - members.length)).fill(null)].slice(0, slotsPerGroup);
      return acc;
    }, {});
    setGroupSlots(Array.from({ length: groupCount }, (_, i) => byGroup[i] || Array(slotsPerGroup).fill(null)));
  }, [open, card?.assignments, quantity, groupCount, slotsPerGroup]);

  const handleSaveIndividual = useCallback(() => {
    const assignments = individualSlots
      .map((studentId, slotIndex) => (studentId ? { slotIndex, studentId } : null))
      .filter(Boolean);
    onSave(assignments);
    onClose();
  }, [individualSlots, onSave, onClose]);

  const handleSaveGroup = useCallback(() => {
    const assignments = groupSlots.map((slots, groupIndex) => ({
      groupIndex,
      memberIds: slots.filter(Boolean),
    }));
    onSave(assignments);
    onClose();
  }, [groupSlots, onSave, onClose]);

  const handleShuffle = useCallback(() => {
    const allIds = students.map((s) => s.id);
    if (allIds.length === 0) {
      toast('Add students first, then use Shuffle.', { icon: 'ℹ️' });
      return;
    }
    const shuffled = [...allIds].sort(() => Math.random() - 0.5);
    const totalSlots = groupCount * slotsPerGroup;
    const newSlots = Array.from({ length: groupCount }, () => Array(slotsPerGroup).fill(null));
    shuffled.slice(0, totalSlots).forEach((id, i) => {
      const gi = Math.floor(i / slotsPerGroup);
      const si = i % slotsPerGroup;
      newSlots[gi][si] = id;
    });
    setGroupSlots(newSlots);
  }, [students, groupCount, slotsPerGroup]);

  const assignedIdsInGroups = useMemo(
    () => new Set(groupSlots.flat().filter(Boolean)),
    [groupSlots]
  );
  const assignedIdsIndividual = useMemo(
    () => new Set(individualSlots.filter(Boolean)),
    [individualSlots]
  );
  const assignedIds = useMemo(
    () => (isGroup ? assignedIdsInGroups : assignedIdsIndividual),
    [isGroup, assignedIdsInGroups, assignedIdsIndividual]
  );
  const unassignedStudents = useMemo(
    () => students.filter((s) => !assignedIdsInGroups.has(s.id)),
    [students, assignedIdsInGroups]
  );
  /** Students to show in column 1 pool list: only those not yet assigned to any slot/group */
  const poolDisplayStudents = useMemo(
    () => students.filter((s) => !assignedIds.has(s.id)),
    [students, assignedIds]
  );

  const setGroupSlotStudent = useCallback((groupIndex, slotIndex, studentId) => {
    setGroupSlots((prev) =>
      prev.map((slots, gi) =>
        gi === groupIndex
          ? slots.map((id, si) => (si === slotIndex ? studentId : id === studentId ? null : id))
          : slots.map((id) => (id === studentId ? null : id))
      )
    );
  }, []);

  const removeFromGroupSlot = useCallback((groupIndex, slotIndex) => {
    setGroupSlots((prev) => {
      const next = prev.map((s) => [...s]);
      next[groupIndex][slotIndex] = null;
      return next;
    });
  }, []);

  const handleDropOnSlot = useCallback((slotIndex, e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('application/student-id');
    if (!id) return;
    setIndividualSlots((prev) => {
      const next = prev.map((sid, i) => (i === slotIndex ? id : sid === id ? null : sid));
      return next;
    });
  }, []);

  const handleDropOnGroupSlot = useCallback((groupIndex, slotIndex, e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('application/student-id');
    if (!id) return;
    setGroupSlots((prev) =>
      prev.map((slots, gi) =>
        gi === groupIndex
          ? slots.map((sid, si) => (si === slotIndex ? id : sid === id ? null : sid))
          : slots.map((sid) => (sid === id ? null : sid))
      )
    );
    setDragOverGroupSlot(null);
  }, []);

  const studentMap = useMemo(() => new Map(students.map((s) => [s.id, s])), [students]);

  const availableForSlot = useCallback(
    (slotIndex) =>
      students.filter(
        (s) => individualSlots[slotIndex] === s.id || !individualSlots.some((id, j) => j !== slotIndex && id === s.id)
      ),
    [students, individualSlots]
  );

  const setSlotStudent = useCallback((slotIndex, studentId) => {
    setIndividualSlots((prev) => prev.map((sid, i) => (i === slotIndex ? studentId : sid === studentId ? null : sid)));
  }, []);

  const availableForGroupSlot = useCallback(
    (groupIndex, slotIndex) =>
      students.filter((s) => {
        const inThisSlot = groupSlots[groupIndex]?.[slotIndex] === s.id;
        const inOtherSlot = groupSlots.some(
          (slots, gi) => slots.some((id, si) => (gi !== groupIndex || si !== slotIndex) && id === s.id)
        );
        return inThisSlot || !inOtherSlot;
      }),
    [students, groupSlots]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative bg-base-100 rounded-2xl shadow-2xl border border-base-200/60 w-full max-w-2xl lg:max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="card-assign-title"
      >
        <div className="flex-shrink-0 px-4 sm:px-5 py-3.5 border-b border-base-200/60 flex items-center justify-between gap-3 bg-gradient-to-r from-[#3B613A]/10 to-[#3B613A]/5 rounded-t-2xl">
          <h2 id="card-assign-title" className="text-lg font-semibold text-[#172b4d] truncate">
            Assign students — {card?.name || 'Card'}
          </h2>
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-circle hover:bg-base-200"
            onClick={onClose}
            aria-label="Close"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 flex-1 min-h-0 p-4 sm:p-5 content-start lg:content-stretch">
            {/* Column 1: Pool — scrollable independently */}
            <div className="flex flex-col min-h-0 overflow-hidden">
              <div className="overflow-y-auto flex-1 min-h-0 pr-0 lg:pr-1">
                {showPoolManagement && (
                  <StudentPoolSection
                    students={poolDisplayStudents}
                    onDownloadTemplate={onDownloadTemplate}
                    onFileSelect={onFileSelect}
                    fileInputRef={fileInputRef}
                    uploadProgress={uploadProgress}
                    uploadStatus={uploadStatus}
                    uploadFileName={uploadFileName}
                  />
                )}
                {!showPoolManagement && students.length === 0 && (
                  <p className="text-sm text-[#5e6c84]">Add students first, then assign them below.</p>
                )}
              </div>
            </div>

            {/* Column 2: Slots or groups — scrollable independently */}
            <div className="flex flex-col min-h-0 overflow-hidden">
              <div className="overflow-y-auto flex-1 min-h-0 space-y-4 pl-0 lg:pl-1">
          {students.length === 0 && showPoolManagement && (
            <p className="text-sm text-[#5e6c84] lg:hidden">
              Add students in the left column (search or upload), then assign to slots or groups on the right.
            </p>
          )}

          {isGroup ? (
            <>
              <p className="text-sm text-[#5e6c84]">
                Distribute students into {groupCount} groups ({slotsPerGroup} slot{slotsPerGroup !== 1 ? 's' : ''} per group). Drag between slots or use Shuffle.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="btn btn-sm bg-[#3B613A]/90 hover:bg-[#3B613A] border-0 text-white rounded-xl gap-1.5"
                  onClick={handleShuffle}
                >
                  <FiShuffle className="w-4 h-4" />
                  Shuffle all into groups
                </button>
              </div>
              <div className="space-y-4 overflow-x-hidden">
                {groupSlots.map((slots, gi) => {
                  const groupColors = [
                    'border-l-4 border-[#3B613A] bg-[#3B613A]/8',
                    'border-l-4 border-[#2563eb] bg-[#2563eb]/8',
                    'border-l-4 border-[#d97706] bg-[#d97706]/8',
                    'border-l-4 border-[#7c3aed] bg-[#7c3aed]/8',
                    'border-l-4 border-[#dc2626] bg-[#dc2626]/8',
                    'border-l-4 border-[#059669] bg-[#059669]/8',
                  ];
                  const groupStyle = groupColors[gi % groupColors.length];
                  return (
                  <div
                    key={gi}
                    className={`rounded-xl border border-base-200/60 overflow-hidden ${groupStyle}`}
                  >
                    <div className="px-3 py-2 border-b border-base-200/60 bg-base-100/80">
                      <span className="font-medium text-sm text-[#172b4d]">Group {gi + 1}</span>
                    </div>
                    <div className="p-2 sm:p-3 space-y-2 sm:space-y-3">
                      {slots.map((studentId, si) => {
                        const dragKey = `${gi}-${si}`;
                        const isDragOver = dragOverGroupSlot === dragKey;
                        const student = studentId ? studentMap.get(studentId) : null;
                        return (
                          <div
                            key={si}
                            className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl border min-h-[2.75rem] sm:min-h-[3.25rem] transition-all duration-200 ease-out ${
                              isDragOver
                                ? 'border-[#3B613A] bg-[#3B613A]/10 border-solid shadow-md scale-[1.01]'
                                : 'border-base-200/60 border-dashed bg-base-100/50 hover:border-[#3B613A]/30'
                            }`}
                            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverGroupSlot(dragKey); }}
                            onDragLeave={() => setDragOverGroupSlot(null)}
                            onDrop={(e) => handleDropOnGroupSlot(gi, si, e)}
                          >
                            <span className="text-sm font-medium text-[#172b4d] w-14 sm:w-16 flex-shrink-0">
                              Slot {si + 1}
                            </span>
                            <div className="flex-1 min-w-0 min-h-[2.5rem] flex items-center w-full">
                              {student ? (
                                <div
                                  draggable
                                  onDragStart={(e) => {
                                    e.dataTransfer.setData('application/student-id', studentId);
                                    e.dataTransfer.effectAllowed = 'move';
                                    e.currentTarget.classList.add('opacity-50', 'scale-95');
                                  }}
                                  onDragEnd={(e) => {
                                    e.currentTarget.classList.remove('opacity-50', 'scale-95');
                                  }}
                                  className="flex items-center gap-2 flex-1 min-w-0 cursor-grab active:cursor-grabbing transition-all duration-150 rounded-lg py-1.5 px-2 bg-base-200/60 hover:bg-base-200/80 hover:shadow-sm"
                                >
                                  <StudentChip student={student} />
                                </div>
                              ) : (
                                <StudentSlotPicker
                                  students={availableForGroupSlot(gi, si)}
                                  selectedId={null}
                                  onChange={(id) => setGroupSlotStudent(gi, si, id)}
                                  placeholder="Drop or search to add..."
                                  onSearchFromApi={onSearchStudents}
                                  onAddToPool={onAddStudent}
                                />
                              )}
                            </div>
                            {student && (
                              <button
                                type="button"
                                className="btn btn-ghost btn-xs text-[#5e6c84] hover:text-error flex-shrink-0 transition-opacity"
                                onClick={() => removeFromGroupSlot(gi, si)}
                                aria-label="Clear slot"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-[#5e6c84]">
                Assign one student per slot ({quantity} slot{quantity !== 1 ? 's' : ''}). Drag between slots or from the list above.
              </p>
              <div className="space-y-3">
                {individualSlots.map((studentId, slotIndex) => {
                  const isDragOver = dragOverSlotIndex === slotIndex;
                  const student = studentId ? studentMap.get(studentId) : null;
                  return (
                    <div
                      key={slotIndex}
                      className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border min-h-[3.25rem] transition-all duration-200 ease-out ${
                        isDragOver
                          ? 'border-[#3B613A] bg-[#3B613A]/10 border-solid shadow-md scale-[1.01]'
                          : 'border-base-200/60 border-dashed bg-base-100/50 hover:border-[#3B613A]/30'
                      }`}
                      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverSlotIndex(slotIndex); }}
                      onDragLeave={() => setDragOverSlotIndex(null)}
                      onDrop={(e) => { handleDropOnSlot(slotIndex, e); setDragOverSlotIndex(null); }}
                    >
                      <span className="text-sm font-medium text-[#172b4d] w-14 sm:w-16 flex-shrink-0">
                        Slot {slotIndex + 1}
                      </span>
                      <div className="flex-1 min-w-0 min-h-[2.5rem] flex items-center w-full">
                        {student ? (
                          <div
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData('application/student-id', studentId);
                              e.dataTransfer.effectAllowed = 'move';
                              e.currentTarget.classList.add('opacity-50', 'scale-95');
                            }}
                            onDragEnd={(e) => {
                              e.currentTarget.classList.remove('opacity-50', 'scale-95');
                            }}
                            className="flex items-center gap-2 flex-1 min-w-0 cursor-grab active:cursor-grabbing transition-all duration-150 rounded-lg py-1.5 px-2 bg-base-200/60 hover:bg-base-200/80 hover:shadow-sm"
                          >
                            <StudentChip student={student} />
                          </div>
                        ) : (
                          <StudentSlotPicker
                            students={availableForSlot(slotIndex)}
                            selectedId={null}
                            onChange={(id) => setSlotStudent(slotIndex, id)}
                            placeholder="Drop or search to add student..."
                            onSearchFromApi={onSearchStudents}
                            onAddToPool={onAddStudent}
                          />
                        )}
                      </div>
                      {student && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs text-[#5e6c84] hover:text-error flex-shrink-0 transition-opacity"
                          onClick={() => setSlotStudent(slotIndex, null)}
                          aria-label="Clear slot"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 p-4 sm:p-5 border-t border-base-200/60 flex flex-col-reverse sm:flex-row gap-2 justify-end bg-base-200/30 rounded-b-2xl">
          <button type="button" className="btn btn-ghost rounded-xl" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn rounded-xl bg-[#3B613A] hover:bg-[#4a7549] border-0 text-white shadow-sm"
            onClick={isGroup ? handleSaveGroup : handleSaveIndividual}
            disabled={students.length === 0}
          >
            Save assignments
          </button>
        </div>
      </div>
    </div>
  );
}
