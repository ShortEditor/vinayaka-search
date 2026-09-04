import type { Metadata } from "next";
import "./globals.css";
import ClientBody from "@/components/ClientBody";

export const metadata: Metadata = {
  title: "Matti Mūrti | Handcrafted Clay Idols Marketplace",
  description:
    "Browse and compare handcrafted clay idols by height and price from local artisans. Find the perfect mūrti for your home or temple.",
  keywords: [
    "Matti Mūrti",
    "clay idols",
    "Ganesh idol",
    "Vinayaka Chavithi",
    "Ganesh Chaturthi",
    "handcrafted idols",
    "matti vigrahalu",
  ],
  openGraph: {
    title: "Matti Mūrti | Handcrafted Clay Idols Marketplace",
    description:
      "Browse and compare handcrafted clay idols by height and price from local artisans.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=Hanken+Grotesk:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-clay-base text-on-surface font-body" suppressHydrationWarning>
        <ClientBody>{children}</ClientBody>
      </body>
    </html>
  );
}
