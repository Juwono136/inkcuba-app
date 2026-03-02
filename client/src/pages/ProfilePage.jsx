import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiCamera, FiLock, FiUser, FiTrash2 } from 'react-icons/fi';
import Navbar from '../components/layout/Navbar';
import Breadcrumb from '../common/Breadcrumb';
import FormInput from '../common/FormInput';
import ConfirmModal from '../common/ConfirmModal';
import { updateProfile, uploadAvatar, changePassword, logout } from '../features/auth/authSlice';

const MAX_AVATAR_SIZE_MB = 2;
const PASSWORD_HINT =
  'At least 8 characters with uppercase, lowercase, number, and special character (e.g. Admin123!).';

function getInitials(name) {
  if (!name || typeof name !== 'string') return '?';
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

function getAvatarImageUrl(avatarUrl) {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith('data:') || avatarUrl.startsWith('http')) return avatarUrl;
  const base = import.meta.env.VITE_API_URL || '';
  return `${base}/api/uploads/avatars/${avatarUrl}`;
}

export default function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const fileInputRef = useRef(null);

  const [profileForm, setProfileForm] = useState({
    name: '',
    avatarUrl: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [confirmSaveProfileOpen, setConfirmSaveProfileOpen] = useState(false);
  const [confirmChangePasswordOpen, setConfirmChangePasswordOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name ?? '',
        avatarUrl: user.avatarUrl ?? '',
      });
    }
  }, [user?.id, user?.name, user?.avatarUrl]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPEG, PNG, WebP or GIF).');
      return;
    }
    if (file.size > MAX_AVATAR_SIZE_MB * 1024 * 1024) {
      toast.error(`Image must be under ${MAX_AVATAR_SIZE_MB} MB.`);
      return;
    }
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const result = await dispatch(uploadAvatar(formData)).unwrap();
      setProfileForm((prev) => ({ ...prev, avatarUrl: result.avatarUrl }));
      toast.success('Photo updated. Click "Save profile" to keep changes.');
    } catch (err) {
      toast.error(err || 'Failed to upload photo.');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setProfileForm((prev) => ({ ...prev, avatarUrl: '' }));
    toast.success('Photo removed. Click "Save profile" to save.');
  };

  const handleSaveProfileSubmit = (e) => {
    e.preventDefault();
    const name = profileForm.name?.trim();
    if (!name) {
      toast.error('Name is required.');
      return;
    }
    setConfirmSaveProfileOpen(true);
  };

  const doSaveProfile = async () => {
    const name = profileForm.name?.trim();
    setProfileLoading(true);
    try {
      const payload = { name };
      const av = profileForm.avatarUrl;
      if (av !== undefined && av !== null && av !== '' && !av.startsWith('data:')) {
        payload.avatarUrl = av;
      } else if (av === '' || (av !== undefined && !av)) {
        payload.avatarUrl = '';
      }
      await dispatch(updateProfile(payload)).unwrap();
      toast.success('Profile updated successfully.');
      setConfirmSaveProfileOpen(false);
    } catch (err) {
      toast.error(err || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePasswordSubmit = (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match.');
      return;
    }
    const complexity = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!complexity.test(newPassword)) {
      toast.error('New password does not meet the required format.');
      return;
    }
    setConfirmChangePasswordOpen(true);
  };

  const doChangePassword = async () => {
    const { currentPassword, newPassword } = passwordForm;
    setPasswordLoading(true);
    try {
      await dispatch(
        changePassword({ currentPassword, newPassword })
      ).unwrap();
      toast.success('Password changed. Please sign in with your new password.');
      setConfirmChangePasswordOpen(false);
      dispatch(logout());
      navigate('/login', {
        replace: true,
        state: { message: 'Your password was changed. Please sign in with your new password.' },
      });
    } catch (err) {
      toast.error(err || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-8">
          <div className="animate-pulse flex flex-col gap-4">
            <div className="h-8 bg-base-300 rounded w-1/3" />
            <div className="h-48 bg-base-300 rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }

  const avatarSource =
    profileForm.avatarUrl !== undefined ? profileForm.avatarUrl : (user?.avatarUrl ?? '');
  const displayAvatarUrl = getAvatarImageUrl(avatarSource);

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'Edit profile' },
          ]}
        />

        <div className="space-y-8">
          {/* Profile section */}
          <div className="bg-base-100 rounded-2xl border border-base-200/80 shadow-sm overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-[#3B613A] to-[#4a7549]" />
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-[#3B613A]/10 flex items-center justify-center flex-shrink-0">
                  <FiUser className="w-6 h-6 text-[#3B613A]" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[#303030]">Profile information</h1>
                  <p className="text-sm text-[#303030]/60 mt-0.5">
                    Update your name and profile photo. Photos are stored securely.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveProfileSubmit} className="space-y-8">
                {/* Avatar block */}
                <div className="flex flex-col sm:flex-row gap-8 items-start">
                  <div className="w-full sm:w-auto flex flex-col items-center sm:items-start">
                    <div
                      className="relative w-32 h-32 rounded-2xl overflow-hidden bg-base-200 border-2 border-dashed border-base-300 flex items-center justify-center group cursor-pointer transition-colors hover:border-[#3B613A]/40 hover:bg-base-200/80"
                      onClick={() => !avatarUploading && fileInputRef.current?.click()}
                      onKeyDown={(e) => {
                        if ((e.key === 'Enter' || e.key === ' ') && !avatarUploading) {
                          e.preventDefault();
                          fileInputRef.current?.click();
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label="Change profile photo"
                    >
                      {avatarUploading ? (
                        <span className="loading loading-spinner loading-lg text-[#3B613A]" />
                      ) : displayAvatarUrl ? (
                        <img
                          src={displayAvatarUrl}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl font-semibold text-[#3B613A]">
                          {getInitials(profileForm.name || user.name)}
                        </span>
                      )}
                      {!avatarUploading && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                          <FiCamera className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={handleAvatarFile}
                    />
                    <div className="mt-3 flex flex-col items-center gap-2">
                      <button
                        type="button"
                        onClick={() => !avatarUploading && fileInputRef.current?.click()}
                        disabled={avatarUploading}
                        className="btn btn-ghost btn-sm text-[#3B613A] hover:bg-[#3B613A]/10 gap-1.5"
                      >
                        <FiCamera className="w-4 h-4" />
                        Change photo
                      </button>
                      {displayAvatarUrl && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          disabled={avatarUploading}
                          className="btn btn-ghost btn-sm text-[#303030]/60 hover:text-error hover:bg-error/10 gap-1.5"
                        >
                          <FiTrash2 className="w-4 h-4" />
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-[#303030]/50 mt-1 text-center sm:text-left">
                      JPG, PNG, WebP or GIF · max {MAX_AVATAR_SIZE_MB} MB
                    </p>
                  </div>

                  <div className="flex-1 w-full min-w-0 space-y-5">
                    <FormInput
                      label="Full name"
                      name="name"
                      type="text"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      required
                      placeholder="Your display name"
                      className="text-sm"
                    />
                    <div className="rounded-xl bg-base-200/50 border border-base-200/80 p-4">
                      <p className="text-xs font-medium text-[#303030]/60 uppercase tracking-wider">
                        Email
                      </p>
                      <p className="mt-1 font-medium text-[#303030] break-all">{user.email}</p>
                      <p className="text-xs text-[#303030]/50 mt-1">
                        Email cannot be changed here.
                      </p>
                    </div>
                    <div className="rounded-xl bg-base-200/50 border border-base-200/80 p-4">
                      <p className="text-xs font-medium text-[#303030]/60 uppercase tracking-wider">
                        Role
                      </p>
                      <p className="mt-1 font-medium text-[#303030] capitalize">{user.role}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    className="btn bg-[#3B613A] border-[#3B613A] hover:bg-[#4a7549] text-white rounded-xl px-6"
                    disabled={profileLoading}
                  >
                    Save profile
                  </button>
                </div>
              </form>

              <ConfirmModal
                open={confirmSaveProfileOpen}
                onClose={() => !profileLoading && setConfirmSaveProfileOpen(false)}
                onConfirm={doSaveProfile}
                title="Save profile"
                message="Save your name and profile photo changes?"
                confirmLabel="Save"
                cancelLabel="Cancel"
                variant="primary"
                loading={profileLoading}
              />
            </div>
          </div>

          {/* Change password section */}
          <div className="bg-base-100 rounded-2xl border border-base-200/80 shadow-sm overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-[#3B613A] to-[#4a7549]" />
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#3B613A]/10 flex items-center justify-center">
                  <FiLock className="w-5 h-5 text-[#3B613A]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#303030]">Change password</h2>
                  <p className="text-sm text-[#303030]/60">
                    After changing your password, you will need to sign in again. We will send you an
                    email confirmation.
                  </p>
                </div>
              </div>

              <form onSubmit={handleChangePasswordSubmit} className="space-y-4 max-w-md">
                <FormInput
                  label="Current password"
                  name="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  showPasswordToggle
                  autoComplete="current-password"
                />
                <FormInput
                  label="New password"
                  name="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  required
                  showPasswordToggle
                  autoComplete="new-password"
                />
                <FormInput
                  label="Confirm new password"
                  name="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  showPasswordToggle
                  autoComplete="new-password"
                />
                <p className="text-xs text-[#303030]/60 leading-relaxed">{PASSWORD_HINT}</p>
                <button
                  type="submit"
                  className="btn bg-[#3B613A] border-[#3B613A] hover:bg-[#4a7549] text-white rounded-xl px-6"
                  disabled={passwordLoading}
                >
                  Change password
                </button>
              </form>

              <ConfirmModal
                open={confirmChangePasswordOpen}
                onClose={() => !passwordLoading && setConfirmChangePasswordOpen(false)}
                onConfirm={doChangePassword}
                title="Change password"
                message="You will be signed out and must sign in again with your new password. An email confirmation will be sent. Continue?"
                confirmLabel="Change password"
                cancelLabel="Cancel"
                variant="primary"
                loading={passwordLoading}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
