import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "@/context/ThemeContext";
import ApiSetupInitializer from "@/app/_components/ApiSetupInitializer";
import "../styles/globals.css";
import ToastProvider from "@/app/_components/ToastProvider";
import RouteChangeLoader from "./_components/RouteChangeLoader";
const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Blackstone Academy",
  description: "Learn about Blackstone Academy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={poppins.className} suppressHydrationWarning>
        <RouteChangeLoader />

        <ApiSetupInitializer />
        <ThemeProvider>
          <GoogleOAuthProvider clientId="206930130835-1evd8v3rfckjgf66shrmbjntihh82cgn.apps.googleusercontent.com">
            {children}
            <ToastProvider />
          </GoogleOAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
