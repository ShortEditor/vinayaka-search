import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vinayaka Vigrahalu | Find Ganesh Idols Near You",
  description:
    "Browse and compare Vinayaka idols by height and price from local shops. Find the perfect Ganesh idol for Vinayaka Chavithi without visiting every shop.",
  keywords: [
    "Vinayaka",
    "Ganesh idols",
    "Vinayaka Chavithi",
    "Ganesh Chaturthi",
    "buy Ganesh idol",
    "Vinayaka vigrahalu",
  ],
  openGraph: {
    title: "Vinayaka Vigrahalu | Find Ganesh Idols Near You",
    description:
      "Browse and compare Vinayaka idols by height and price from local shops.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-bg text-text">
        {children}
      </body>
    </html>
  );
}
