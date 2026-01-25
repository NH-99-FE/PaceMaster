import { Suspense, lazy } from 'react';
import AppLayout from '@/app/AppLayout';
import DashboardSkeleton from '@/components/shared/DashboardSkeleton';
import PracticeSkeleton from '@/components/shared/PracticeSkeleton';
import RecordsSkeleton from '@/components/shared/RecordsSkeleton';
import ReviewSkeleton from '@/components/shared/ReviewSkeleton';
import SettingsSkeleton from '@/components/shared/SettingsSkeleton';
import { createBrowserRouter, Navigate } from 'react-router';
import {
  loadDashboardPage,
  loadPracticePage,
  loadRecordsPage,
  loadRecordDetailPage,
  loadReviewPage,
  loadSettingsPage,
} from './loaders';

const DashboardPage = lazy(loadDashboardPage);
const PracticePage = lazy(loadPracticePage);
const RecordsPage = lazy(loadRecordsPage);
const RecordDetailPage = lazy(loadRecordDetailPage);
const ReviewPage = lazy(loadReviewPage);
const SettingsPage = lazy(loadSettingsPage);

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
        path: 'review/:reviewId?',
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
