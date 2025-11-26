import { loginSchema, type LoginSchema } from "@/schemes/authSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useLoginMutation } from "../hooks/useLoginMutation"

export const LoginForm = () => {

    const loginForm = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            usernameOrEmail: "",
            password: "",
        },
    });    

    const { onSubmit } = useLoginMutation();

    return <Form {...loginForm}>
        <form onSubmit={loginForm.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
                control={loginForm.control}
                name="usernameOrEmail"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nome de usuário ou email</FormLabel>
                        <FormControl>
                            <Input placeholder="Nome de usuário ou email" autoComplete="username" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            ></FormField>
            <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                            <Input placeholder="Senha" type="password" autoComplete="current-password" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            ></FormField>
            <Button type="submit" className="w-full">Entrar</Button>
        </form>
    </Form>
}