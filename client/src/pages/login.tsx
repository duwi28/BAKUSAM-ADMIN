import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Truck, Lock, User, Eye, EyeOff, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

const loginSchema = z.object({
  username: z.string().min(1, "Username harus diisi"),
  password: z.string().min(1, "Password harus diisi"),
  rememberMe: z.boolean().default(false)
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false
    }
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginForm) => apiRequest("POST", "/api/auth/login", data),
    onSuccess: (response: any) => {
      // Store auth token
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("adminUser", JSON.stringify(response.user));
      
      toast({
        title: "🎉 Login Berhasil!",
        description: `Selamat datang kembali, ${response.user.fullName}!`,
      });
      
      // Redirect to dashboard
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "❌ Login Gagal",
        description: error.message || "Username atau password tidak valid",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  const handleDemoLogin = (role: 'admin' | 'regional') => {
    const demoCredentials = {
      admin: { username: "admin", password: "admin123", rememberMe: false },
      regional: { username: "regional", password: "regional123", rememberMe: false }
    };
    
    form.setValue("username", demoCredentials[role].username);
    form.setValue("password", demoCredentials[role].password);
    loginMutation.mutate(demoCredentials[role]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo & Branding */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Truck className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Bakusam Express
            </h1>
            <p className="text-gray-600">Admin Dashboard Login</p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center space-x-2 text-gray-800">
              <Shield className="w-5 h-5" />
              <span>Masuk ke Dashboard</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Masukkan username"
                            className="pl-10 h-12 border-gray-200 focus:border-blue-500"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Masukkan password"
                            className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    {...form.register("rememberMe")}
                  />
                  <Label htmlFor="rememberMe" className="text-sm text-gray-600">
                    Ingat saya
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Memproses..." : "Masuk Dashboard"}
                </Button>
              </form>
            </Form>

            {/* Demo Login Buttons */}
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Demo Login</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 border-blue-200 text-blue-600 hover:bg-blue-50"
                  onClick={() => handleDemoLogin('admin')}
                  disabled={loginMutation.isPending}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 border-green-200 text-green-600 hover:bg-green-50"
                  onClick={() => handleDemoLogin('regional')}
                  disabled={loginMutation.isPending}
                >
                  <User className="w-4 h-4 mr-2" />
                  Regional
                </Button>
              </div>
            </div>

            {/* Security Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-xs text-blue-700">
                  <p className="font-medium">Keamanan Terjamin</p>
                  <p>Login dilindungi dengan enkripsi SSL dan autentikasi dua faktor</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 space-y-2">
          <p>© 2024 Bakusam Express. All rights reserved.</p>
          <div className="flex justify-center space-x-4">
            <a href="#" className="hover:text-blue-600 transition-colors">Bantuan</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Kontak</a>
          </div>
        </div>
      </div>
    </div>
  );
}