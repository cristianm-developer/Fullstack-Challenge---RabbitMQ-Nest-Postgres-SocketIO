import { Button } from "@/components/ui/button";
import type { PaginationInfoSchema } from "@/schemes/paginationSchema";

export const TaskPagination = ({
  meta,
  setPage,
}: {
  meta: PaginationInfoSchema;
  setPage: (page: number) => void;
}) => {
  return (
    meta.totalPages > 1 && (
      <div className="flex items-center justify-center gap-4">
        {meta.page > 1 && (
          <Button onClick={() => setPage(meta.page - 1)} variant="outline">
            Anterior
          </Button>
        )}
        <span className="text-sm text-muted-foreground">
          {meta.page} de {meta.totalPages}
        </span>
        {meta.page < meta.totalPages && (
          <Button onClick={() => setPage(meta.page + 1)} variant="outline">
            Próximo
          </Button>
        )}
      </div>
    )
  );
};
