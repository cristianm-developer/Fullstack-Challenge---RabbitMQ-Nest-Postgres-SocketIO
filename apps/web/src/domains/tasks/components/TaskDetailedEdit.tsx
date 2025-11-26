import { Card } from "@/components/ui/card";
import { DatePickerWithTime } from "@/components/ui/dataPicker";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createTaskSchema,
  taskSchema,
  type CreateTaskSchema,
  type TaskSchema,
} from "@/schemes/tasksSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { TaskPriority } from "../consts/TaskPriority";
import { TaskStatusObject } from "../consts/TaskStatus";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";
import { MdArrowBack } from "react-icons/md";
import { useGetUsersQuery } from "@/domains/auth/hooks/useGetUsersQuery";
import type { UserListedSchema } from "@/schemes/authSchema";
import { ReactSelect } from "@/components/ui/reactSelect";
import { useCreateTaskMutation } from "../hooks/useCreateTaskMutation";
import { Link } from "@tanstack/react-router";
import { useEffect } from "react";

export const TaskDetailedEditor = ({ task }: { task?: TaskSchema }) => {
  
  const taskForm = useForm<CreateTaskSchema>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",    
      priority: undefined,
      status: undefined,
    }
  });

  const {
    data: usersListed,
    isLoading,
    isError,
  } = useGetUsersQuery() as {
    data: UserListedSchema[];
    isLoading: boolean;
    isError: boolean;
  };
  
  useEffect(() => {
    if(task) {
      setTimeout(() => {
        const parsedTask = taskSchema.parse(task);
        taskForm.reset(parsedTask);
      }, 0);
    }
  }, [task])
  
  const { mutate: createOrUpdateMutation } = useCreateTaskMutation();
  const handleCreateOrUpdateSubmit = taskForm.handleSubmit((data) => {
    createOrUpdateMutation({ data, taskId: task?.id });
  });

  return (
    <>
      <div className="flex items-center gap-2 justify-between">
        <h1 className="text-2xl font-bold">Editar Tarefa</h1>
        <div className="flex items-center gap-2">
          <Link to="/Tasks">
            <Button variant="outline" size="icon"> 
              <MdArrowBack className="w-4 h-4" />
            </Button>
          </Link>
          <Button variant="outline" size="icon" onClick={() => (document.getElementById('TaskFormSubmit') as HTMLButtonElement)?.click()}>
            <CheckIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <Card className="w-full p-4 gap-2 flex flex-wrap">
        <Form {...taskForm} >
          <form id="TaskForm" onSubmit={handleCreateOrUpdateSubmit} className="space-y-4">
            <button id="TaskFormSubmit" type="submit" hidden />
            <FormField
              control={taskForm.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Título" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
            <FormField
              control={taskForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descrição" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
            <FormField
              control={taskForm.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prazo</FormLabel>
                  <FormControl>
                    <DatePickerWithTime
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
            <FormField
              control={taskForm.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prioridade</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue                      
                          placeholder="Selecione a prioridade"                        
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(TaskPriority).map((priority) => (
                          <SelectItem
                            key={priority.value}
                            value={priority.value}
                          >
                            {priority.label}
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
              control={taskForm.control}
              name="status"
              render={({ field }) => (
                <FormItem style={{ flex: "60px" }}>
                  <FormLabel>Status</FormLabel>
                  <FormControl className="w-full" >
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <SelectTrigger className="w-full" >
                        <SelectValue
                          placeholder="Selecione o status"
                        />
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
              control={taskForm.control}
              name="userIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuários envolvidos</FormLabel>
                  <FormControl>
                    <ReactSelect
                      isMulti
                      placeholder="Selecione os usuários"
                      isLoading={isLoading}
                      isDisabled={isLoading || isError}
                      onChange={(
                        selectedOptions: { value: number; label: string }[]
                      ) => {
                        const newIds =
                          selectedOptions?.map(
                            (option: { value: number; label: string }) =>
                              option.value
                          ) || [];
                        field.onChange(newIds);
                      }}
                      options={usersListed?.map((user) => ({
                        value: user.id,
                        label: user.username,
                      }))}
                      value={field.value?.map((id: number) => ({
                        value: id,
                        label:
                          usersListed?.find((user) => user.id === id)
                            ?.username || "",
                      }))}
                    ></ReactSelect>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
          </form>
        </Form>
      </Card>
    </>
  );
};
