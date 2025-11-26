import { Badge } from "@/components/ui/badge";
import type { UserListedSchema } from "@/schemes/authSchema";
import type { CommentSchema } from "@/schemes/tasksSchema";

export const CommentItem = ({
  comment,
  user,
}: {
  comment: CommentSchema;
  user: UserListedSchema | undefined;
}) => {
  return (
    <div className="flex flex-col gap-0 w-full rounded bg-secondary p-2">
      <div className="flex items-center gap-2 justify-between">
        {!!user && <Badge variant={'outline'}>{user.username}</Badge>}
        <span className="text-sm opacity-50" style={{fontSize: '0.65rem'}}>{new Date(comment.createdAt).toLocaleString()}</span>
      </div>
      <span className="text-sm w-full px-2">{comment.content}</span>
    </div>
  );
};
