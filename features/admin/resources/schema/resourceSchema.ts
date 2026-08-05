import z from "zod";

const resourceSchema = z.object({
  name: z.string().min(3, "Nama resource minimal 3 karakter"),
  category: z.string().min(1, "Kategori harus dipilih"),
  capacity: z.number().min(1, "Kapasitas minimal 1"),
});

export type ResourceFormInputs = z.infer<typeof resourceSchema>;
export default resourceSchema;