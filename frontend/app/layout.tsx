import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
export const metadata: Metadata = {
  title: 'Printing Software - Print Management System',
  description: 'Comprehensive printing software for customers and administrators',
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
