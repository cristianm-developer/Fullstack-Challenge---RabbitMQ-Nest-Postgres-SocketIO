import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RegisterForm } from "../components/RegisterForm";
import { Separator } from "@/components/ui/separator";
import { LoginForm } from "../components/LoginForm";

export const LoginView = () => {

  return (
    <div className="p-4 flex flex-col items-center justify-center h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Bem-vindo!</CardTitle>
          <CardDescription>Faça login ou registre-se para continuar</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="login" className="w-full space-y-4">
                <TabsList className="w-full">
                    <TabsTrigger className="flex-1" value="login">Login</TabsTrigger>
                    <Separator orientation="vertical" className="bg-gray-700"></Separator>
                    <TabsTrigger className="flex-1" value="register">Cadastro</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                    <LoginForm />
                </TabsContent>
                <TabsContent value="register">
                    <RegisterForm />
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
