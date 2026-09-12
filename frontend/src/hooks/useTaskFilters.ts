import { useSearchParams } from "react-router-dom";
import { useMemo, useCallback } from "react";
import { TaskFilters, TaskStatus, TaskPriority } from "../types/task";

export function useTaskFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<TaskFilters>(() => {
    const status = searchParams.get("status") as TaskStatus | null;
    const priority = searchParams.get("priority") as TaskPriority | null;
    const dueDateFrom = searchParams.get("dueDateFrom") || undefined;
    const dueDateTo = searchParams.get("dueDateTo") || undefined;
    const projectId = searchParams.get("projectId") || undefined;
    const pageParam = searchParams.get("page");
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 20;

    return {
      status: status || undefined,
      priority: priority || undefined,
      dueDateFrom,
      dueDateTo,
      projectId,
      page: isNaN(page) ? 1 : page,
      limit: isNaN(limit) ? 20 : limit,
    };
  }, [searchParams]);

  const setFilter = useCallback(
    (key: keyof TaskFilters, value: string | number | undefined | null) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value === undefined || value === null || value === "") {
            next.delete(key);
          } else {
            next.set(key, String(value));
          }
          if (key !== "page") {
            next.delete("page");
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const resetFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  return {
    filters,
    setFilter,
    resetFilters,
  };
}
