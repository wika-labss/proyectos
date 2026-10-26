import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Category } from '../api/types';
import { getApiClient } from '../api';

interface CategoryContextValue {
  categories: Category[];
  category: Category | null;
  categoryId: string | null;
  setCategoryId: (id: string) => void;
  loading: boolean;
  refreshCategories: () => Promise<void>;
}

const CategoryContext = createContext<CategoryContextValue | undefined>(undefined);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshCategories = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getApiClient().listCategories();
      setCategories(list);
      setCategoryIdState((current) => {
        if (current && list.some((c) => c.id === current)) return current;
        return list[0]?.id ?? null;
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshCategories();
  }, [refreshCategories]);

  const setCategoryId = useCallback((id: string) => {
    setCategoryIdState(id);
  }, []);

  const category = useMemo(
    () => categories.find((c) => c.id === categoryId) ?? null,
    [categories, categoryId],
  );

  const value = useMemo(
    () => ({
      categories,
      category,
      categoryId,
      setCategoryId,
      loading,
      refreshCategories,
    }),
    [categories, category, categoryId, loading, refreshCategories, setCategoryId],
  );

  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>;
}

export function useCategory(): CategoryContextValue {
  const ctx = useContext(CategoryContext);
  if (!ctx) throw new Error('useCategory must be used within CategoryProvider');
  return ctx;
}
