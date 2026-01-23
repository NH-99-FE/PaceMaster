import { Suspense, lazy } from 'react';
import AppLayout from '@/app/AppLayout';
import DashboardSkeleton from '@/components/shared/DashboardSkeleton';
import PracticeSkeleton from '@/components/shared/PracticeSkeleton';
import RecordsSkeleton from '@/components/shared/RecordsSkeleton';
import ReviewSkeleton from '@/components/shared/ReviewSkeleton';
import SettingsSkeleton from '@/components/shared/SettingsSkeleton';
import { createBrowserRouter, Navigate } from 'react-router';

const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const PracticePage = lazy(() => import('@/pages/PracticePage'));
const RecordsPage = lazy(() => import('@/pages/RecordsPage'));
const RecordDetailPage = lazy(() => import('@/pages/RecordDetailPage'));
const ReviewPage = lazy(() => import('@/pages/ReviewPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<DashboardSkeleton />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'practice',
        element: (
          <Suspense fallback={<PracticeSkeleton />}>
            <PracticePage />
          </Suspense>
        ),
      },
      {
        path: 'records',
        element: (
          <Suspense fallback={<RecordsSkeleton />}>
            <RecordsPage />
          </Suspense>
        ),
      },
      {
        path: 'records/:id',
        element: (
          <Suspense fallback={<ReviewSkeleton variant="recordDetail" />}>
            <RecordDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'review',
        element: (
          <Suspense fallback={<ReviewSkeleton />}>
            <ReviewPage />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<SettingsSkeleton />}>
            <SettingsPage />
          </Suspense>
        ),
      },
    ],
  },
]);
