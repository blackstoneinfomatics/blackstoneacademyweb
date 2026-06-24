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
    <html lang="en">
      <body className={poppins.className}>
        <ApiSetupInitializer />
        <ThemeProvider>
          <GoogleOAuthProvider clientId="672400357916-n7nem2lvccl389dtpg50guj2i6gdsl8t.apps.googleusercontent.com">
            {children}
            <ToastProvider />
          </GoogleOAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
