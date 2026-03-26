import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { AppToaster } from "@/components/AppToaster";
import Header from "@/components/layout/Header";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const appName =
  process.env.NEXT_PUBLIC_APP_NAME?.trim() ||
  "Akhil Bhartiya Kushwaha Mahasabha";

export const metadata: Metadata = {
  title: {
    default: appName,
    template: `%s | ${appName}`,
  },
  description:
    "राष्ट्रीय स्तर का समाज कल्याण संगठन — सशक्तिकरण, समुदाय प्रतिनिधित्व और भारत भर में विकास।",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi" className={`${inter.variable} ${poppins.variable}`}>
      <body className="min-h-screen bg-background-white font-body text-body antialiased">
        <Header />
        <AppToaster />
        <div className="pt-[var(--site-header-offset)]">{children}</div>
      </body>
    </html>
  );
}
