
import React from 'react';
import { Route } from 'react-router-dom';
import { AdminGuard } from '@/components/admin/AdminGuard';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminPlans from '@/pages/admin/AdminPlans';
import AdminPayments from '@/pages/admin/AdminPayments';
import AdminAdministrators from '@/pages/admin/AdminAdministrators';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminGroups from '@/pages/admin/AdminGroups';
import AdminSettings from '@/pages/admin/AdminSettings';

export const adminRoutes = [
  <Route key="admin-login" path="/admin" element={<AdminLogin />} />,
  <Route key="admin-dashboard" path="/admin/dashboard" element={<AdminGuard><AdminDashboard /></AdminGuard>} />,
  <Route key="admin-users" path="/admin/users" element={<AdminGuard><AdminUsers /></AdminGuard>} />,
  <Route key="admin-plans" path="/admin/plans" element={<AdminGuard><AdminPlans /></AdminGuard>} />,
  <Route key="admin-payments" path="/admin/payments" element={<AdminGuard><AdminPayments /></AdminGuard>} />,
  <Route key="admin-administrators" path="/admin/administrators" element={<AdminGuard><AdminAdministrators /></AdminGuard>} />,
  <Route key="admin-groups" path="/admin/groups" element={<AdminGuard><AdminGroups /></AdminGuard>} />,
  <Route key="admin-settings" path="/admin/settings" element={<AdminGuard><AdminSettings /></AdminGuard>} />,
];
