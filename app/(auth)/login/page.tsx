import AuthForm from "@/features/auth/components/AuthForm";
import InputField from "@/features/auth/components/InputField";

const LoginPage = () => {
  return (
    <AuthForm
      title="Welcome back"
      subtitle="Sign in to manage your bookings and preferences."
      icon={
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
      }
      footerText="Don't have an account?"
      footerLinkText="Sign up now"
      footerLinkHref="/register"
    >
      <form className="space-y-4">
        <InputField 
          label="Email address" 
          type="email" 
          placeholder="name@example.com" 
        />
        
        <InputField 
          label="Password" 
          type="password" 
          placeholder="••••••••" 
        />
        
        <button className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center gap-2 mt-6">
          Sign In
        </button>
      </form>
    </AuthForm>
  );
}

export default LoginPage;