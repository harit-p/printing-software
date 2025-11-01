import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
export default function Home() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')
  const role = cookieStore.get('role')
  
  
  redirect('/customer/home')
}
