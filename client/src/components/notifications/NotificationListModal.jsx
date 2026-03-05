import { useState, useCallback, useRef, useEffect } from 'react';
import { FiX, FiBell } from 'react-icons/fi';
import { api } from '../../utils/axios';

const PAGE_SIZE = 20;

export default function NotificationListModal({ open, onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [markAllLoading, setMarkAllLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const fetchPage = useCallback(async (pageNum = 1, searchQ = search, append = false) => {
    if (!open) return;
    setLoading(true);
    try {
      const { data } = await api.get('/api/notifications', {
        params: { page: pageNum, limit: PAGE_SIZE, q: searchQ || undefined },
      });
      const list = data.data || [];
      setTotalPages(data.pagination?.totalPages || 1);
      setUnreadCount(data.unreadCount ?? 0);
      if (append) setItems((prev) => [...prev, ...list]);
      else setItems(list);
    } catch {
      if (!append) setItems([]);
    } finally {
      setLoading(false);
    }
  }, [open, search]);

  useEffect(() => {
    if (!open) return;
    setPage(1);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!search.trim()) {
      fetchPage(1, '', false);
      return;
    }
    searchTimeoutRef.current = setTimeout(() => {
      fetchPage(1, search, false);
      setPage(1);
    }, 300);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [open, search, fetchPage]);

  const loadMore = useCallback(() => {
    if (loading || page >= totalPages) return;
    const next = page + 1;
    setPage(next);
    fetchPage(next, search, true);
  }, [loading, page, totalPages, search, fetchPage]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight - scrollTop - clientHeight < 80) loadMore();
  }, [loadMore]);

  const markRead = useCallback(async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  }, []);

  const markAllRead = useCallback(async () => {
    if (unreadCount === 0 || markAllLoading) return;
    setMarkAllLoading(true);
    try {
      await api.patch('/api/notifications/read-all');
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // ignore, user can retry
    } finally {
      setMarkAllLoading(false);
    }
  }, [unreadCount, markAllLoading]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        className="relative bg-base-100 rounded-2xl shadow-xl border border-base-200/60 w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-modal-title"
      >
        <div className="flex-shrink-0 px-4 py-3 border-b border-base-200/60 flex items-center justify-between bg-gradient-to-r from-[#3B613A]/10 via-base-100 to-[#3B613A]/5">
          <div className="flex items-center gap-2">
            <h2 id="notification-modal-title" className="font-semibold text-[#172b4d] flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#3B613A] text-white">
                <FiBell className="w-4 h-4" />
              </span>
              <span>Notifications</span>
            </h2>
            {unreadCount > 0 && (
              <span className="text-xs font-medium text-[#3B613A] bg-[#3B613A]/10 px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                className="btn btn-ghost btn-xs rounded-full text-xs text-[#3B613A]"
                onClick={markAllRead}
                disabled={markAllLoading}
              >
                {markAllLoading ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  'Mark all read'
                )}
              </button>
            )}
            <button type="button" className="btn btn-ghost btn-sm btn-circle" onClick={onClose} aria-label="Close">
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-shrink-0 p-2 border-b border-base-200/60 bg-base-50/60">
          <input
            type="text"
            className="input input-bordered input-sm w-full rounded-xl"
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto min-h-0 p-2"
        >
          {loading && items.length === 0 ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-md text-[#3B613A]" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-[#5e6c84] py-8 text-center">No notifications found.</p>
          ) : (
            <ul className="space-y-1">
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors ${n.read ? 'bg-base-100 hover:bg-base-200/50' : 'bg-[#3B613A]/10 hover:bg-[#3B613A]/15'}`}
                    onClick={() => markRead(n.id)}
                  >
                    <p className="font-medium text-sm text-[#172b4d]">{n.title}</p>
                    {n.body && <p className="text-xs text-[#5e6c84] mt-0.5 line-clamp-2">{n.body}</p>}
                    <p className="text-xs text-[#5e6c84] mt-1">
                      {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {loading && items.length > 0 && (
            <div className="flex justify-center py-2">
              <span className="loading loading-spinner loading-sm text-[#3B613A]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
