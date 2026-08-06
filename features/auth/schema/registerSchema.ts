import z from "zod";

const registerSchema = z.object({
  fullName: z
    .string()
    .min(3, "Nama lengkap minimal 3 karakter")
    .regex(/^[a-zA-Z ]+$/, "Nama hanya boleh mengandung huruf dan spasi"),
  email: z.string().min(1, "Email tidak boleh kosong").email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  confirmPassword: z.string().min(1, "Konfirmasi password tidak boleh kosong"),
  role: z.enum(["user", "vendor", "admin"])
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password dan konfirmasi password tidak cocok",
  path: ["confirmPassword"],
});

export type RegisterFormInputs = z.infer<typeof registerSchema>;

export default registerSchema;