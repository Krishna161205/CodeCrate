import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import LayoutWrapper from "@/components/LayoutWrapper";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CodeCrate | AI Prompt & Workflow Marketplace",
  description: "CodeCrate is the world's most advanced repository for high-fidelity prompt engineering, pre-validated prompts, and developer workflows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <AuthProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
