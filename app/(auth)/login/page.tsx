"use client";

import AuthForm from "@/features/auth/components/AuthForm";
import InputField from "@/features/auth/components/InputField";
import loginSchema, {
  LoginFormInputs,
} from "@/features/auth/schema/loginSchema";
import { authService } from "@/features/auth/services/authService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAuthStore } from "@/features/auth/store/authStore";

const LoginPage = () => {
  const router = useRouter();

  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      const {user, role} = await authService.login(data);
      setAuth(
        {
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name, 
          role: user.user_metadata?.role
        },
        role
      );
      router.refresh();

      if (role === "vendor") {
        router.replace("/dashboard");
      } else {
        router.replace("/explore");
      }
    } catch (error: any) {
      console.error(error.message);
      toast.error(error.message);
    }
  };

  return (
    <AuthForm
      title="Welcome back"
      subtitle="Sign in to manage your bookings and preferences."
      icon={
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
          />
        </svg>
      }
      footerText="Don't have an account?"
      footerLinkText="Sign up now"
      footerLinkHref="/register"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <InputField
          label="Email address"
          type="email"
          placeholder="name@example.com"
          registration={register("email")}
          error={errors.email}
        />

        <InputField
          label="Password"
          type="password"
          placeholder="••••••••"
          registration={register("password")}
          error={errors.password}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center gap-2 mt-6"
        >
          {isSubmitting ? "Signing In..." : "Sign In"}
        </button>
      </form>
    </AuthForm>
  );
};

export default LoginPage;
