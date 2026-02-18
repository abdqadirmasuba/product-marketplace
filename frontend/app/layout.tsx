import type { Metadata } from "next";
import "./globals.css";
import ReduxProvider from "@/components/ReduxProvider";
import ThemeProvider from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Product Marketplace",
  description: "Manage and browse products with approval workflow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <ReduxProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}

