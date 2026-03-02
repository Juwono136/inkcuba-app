import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiUserCheck, FiUserX, FiPlus } from 'react-icons/fi';
import Navbar from '../components/layout/Navbar';
import Breadcrumb from '../common/Breadcrumb';
import Loader from '../common/Loader';
import SearchInput from '../common/SearchInput';
import TablePagination from '../common/TablePagination';
import ConfirmModal from '../common/ConfirmModal';
import FormInput from '../common/FormInput';
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  setQuery,
  resetState,
} from '../features/admin/userManagementSlice';

const roles = [
  { value: 'all', label: 'All roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'lecturer', label: 'Lecturer' },
  { value: 'student', label: 'Student' },
];

const statusOptions = [
  { value: 'all', label: 'All status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const sortConfig = [
  { value: 'createdAt_desc', label: 'Newest first' },
  { value: 'createdAt_asc', label: 'Oldest first' },
  { value: 'name_asc', label: 'Name A–Z' },
  { value: 'name_desc', label: 'Name Z–A' },
];

const selectClass =
  'select select-bordered select-sm h-11 min-h-11 rounded-xl border-base-300 bg-base-100 text-sm focus:border-[#3B613A]/50 focus:outline-none transition-colors w-full';

function refetch(dispatch, { page, limit, search, role, status, sortBy, sortOrder }) {
  dispatch(
    fetchUsers({
      page,
      limit,
      search,
      role: role === 'all' ? undefined : role,
      status: status === 'all' ? undefined : status,
      sortBy,
      sortOrder,
    })
  );
}

export default function AdminUserManagementPage() {
  const dispatch = useDispatch();
  const currentUserId = useSelector((state) => state.auth.user?.id);
  const {
    items,
    page,
    limit,
    total,
    search,
    role,
    status,
    sortBy,
    sortOrder,
    loading,
  } = useSelector((state) => state.adminUsers);

  const [localSearch, setLocalSearch] = useState(search);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    role: 'lecturer',
    isActive: true,
  });
  const [confirmToggle, setConfirmToggle] = useState({ open: false, user: null, nextStatus: true });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, user: null });
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [confirmSave, setConfirmSave] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const queryParams = useMemo(
    () => ({ page, limit, search, role, status, sortBy, sortOrder }),
    [page, limit, search, role, status, sortBy, sortOrder]
  );

  useEffect(() => {
    dispatch(
      fetchUsers({
        page,
        limit,
        search,
        role: role === 'all' ? undefined : role,
        status: status === 'all' ? undefined : status,
        sortBy,
        sortOrder,
      })
    );
  }, [dispatch, page, limit, search, role, status, sortBy, sortOrder]);

  useEffect(() => () => dispatch(resetState()), [dispatch]);

  useEffect(() => {
    const t = setTimeout(() => {
      dispatch(setQuery({ search: localSearch, page: 1 }));
    }, 400);
    return () => clearTimeout(t);
  }, [localSearch, dispatch]);

  const currentSortValue = useMemo(() => `${sortBy}_${sortOrder}`, [sortBy, sortOrder]);

  const openCreateForm = () => {
    setEditingUser(null);
    setFormState({
      name: '',
      email: '',
      password: '',
      role: 'lecturer',
      isActive: true,
    });
    setFormOpen(true);
  };

  const openEditForm = (user) => {
    setEditingUser(user);
    setFormState({
      name: user.name || '',
      email: user.email || '',
      role: user.role,
      isActive: user.isActive,
    });
    setFormOpen(true);
  };

  const doSaveUser = async () => {
    const payload = {
      name: formState.name.trim(),
      email: formState.email.trim(),
      role: formState.role,
      isActive: formState.isActive,
    };
    setActionLoading(true);
    try {
      if (editingUser) {
        await dispatch(updateUser({ id: editingUser.id, payload })).unwrap();
        toast.success('User updated');
      } else {
        await dispatch(createUser(payload)).unwrap();
        toast.success('User created');
      }
      setConfirmSave(false);
      setFormOpen(false);
      setEditingUser(null);
      setFormState({ name: '', email: '', role: 'lecturer', isActive: true });
      refetch(dispatch, queryParams);
    } catch (err) {
      toast.error(err || 'Failed to save user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setConfirmSave(true);
  };

  const handleStatusToggle = async () => {
    if (!confirmToggle.user) return;
    setActionLoading(true);
    try {
      await dispatch(
        updateUser({
          id: confirmToggle.user.id,
          payload: { isActive: confirmToggle.nextStatus },
        })
      ).unwrap();
      toast.success(confirmToggle.nextStatus ? 'User activated' : 'User deactivated');
      setConfirmToggle({ open: false, user: null, nextStatus: true });
      refetch(dispatch, queryParams);
    } catch (err) {
      toast.error(err || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.user) return;
    if (deleteConfirmText !== (confirmDelete.user.name || '')) return;
    setActionLoading(true);
    try {
      await dispatch(deleteUser(confirmDelete.user.id)).unwrap();
      toast.success('User deleted');
      setConfirmDelete({ open: false, user: null });
      setDeleteConfirmText('');
      refetch(dispatch, queryParams);
    } catch (err) {
      toast.error(err || 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2E5]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <Breadcrumb
          items={[
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'User management' },
          ]}
        />
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#303030] tracking-tight">
              User Management
            </h1>
            <p className="mt-1 text-sm text-[#303030]/60">
              Create, edit, assign roles, and activate or deactivate users.
            </p>
          </div>
          <button
            type="button"
            className="btn gap-2 bg-[#3B613A] border-[#3B613A] hover:bg-[#4a7549] text-white rounded-xl h-11 px-5 font-medium shadow-sm"
            onClick={openCreateForm}
          >
            <FiPlus className="w-4 h-4" />
            Add user
          </button>
        </div>

        {/* Card: toolbar + table + pagination */}
        <div className="bg-base-100 rounded-2xl border border-base-200/60 shadow-sm overflow-hidden">
          {/* Toolbar: search, filters, sort */}
          <div className="p-4 sm:p-5 border-b border-base-200/60 bg-base-100">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
              <div className="lg:col-span-4 xl:col-span-3">
                <SearchInput
                  id="um-search"
                  label="Search"
                  value={localSearch}
                  onChange={setLocalSearch}
                  placeholder="By name or email..."
                />
              </div>
              <div className="lg:col-span-8 xl:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[#303030]/70">Role</label>
                  <select
                    className={selectClass}
                    value={role}
                    onChange={(e) => dispatch(setQuery({ role: e.target.value, page: 1 }))}
                  >
                    {roles.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[#303030]/70">Status</label>
                  <select
                    className={selectClass}
                    value={status}
                    onChange={(e) => dispatch(setQuery({ status: e.target.value, page: 1 }))}
                  >
                    {statusOptions.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[#303030]/70">Sort by</label>
                  <select
                    className={selectClass}
                    value={currentSortValue}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('_');
                      dispatch(setQuery({ sortBy: field, sortOrder: order, page: 1 }));
                    }}
                  >
                    {sortConfig.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Table area with loader overlay */}
          <div className="relative min-h-[200px]">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-base-100/80 rounded-b-2xl">
                <Loader size="lg" text="Loading users..." />
              </div>
            )}
            <div className="overflow-x-auto">
              {!loading && items.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-[#303030]/60 font-medium">No users found</p>
                  <p className="text-sm text-[#303030]/50 mt-1">
                    Please try again with different search criteria.
                  </p>
                </div>
              ) : (
                <table className="table table-auto w-full">
                  <thead>
                    <tr className="bg-base-200/50 border-b border-base-200">
                      <th className="w-10 text-center text-xs font-semibold uppercase tracking-wider text-[#303030]/70 py-4 whitespace-nowrap">
                        No
                      </th>
                      <th className="text-xs font-semibold uppercase tracking-wider text-[#303030]/70 py-4 whitespace-nowrap">
                        Name
                      </th>
                      <th className="hidden sm:table-cell text-xs font-semibold uppercase tracking-wider text-[#303030]/70 py-4">
                        Email
                      </th>
                      <th className="hidden sm:table-cell text-xs font-semibold uppercase tracking-wider text-[#303030]/70 py-4 whitespace-nowrap">
                        Role
                      </th>
                      <th className="text-xs font-semibold uppercase tracking-wider text-[#303030]/70 py-4 whitespace-nowrap">
                        Status
                      </th>
                      <th className="hidden lg:table-cell text-xs font-semibold uppercase tracking-wider text-[#303030]/70 py-4 whitespace-nowrap">
                        Last login
                      </th>
                      <th className="hidden md:table-cell text-xs font-semibold uppercase tracking-wider text-[#303030]/70 py-4 whitespace-nowrap">
                        Created
                      </th>
                      <th className="text-right text-xs font-semibold uppercase tracking-wider text-[#303030]/70 py-4 whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((user, index) => (
                      <tr
                        key={user.id}
                        className="border-b border-base-200/60 hover:bg-base-200/30 transition-colors"
                      >
                        <td className="py-4 px-3 text-center align-middle text-xs text-[#303030]/70">
                          {(page - 1) * limit + index + 1}
                        </td>
                        <td className="py-4 align-middle">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#3B613A]/10 flex items-center justify-center text-xs font-semibold text-[#3B613A] uppercase flex-shrink-0">
                              {(user.name || '?')
                                .split(' ')
                                .filter(Boolean)
                                .slice(0, 2)
                                .map((part) => part[0])
                                .join('')}
                            </div>
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="font-medium text-[#303030] truncate max-w-[160px] sm:max-w-[220px]">
                                {user.name}
                              </span>
                              <span className="sm:hidden text-xs text-[#303030]/60 break-all">
                                {user.email}
                              </span>
                              <span className="sm:hidden inline-flex items-center gap-1 text-[11px] text-[#303030]/60 mt-0.5">
                                <span className="inline-flex px-1.5 py-0.5 rounded-full bg-base-200 text-[#303030]/80 capitalize">
                                  {user.role}
                                </span>
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell py-4 text-sm text-[#303030]/80 break-all max-w-xs">
                          {user.email}
                        </td>
                        <td className="hidden sm:table-cell py-4">
                          <span className="badge badge-ghost badge-sm capitalize font-medium">
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4 align-middle">
                          <span
                            className={`badge badge-sm font-medium ${
                              user.isActive
                                ? 'badge-success text-success-content'
                                : 'badge-ghost text-[#303030]/60'
                            }`}
                          >
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="hidden lg:table-cell py-4 text-xs text-[#303030]/60 whitespace-nowrap">
                          {user.lastLoginAt
                            ? new Date(user.lastLoginAt).toLocaleString()
                            : '—'}
                        </td>
                        <td className="hidden md:table-cell py-4 text-xs text-[#303030]/60 whitespace-nowrap">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : '—'}
                        </td>
                        <td className="py-4 text-right align-middle">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs sm:btn-sm btn-circle text-[#3B613A] hover:bg-[#3B613A]/10"
                              onClick={() => openEditForm(user)}
                              aria-label="Edit user"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs sm:btn-sm btn-circle text-[#303030]/70 hover:bg-base-200"
                              onClick={() =>
                                setConfirmToggle({
                                  open: true,
                                  user,
                                  nextStatus: !user.isActive,
                                })
                              }
                              aria-label={user.isActive ? 'Deactivate user' : 'Activate user'}
                            >
                              {user.isActive ? (
                                <FiUserX className="w-4 h-4" />
                              ) : (
                                <FiUserCheck className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs sm:btn-sm btn-circle text-error hover:bg-error/10 disabled:text-error/40"
                              onClick={() => setConfirmDelete({ open: true, user })}
                              disabled={user.id === currentUserId}
                              title={
                                user.id === currentUserId
                                  ? 'You cannot delete your own account'
                                  : 'Delete user'
                              }
                              aria-label="Delete user"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Pagination */}
          {total > 0 && (
            <div className="px-4 sm:px-5 py-4 border-t border-base-200/60 bg-base-100">
              <TablePagination
                page={page}
                limit={limit}
                total={total}
                onPageChange={(next) => dispatch(setQuery({ page: next }))}
                onLimitChange={(nextLimit) =>
                  dispatch(setQuery({ limit: nextLimit, page: 1 }))
                }
              />
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit user modal */}
      {formOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!actionLoading) {
                setFormOpen(false);
                setEditingUser(null);
              }
            }}
            aria-hidden="true"
          />
          <div
            className="relative bg-base-100 rounded-2xl shadow-xl border border-base-200/60 w-full max-w-md overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-form-title"
          >
            <div
              className="h-1 w-full bg-gradient-to-r from-[#3B613A] to-[#4a7549]"
              aria-hidden="true"
            />
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3">
                {editingUser && (
                  <div className="w-11 h-11 rounded-full bg-[#3B613A]/10 flex items-center justify-center text-sm font-semibold text-[#3B613A] uppercase">
                    {(editingUser.name || '?')
                      .split(' ')
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join('')}
                  </div>
                )}
                <div className="min-w-0">
                  <h2 id="user-form-title" className="text-xl font-bold text-[#303030] truncate">
                    {editingUser ? 'Edit user' : 'Add user'}
                  </h2>
                  {editingUser && (
                    <p className="text-xs text-[#303030]/60 mt-0.5">
                      {editingUser.role && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#3B613A]/8 text-[#3B613A] font-medium capitalize mr-2">
                          {editingUser.role}
                        </span>
                      )}
                      <span className="break-all">{editingUser.email}</span>
                    </p>
                  )}
                  {!editingUser && (
                    <p className="text-xs text-[#303030]/60 mt-0.5">
                      The user will receive an email with a temporary password generated by the
                      system.
                    </p>
                  )}
                </div>
              </div>
              <form className="mt-6 space-y-4" onSubmit={handleSave}>
                <FormInput
                  label="Name"
                  name="name"
                  type="text"
                  value={formState.name}
                  onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
                  required
                  className="text-sm"
                />
                <FormInput
                  label="Email"
                  name="email"
                  type="email"
                  value={formState.email}
                  onChange={(e) => setFormState((s) => ({ ...s, email: e.target.value }))}
                    required
                  className="text-sm"
                />
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium">Role</span>
                  </label>
                  <select
                    className={selectClass}
                    value={formState.role}
                    onChange={(e) =>
                      setFormState((s) => ({ ...s, role: e.target.value }))
                    }
                  >
                    <option value="admin">Admin</option>
                    <option value="lecturer">Lecturer</option>
                    <option value="student">Student</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-3">
                    <input
                      type="checkbox"
                      className="toggle toggle-sm toggle-primary"
                      checked={formState.isActive}
                      onChange={(e) =>
                        setFormState((s) => ({ ...s, isActive: e.target.checked }))
                      }
                    />
                    <span className="label-text font-medium">Active</span>
                  </label>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    className="btn btn-ghost flex-1 rounded-xl"
                    onClick={() => {
                      if (!actionLoading) {
                        setFormOpen(false);
                        setEditingUser(null);
                      }
                    }}
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn flex-1 bg-[#3B613A] border-[#3B613A] hover:bg-[#4a7549] text-white rounded-xl"
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <span className="loading loading-spinner loading-sm" />
                    ) : (
                      'Save'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmToggle.open}
        onClose={() => setConfirmToggle({ open: false, user: null, nextStatus: true })}
        onConfirm={handleStatusToggle}
        title={confirmToggle.nextStatus ? 'Activate user' : 'Deactivate user'}
        message={
          confirmToggle.user
            ? `Are you sure you want to ${confirmToggle.nextStatus ? 'activate' : 'deactivate'} ${confirmToggle.user.name}?`
            : ''
        }
        confirmLabel={confirmToggle.nextStatus ? 'Activate' : 'Deactivate'}
        cancelLabel="Cancel"
        variant="primary"
        loading={actionLoading}
      />

      <ConfirmModal
        open={confirmDelete.open}
        onClose={() => {
          setConfirmDelete({ open: false, user: null });
          setDeleteConfirmText('');
        }}
        onConfirm={handleDelete}
        title="Delete user"
        message={
          confirmDelete.user
            ? `Are you sure you want to permanently delete ${confirmDelete.user.name}? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={actionLoading}
        confirmDisabled={
          !confirmDelete.user ||
          deleteConfirmText.trim() !== (confirmDelete.user?.name || '').trim()
        }
      >
        {confirmDelete.user && (
          <div className="space-y-2">
            <p className="text-xs text-[#303030]/70">
              Type{' '}
              <span className="font-semibold text-[#303030]">
                {confirmDelete.user.name}
              </span>{' '}
              to confirm permanent deletion.
            </p>
            <input
              type="text"
              className="input input-bordered w-full h-10 text-sm"
              placeholder="Type user name to confirm"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
            />
          </div>
        )}
      </ConfirmModal>
      <ConfirmModal
        open={confirmSave}
        onClose={() => setConfirmSave(false)}
        onConfirm={doSaveUser}
        title={editingUser ? 'Save changes' : 'Create user'}
        message={
          editingUser
            ? 'Are you sure you want to save the changes for this user?'
            : 'Are you sure you want to create this user and send a temporary password to their email?'
        }
        confirmLabel={editingUser ? 'Save' : 'Create'}
        cancelLabel="Cancel"
        variant="primary"
        loading={actionLoading}
      />
    </div>
  );
}
