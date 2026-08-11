import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import AuthProvider from "@/features/auth/components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "BookingApp | Sewa Barang & Ruangan dengan Cepat dan Aman",
    template: "%s | BookingApp",
  },
  description:
    "Platform end-to-end terpercaya untuk menemukan, menyewa, dan mengelola penyewaan barang serta ruangan. Solusi mudah bagi penyewa dan vendor.",
  keywords: [
    "booking online",
    "sewa barang",
    "sewa ruangan",
    "rental",
    "vendor",
    "platform sewa",
  ],
  authors: [{ name: "Ardhani Ahlan" }],
  creator: "Ardhani Ahlan",
  
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://bookingapp.com",
    title: "BookingApp | Sewa Barang & Ruangan",
    description: "Platform end-to-end terpercaya untuk menemukan dan menyewa berbagai kebutuhan Anda.",
    siteName: "BookingApp",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BookingApp Preview",
      },
    ],
  },
  
  twitter: {
    card: "summary_large_image",
    title: "BookingApp | Sewa Barang & Ruangan",
    description: "Platform end-to-end terpercaya untuk menemukan dan menyewa berbagai kebutuhan Anda.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id" 
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}