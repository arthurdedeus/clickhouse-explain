import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClickHouse EXPLAIN Visualizer",
  description: "Visualize and compare ClickHouse query execution plans. Similar to explain.dalibo.com but for ClickHouse.",
  keywords: ["ClickHouse", "EXPLAIN", "query plan", "visualization", "database", "SQL"],
  openGraph: {
    title: "ClickHouse EXPLAIN Visualizer",
    description: "Visualize and compare ClickHouse query execution plans",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
