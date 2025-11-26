import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import { registerSchema, type RegisterSchema } from "@/schemes/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRegisterMutation } from "../hooks/useRegisterMutation";

export const RegisterForm = () => {

    const { onSubmit } = useRegisterMutation();

    const registerForm = useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            username: "",
            password: "",
        },
    });

    return <Form {...registerForm}> 
    <form onSubmit={registerForm.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
            control={registerForm.control}
            name="email"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                        <Input placeholder="Email" type="email" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        ></FormField>
        <FormField
            control={registerForm.control}
            name="username"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Nome de usuário</FormLabel>
                    <FormControl>
                        <Input placeholder="Nome de usuário" type="text" autoComplete="username" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        ></FormField>
        <FormField
            control={registerForm.control}
            name="password"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                        <Input placeholder="Senha" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        ></FormField>
        <Button type="submit" className="w-full">Cadastrar</Button>
    </form>
    </Form>
       
}