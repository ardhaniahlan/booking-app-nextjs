"use client"

import AuthForm from "@/features/auth/components/AuthForm";
import InputField from "@/features/auth/components/InputField";
import { RegisterFormInputs } from "@/features/auth/schema/registerSchema";
import registerSchema from "@/features/auth/schema/registerSchema";
import { authService } from "@/features/auth/services/authService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const RegisterPage = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  }); 

  const onSubmit = async (data: RegisterFormInputs) => {
    try {
      await authService.register(data);
      router.push("/login")
      toast.success("Pendaftaran berhasil!")
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
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
      }
      footerText="Already have an account?"
      footerLinkText="Sign in now"
      footerLinkHref="/login"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        
        <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center gap-2 mt-6">
          {isSubmitting ? "Signing Up..." : "Sign Up"}
        </button>
      </form>
    </AuthForm>
  );
};

export default RegisterPage;