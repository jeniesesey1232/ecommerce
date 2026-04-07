import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const navigate = useNavigate()

  useEffect(() => {
    // Dashboard redirects to profile page
    navigate('/profile')
  }, [navigate])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600"></div>
    </div>
  )
}
