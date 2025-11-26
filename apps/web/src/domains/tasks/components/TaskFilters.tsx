import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  taskListFilterSchema,
  type TaskListFilterSchema,
} from "@/schemes/tasksSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { FilterIcon, TrashIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { TaskStatusObject } from "../consts/TaskStatus";
import { TaskPriority } from "../consts/TaskPriority";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthStore } from "@/domains/auth/store/auth.store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const TaskFilters = ({ onSubmit }: { onSubmit: (data: TaskListFilterSchema) => void }) => {
  const { sub } = useAuthStore((state) => state);

  const form = useForm<TaskListFilterSchema>({
    resolver: zodResolver(taskListFilterSchema),
    defaultValues: {
      title: "",
      status: undefined,
      priority: undefined,
      userIds: [],
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
  });

  return (
      <Form {...form}>
        <form onSubmit={handleSubmit} className="flex gap-4 flex-wrap w-full">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem style={{ flex: "200px" }}>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input placeholder="Título" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem style={{ flex: "60px" }}>
                <FormLabel>Status</FormLabel>
                <FormControl className="w-full">
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ''}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Todas" {...field} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(TaskStatusObject).map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          ></FormField>

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem style={{"flex": "60px" }}>
                <FormLabel>Prioridade</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ''}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Todas" {...field} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(TaskPriority).map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="userIds"
            render={({ field }) => {
              const handleCheckedChange = (checked: boolean) => {
                let newIds: number[] = [];
                if (checked) {
                  newIds = [sub!.userId];
                } else {
                  newIds = [];
                }
                field.onChange(newIds);
              };

              return (
                <FormItem  className="flex flex-col items-center">
                  <FormLabel>Eu estou envolvido</FormLabel>
                  <FormControl className=" h-5 w-5 mt-1">
                    <div className="flex items-center justify-center h-full ">
                      <Checkbox
                        className="h-5 w-5"
                        checked={field.value?.includes(sub!.userId)}
                        onCheckedChange={handleCheckedChange}
                      />
                    </div>

                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          ></FormField>
          <div className="flex items-center justify-center flex-col flex-1">
            <div className="invisible" style={{fontSize: '.6rem'}}>Btn</div>
            <div className="flex gap-2 w-full overflow-hidden">
              <Button type="button" variant="outline" className="mt-2 flex-1" onClick={() => form.reset()}>
                <TrashIcon />
                Limpar
              </Button>
              <Button type="submit" className="mt-2 flex-1" variant={`outline`}>
                <FilterIcon className="w-4 h-4" />
                Filtrar
              </Button>
            </div>
          </div>
        </form>
      </Form>
  );
};
