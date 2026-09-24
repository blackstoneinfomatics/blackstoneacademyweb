import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "@/context/ThemeContext";
import ApiSetupInitializer from "@/app/_components/ApiSetupInitializer";
import "../styles/globals.css";
import ToastProvider from "@/app/_components/ToastProvider";
const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"], // Specify the weights you need
});

export const metadata: Metadata = {
  title: "Alfurqan Academy",
  description: "From Learn Quran Alfurqan Academy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={poppins.className} suppressHydrationWarning>
        <ApiSetupInitializer />
        <ThemeProvider>
          <GoogleOAuthProvider clientId="808839308794-3eomcaalqhd64m3c0i2vn2m2jd35i6uv.apps.googleusercontent.com">
            {children}
            <ToastProvider />
          </GoogleOAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
