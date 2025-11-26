import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { CreateCommentSchema } from "@/schemes/tasksSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, SendIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { useCreateCommentMutation } from "../hooks/useCreateCommentMutation"

export const CommentInput = ({taskId, onSubmit}: {taskId: number, onSubmit: () => void}) => { 


    const commentForm = useForm<CreateCommentSchema>({
        resolver: zodResolver(CreateCommentSchema),
        defaultValues: {
            content: ""            
        },
    })

    const {mutate: createComment, isPending} = useCreateCommentMutation();
    const onSubmitHandler = commentForm.handleSubmit((data) => {
        createComment({taskId, comment: data});
        commentForm.reset();
        onSubmit();
    });
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if(e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            document.getElementById('submit-comment-button')?.click();
        }
    }

    return <Form {...commentForm}>
        <form onSubmit={onSubmitHandler} className="flex gap-2 w-full items-center">
                <FormField
                control={commentForm.control}
                name="content"
                render={({ field }) => (
                    <FormItem className="flex-1">
                        <FormControl>
                            <Textarea onKeyDown={handleKeyDown} placeholder="Novo comentário..." style={{resize: 'none', fontSize:'0.85rem'}} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}>
                </FormField>
                <Button id="submit-comment-button" type="submit"  variant={'ghost'} className="h-full" disabled={commentForm.formState.isSubmitting || isPending}>
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendIcon className="w-4 h-4" />}
                </Button>
        </form>

    </Form>

}
