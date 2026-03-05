import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import adminUsersReducer from '../features/admin/userManagementSlice';
import lecturerWorkspacesReducer from '../features/lecturer/workspaceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    adminUsers: adminUsersReducer,
    lecturerWorkspaces: lecturerWorkspacesReducer,
  },
});
