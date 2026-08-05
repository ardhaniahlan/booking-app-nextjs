"use client";

import AuthForm from "@/features/auth/components/AuthForm";
import InputField from "@/features/auth/components/InputField";
import { RegisterFormInputs } from "@/features/auth/schema/registerSchema";
import registerSchema from "@/features/auth/schema/registerSchema";
import { authService } from "@/features/auth/services/authService";
import { useAuthStore } from "@/features/auth/store/authStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const RegisterPage = () => {
  const router = useRouter();

  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormInputs) => {
    try {
      const authData = await authService.register(data);

      if (authData.user) {
        setAuth(
          {
            id: authData.user.id,
            email: authData.user.email!,
            full_name: data.fullName,
            role: data.role,
          },
          data.role,
        );
      }

      router.refresh();

      if (data.role === "vendor") {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }

      toast.success("Registrasi berhasil! Selamat datang.");
    } catch (error: any) {
      console.error(error.message);
      toast.error(error.message);
    }
  };

  return (
    <AuthForm
      title="Create an Account"
      subtitle="Join BookingApp to easily manage your reservations and preferences."
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
      footerText="Already have an account?"
      footerLinkText="Sign in now"
      footerLinkHref="/login"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2 mb-2">
          <label className="block text-sm font-medium text-slate-700">
            Daftar Sebagai:
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="relative cursor-pointer">
              <input
                type="radio"
                value="user"
                {...register("role")}
                className="peer sr-only"
                defaultChecked
              />
              <div className="p-3 border-2 border-slate-200 rounded-xl text-center hover:bg-slate-50 peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:text-blue-700 transition-all">
                <span className="font-semibold text-sm block">Pelanggan</span>
                <span className="text-xs text-slate-500 font-normal">
                  Mencari & Menyewa
                </span>
              </div>
            </label>

            <label className="relative cursor-pointer">
              <input
                type="radio"
                value="vendor"
                {...register("role")}
                className="peer sr-only"
              />
              <div className="p-3 border-2 border-slate-200 rounded-xl text-center hover:bg-slate-50 peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:text-blue-700 transition-all">
                <span className="font-semibold text-sm block">Vendor</span>
                <span className="text-xs text-slate-500 font-normal">
                  Menyewakan Aset
                </span>
              </div>
            </label>
          </div>
          {errors.role && (
            <p className="text-red-500 text-xs mt-1">
              {errors.role.message as string}
            </p>
          )}
        </div>

        <InputField
          label="Full Name"
          type="text"
          placeholder="e.g. John Doe"
          registration={register("fullName")}
          error={errors.fullName}
        />

        <InputField
          label="Email Address"
          type="email"
          placeholder="name@company.com"
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

        <InputField
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          registration={register("confirmPassword")}
          error={errors.confirmPassword}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center gap-2 mt-6"
        >
          {isSubmitting ? "Signing Up..." : "Sign Up"}
        </button>
      </form>
    </AuthForm>
  );
};

export default RegisterPage;
