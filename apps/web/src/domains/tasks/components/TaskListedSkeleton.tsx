import { Skeleton } from "@/components/ui/skeleton";

export const TaskListedSkeleton = () => {
  return (
    <>
    {Array.from({length: 3}).map((_, index) => 
      <Skeleton key={index} className="w-full h-24"></Skeleton>  
    )}
    </>
  );
};
