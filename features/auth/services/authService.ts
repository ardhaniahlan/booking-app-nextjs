import { LoginFormInputs } from "../schema/loginSchema";
import { RegisterFormInputs } from "../schema/registerSchema";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

export const authService = {
  async login(data: LoginFormInputs) {
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
    if (authError) throw new Error(authError.message);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    if (profileError) throw new Error("Gagal mengambil profil pengguna");
    return {
      user: authData.user,
      role: profile?.role,
    };
  },

  async register(data: RegisterFormInputs) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          phone_number: data.phoneNumber,
          role: data.role
        },
      },
    });

    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error("Gagal mendaftar");

    return authData;
  },

  async logout() {
    await supabase.auth.signOut();
    return true;
  },
};
