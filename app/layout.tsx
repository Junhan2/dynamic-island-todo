import "@/styles/globals.css"
import "@/styles/DynamicIslandTodo.css"
import "@/styles/responsive.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { SessionProvider } from "@/components/session-provider"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  title: "Dynamic Island Todo",
  description: "A todo list component inspired by the dynamic island design",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <head>
        <Script src="https://unpkg.com/framer-motion@10.12.16/dist/framer-motion.js" strategy="async" />
      </head>
      <body className={`${inter.className} bg-gray-100`}>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
