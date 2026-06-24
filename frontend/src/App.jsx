import { useCallback, useEffect, useState } from 'react'
import { Route, Routes, useNavigate, useParams } from 'react-router-dom'
import './App.css'
import { amenitiesApi } from './api/amenitiesApi'
import { bookingsApi } from './api/bookingsApi'
import { roomsApi } from './api/roomsApi'
import MainLayout from './layouts/MainLayout.jsx'
import Home from './pages/Home.jsx'
import Rooms from './pages/Rooms.jsx'
import RoomDetail from './pages/RoomDetail.jsx'
import Reserve from './pages/Reserve.jsx'
import BookingLookup from './pages/Booking.jsx'
import BookingDetail from './pages/BookingDetail.jsx'
import Payment from './pages/Payment.jsx'
import Receipt from './pages/Receipt.jsx'
import Login from './pages/Login.jsx'
import StaffDashboard from './pages/StaffDashboard.jsx'
import Registry from './pages/Registry.jsx'
import Checkout from './pages/Checkout.jsx'
import RoomManagement from './pages/RoomManagement.jsx'
import AmenityManagement from './pages/AmenityManagement.jsx'
import Inquiry from './pages/Inquiry.jsx'
import NotFound from './pages/NotFound.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'
import { useAuth } from './hooks/useAuth'

export default function App() {
  const routerNavigate = useNavigate()
  const { isAuthenticated, logout } = useAuth()
  const [rooms, setRooms] = useState([])
  const [amenities, setAmenities] = useState([])
  const [bookings, setBookings] = useState([])
  const [receipts, setReceipts] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')

  const showToast = useCallback((message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 3600)
  }, [])

  useEffect(() => {
    async function bootstrap() {
      try {
        const [fetchedRooms, fetchedAmenities] = await Promise.all([
          roomsApi.list(),
          amenitiesApi.list(),
        ])
        setRooms(fetchedRooms)
        setAmenities(fetchedAmenities)
      } catch {
        showToast('Failed to connect to server. Please check the backend.')
      } finally {
        setLoading(false)
      }
    }
    bootstrap()
  }, [showToast])

  const navigate = (to) => {
    routerNavigate(to)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const refreshRooms = useCallback(async () => {
    try {
      setRooms(await roomsApi.list())
    } catch {
      /* keep current UI state */
    }
  }, [])

  const refreshBookings = useCallback(async () => {
    try {
      setBookings(await bookingsApi.list())
    } catch {
      /* keep current UI state */
    }
  }, [])

  const appState = {
    rooms,
    setRooms,
    amenities,
    setAmenities,
    bookings,
    setBookings,
    receipts,
    setReceipts,
    staffAuthed: isAuthenticated,
    logout,
    navigate,
    showToast,
    refreshRooms,
    refreshBookings,
  }

  if (loading) {
    return (
      <div className="app-shell">
        <div className="empty-state" style={{ minHeight: '100vh' }}>
          <span className="empty-icon">...</span>
          <strong>Connecting to server...</strong>
        </div>
      </div>
    )
  }

  return (
    <MainLayout staffAuthed={isAuthenticated} logout={logout} navigate={navigate} toast={toast}>
      <Routes>
        <Route path="/" element={<Home {...appState} />} />
        <Route path="/rooms" element={<Rooms {...appState} />} />
        <Route path="/rooms/:roomNumber" element={<RoomDetailRoute appState={appState} />} />
        <Route path="/reserve" element={<ProtectedRoute><Reserve {...appState} /></ProtectedRoute>} />
        <Route path="/booking" element={<BookingLookup {...appState} />} />
        <Route path="/booking/:refNumber" element={<BookingDetailRoute appState={appState} />} />
        <Route path="/payment/:refNumber" element={<ProtectedRoute><PaymentRoute appState={appState} /></ProtectedRoute>} />
        <Route path="/payment/:refNumber/receipt" element={<ReceiptRoute appState={appState} />} />
        <Route path="/staff/login" element={<Login {...appState} />} />
        <Route path="/staff" element={<StaffDashboard {...appState} />} />
        <Route path="/staff/registry" element={<ProtectedRoute><Registry {...appState} /></ProtectedRoute>} />
        <Route path="/staff/checkout" element={<ProtectedRoute><Checkout {...appState} /></ProtectedRoute>} />
        <Route path="/staff/rooms" element={<ProtectedRoute><RoomManagement {...appState} /></ProtectedRoute>} />
        <Route path="/staff/amenities" element={<ProtectedRoute><AmenityManagement {...appState} /></ProtectedRoute>} />
        <Route path="/staff/inquiry" element={<ProtectedRoute><Inquiry {...appState} /></ProtectedRoute>} />
        <Route path="*" element={<NotFound navigate={navigate} />} />
      </Routes>
    </MainLayout>
  )
}

function RoomDetailRoute({ appState }) {
  const { roomNumber } = useParams()
  return <RoomDetail roomNumber={roomNumber} {...appState} />
}

function BookingDetailRoute({ appState }) {
  const { refNumber } = useParams()
  return <BookingDetail refNumber={refNumber} {...appState} />
}

function PaymentRoute({ appState }) {
  const { refNumber } = useParams()
  return <Payment refNumber={refNumber} {...appState} />
}

function ReceiptRoute({ appState }) {
  const { refNumber } = useParams()
  return <Receipt refNumber={refNumber} {...appState} />
}
