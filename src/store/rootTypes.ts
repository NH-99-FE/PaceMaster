import type { SessionSlice } from '@/store/sessionSlice';
import type { TemplateSlice } from '@/store/templateSlice';
import type { StatsSlice } from '@/store/statsSlice';
import type { UISlice } from '@/store/uiSlice';

// RootState 是所有 slice 的类型合并（给 Zustand 与中间件推断用）。
export type RootState = SessionSlice & TemplateSlice & StatsSlice & UISlice;
