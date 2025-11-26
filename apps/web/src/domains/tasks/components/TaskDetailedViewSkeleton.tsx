import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const TaskDetailedViewSkeleton = () => {
  return (
    <Card className="w-full p-4 gap-2 flex flex-wrap">
      <Skeleton className="w-full h-6"></Skeleton>
      <Skeleton className="w-full h-6"></Skeleton>
      <Skeleton className="w-full h-6"></Skeleton>
    </Card>
  );
};
