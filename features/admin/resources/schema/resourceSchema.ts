import z from "zod";

const resourceSchema = z.object({
  name: z.string().min(3, "Nama resource minimal 3 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  category: z.string().min(1, "Kategori harus dipilih"),
  capacity: z.number().min(1, "Kapasitas minimal 1"),
  price: z.number().min(0, "Harga tidak boleh kurang dari 0"),
  price_unit: z.enum(["hour", "day", "session"]),
  image_urls: z.array(z.string()),
  quantity: z.number().min(1, "Minimal stok adalah 1"),
});

export type ResourceFormInputs = z.infer<typeof resourceSchema>;
export default resourceSchema;
