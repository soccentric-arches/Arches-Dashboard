import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/app/providers";
import { PLATFORM_SLUG } from "@/lib/platform";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const PLATFORM_NAME = process.env.NEXT_PUBLIC_PLATFORM_NAME ?? "Acadia";

const THEME_STORAGE_KEY = `${PLATFORM_SLUG}.theme.mode`;

// Runs before hydration and before first paint, mirroring the runtime
// logic in app-shell-context.tsx: a stored "dark" forces dark, a stored
// "light" forces light, anything else ("system" or unset) follows the OS
// preference. Without this, an operator running the dark theme sees a
// white flash on every load. `suppressHydrationWarning` on <html> covers
// the className attribute this script may have set before React hydrates.
const THEME_BOOTSTRAP = `(function(){try{var m=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(m==="dark"){document.documentElement.classList.add("dark");return}if(m!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches){document.documentElement.classList.add("dark")}}catch(e){}})();`;

export const metadata: Metadata = {
  title: `${PLATFORM_NAME} IV&V Console`,
  description: "Operator console for SiliconCentric IV&V validation runs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}