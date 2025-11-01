import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default function Home() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')
  const role = cookieStore.get('role')

  // Always redirect to customer home page (public)
  // User can navigate to admin separately if needed
  redirect('/customer/home')
}

