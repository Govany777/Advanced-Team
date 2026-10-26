import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'مجموعة المتقدم الكشفية | Scout Team Elmotaqadem',
  description: 'المنصة الرسمية لمجموعة المتقدم الكشفية - متابعة الأنشطة، المسابقات، ولوحة شرف الطلائع',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-[#081127] text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  )
}
