'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Course } from '@/lib/types';
import { fetchCourses, type AuthResponse } from '@/lib/api';
import { courses as fallbackCourses } from '@/lib/data/courses';

const AUTH_KEY = 'course-compass-auth';
const COURSES_KEY = 'course-compass-courses';

type AppContextValue = {
  auth: AuthResponse | null;
  courses: Course[];
  loadingCourses: boolean;
  setAuth: (auth: AuthResponse | null) => void;
  refreshCourses: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuthState] = useState<AuthResponse | null>(null);
  const [courses, setCourses] = useState<Course[]>(fallbackCourses);
  const [loadingCourses, setLoadingCourses] = useState(false);

  useEffect(() => {
    const savedAuth = localStorage.getItem(AUTH_KEY);
    const savedCourses = localStorage.getItem(COURSES_KEY);
    if (savedAuth) setAuthState(JSON.parse(savedAuth));
    if (savedCourses) setCourses(JSON.parse(savedCourses));
  }, []);

  const setAuth = useCallback((nextAuth: AuthResponse | null) => {
    setAuthState(nextAuth);
    if (nextAuth) localStorage.setItem(AUTH_KEY, JSON.stringify(nextAuth));
    else localStorage.removeItem(AUTH_KEY);
  }, []);

  const refreshCourses = useCallback(async () => {
    setLoadingCourses(true);
    try {
      const response = await fetchCourses({ limit: 100 });
      setCourses(response.items);
      localStorage.setItem(COURSES_KEY, JSON.stringify(response.items));
    } catch (error) {
      console.warn('Using local course fallback because API is unavailable.', error);
    } finally {
      setLoadingCourses(false);
    }
  }, []);

  useEffect(() => {
    refreshCourses();
  }, [refreshCourses]);

  const value = useMemo(
    () => ({ auth, courses, loadingCourses, setAuth, refreshCourses }),
    [auth, courses, loadingCourses, refreshCourses, setAuth]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useAppContext must be used within AppProvider');
  return value;
}
