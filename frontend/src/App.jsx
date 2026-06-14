import { useEffect, useState, useCallback } from 'react'
import './App.css'
import { roomsApi } from './api/roomsApi'
import { bookingsApi } from './api/bookingsApi'
import { amenitiesApi } from './api/amenitiesApi'
import { receiptsApi } from './api/receiptsApi'

const categories = ['All', 'Classic', 'De Luxe', 'Suite', 'Imperial Grand']
const amenityCategories = ['Convenience', 'Pool', 'Spa']

function today(offset = 0) {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + offset)
  return date.toISOString().slice(0, 10)
}

function formatCurrency(value) {
  return `PHP ${Number(value || 0).toLocaleString('en-PH')}`
}

function dateDiff(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  return Math.max(0, Math.round((end - start) / 86400000))
}

function amenityCost(amenity, booking) {
  if (!booking) return 0
  if (amenity.type === 'PerNight') return amenity.price * booking.numberOfDays
  if (amenity.type === 'PerGuest') return amenity.price * booking.numberOfGuests
  return amenity.price
}

function roomRange(rooms, category) {
  const values = rooms.filter((r) => r.category === category).map((r) => r.bedrooms)
  if (!values.length) return '—'
  return `${Math.min(...values)}-${Math.max(...values)} bedrooms`
}

function priceRange(rooms, category) {
  const values = rooms.filter((r) => r.category === category).map((r) => r.pricePerNight)
  if (!values.length) return '—'
  return `${formatCurrency(Math.min(...values))} to ${formatCurrency(Math.max(...values))}`
}

// ─── App Root ─────────────────────────────────────────────────────────────────

function App() {
  const [path, setPath] = useState(window.location.pathname)
  const [rooms, setRooms] = useState([])
  const [amenities, setAmenities] = useState([])
  const [bookings, setBookings] = useState([])
  const [receipts, setReceipts] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const [staffAuthed, setStaffAuthed] = useState(false)

  // Load initial data from backend
  useEffect(() => {
    async function bootstrap() {
      try {
        const [fetchedRooms, fetchedAmenities] = await Promise.all([
          roomsApi.list(),
          amenitiesApi.list(),
        ])
        setRooms(fetchedRooms)
        setAmenities(fetchedAmenities)
      } catch (err) {
        showToast('Failed to connect to server. Please check the backend.')
      } finally {
        setLoading(false)
      }
    }
    bootstrap()
  }, [])

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = (to) => {
    window.history.pushState({}, '', to)
    setPath(to)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const showToast = useCallback((message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 3600)
  }, [])

  const refreshRooms = useCallback(async () => {
    try {
      const updated = await roomsApi.list()
      setRooms(updated)
    } catch {
      /* silent */
    }
  }, [])

  const refreshBookings = useCallback(async () => {
    try {
      const updated = await bookingsApi.list()
      setBookings(updated)
    } catch {
      /* silent */
    }
  }, [])

  const appState = {
    rooms,
    setRooms,
    amenities,
    bookings,
    setBookings,
    receipts,
    setReceipts,
    staffAuthed,
    setStaffAuthed,
    navigate,
    showToast,
    refreshRooms,
    refreshBookings,
  }

  if (loading) {
    return (
      <div className="app-shell">
        <div className="empty-state" style={{ minHeight: '100vh' }}>
          <span className="empty-icon">⋯</span>
          <strong>Connecting to server…</strong>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <Navbar path={path} navigate={navigate} staffAuthed={staffAuthed} setStaffAuthed={setStaffAuthed} />
      <main>
        <RouteSwitch path={path} appState={appState} />
      </main>
      <Footer navigate={navigate} />
      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  )
}

// ─── Router ───────────────────────────────────────────────────────────────────

function RouteSwitch({ path, appState }) {
  if (path === '/') return <Landing {...appState} />
  if (path === '/rooms') return <RoomsDirectory {...appState} />
  if (path.startsWith('/rooms/')) return <RoomDetail roomNumber={path.split('/')[2]} {...appState} />
  if (path === '/reserve') return <Reserve {...appState} />
  if (path === '/booking') return <BookingLookup {...appState} />
  if (path.startsWith('/booking/')) return <BookingDetail refNumber={path.split('/')[2]} {...appState} />
  if (path.startsWith('/payment/') && path.endsWith('/receipt')) return <Receipt refNumber={path.split('/')[2]} {...appState} />
  if (path.startsWith('/payment/')) return <Payment refNumber={path.split('/')[2]} {...appState} />
  if (path === '/staff/login') return <StaffLogin {...appState} />
  if (path === '/staff') return <StaffDashboard {...appState} />
  if (path === '/staff/registry') return <Protected page={<Registry {...appState} />} {...appState} />
  if (path === '/staff/checkout') return <Protected page={<Checkout {...appState} />} {...appState} />
  if (path === '/staff/inquiry') return <Protected page={<Inquiry {...appState} />} {...appState} />
  return <NotFound navigate={appState.navigate} />
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar({ path, navigate, staffAuthed, setStaffAuthed }) {
  const [open, setOpen] = useState(false)
  const links = [
    ['/', 'Availability'],
    ['/rooms', 'Rooms'],
    ['/reserve', 'Reserve'],
    ['/booking', 'Booking'],
    ['/staff', 'Staff'],
  ]

  return (
    <header className="nav">
      <button className="brand" type="button" onClick={() => navigate('/')}>
        <span className="brand-mark">E</span>
        <span>
          <strong>Esplenin Hotel</strong>
          <small>Reservation Management</small>
        </span>
      </button>
      <button className="menu-button" type="button" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
        <span></span><span></span><span></span>
      </button>
      <nav className={open ? 'nav-links open' : 'nav-links'}>
        {links.map(([href, label]) => (
          <button
            className={path === href || (href !== '/' && path.startsWith(href)) ? 'active' : ''}
            key={href}
            type="button"
            onClick={() => { setOpen(false); navigate(href) }}
          >
            {label}
          </button>
        ))}
        {staffAuthed ? (
          <button className="outline-button small" type="button" onClick={() => setStaffAuthed(false)}>Sign Out</button>
        ) : (
          <button className="primary-button small" type="button" onClick={() => navigate('/staff/login')}>Staff Login</button>
        )}
      </nav>
    </header>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer({ navigate }) {
  return (
    <footer className="footer">
      <div>
        <strong>Esplenin Hotel</strong>
        <p>Front desk operations, booking visibility, payment previews, and staff workflows.</p>
      </div>
      <div className="footer-links">
        <button type="button" onClick={() => navigate('/reserve')}>Reserve</button>
        <button type="button" onClick={() => navigate('/booking')}>Lookup</button>
        <button type="button" onClick={() => navigate('/staff/inquiry')}>Inquiry</button>
      </div>
    </footer>
  )
}

// ─── Landing ──────────────────────────────────────────────────────────────────

function Landing({ rooms, navigate }) {
  const [filter, setFilter] = useState('All')
  const filtered = filter === 'All' ? rooms : rooms.filter((r) => r.category === filter)
  const vacant = rooms.filter((r) => r.isAvailable).length

  return (
    <section className="page">
      <div className="hero-strip">
        <div>
          <span className="eyebrow">Guest portal</span>
          <h1>Esplenin Hotel</h1>
          <p>View room availability, start a reservation, and keep booking details close at hand.</p>
        </div>
        <div className="hero-actions">
          <button className="primary-button" type="button" onClick={() => navigate('/reserve')}>Reserve a Room</button>
          <button className="outline-button" type="button" onClick={() => navigate('/booking')}>Find Booking</button>
        </div>
      </div>
      <Stats rooms={rooms} />
      <FilterBar value={filter} setValue={setFilter} items={categories} />
      {vacant === 0 ? <EmptyState title="No vacant rooms at this time." /> : <RoomGrid rooms={filtered} navigate={navigate} />}
    </section>
  )
}

function Stats({ rooms }) {
  const occupied = rooms.filter((r) => !r.isAvailable).length
  const prices = rooms.map((r) => r.pricePerNight)
  return (
    <div className="stats-grid">
      <Metric label="Vacant Rooms" value={rooms.length - occupied} />
      <Metric label="Occupied Rooms" value={occupied} />
      <Metric label="Room Categories" value="4" />
      <Metric label="Starting Rate" value={prices.length ? formatCurrency(Math.min(...prices)) : '—'} />
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

// ─── Rooms Directory ──────────────────────────────────────────────────────────

function RoomsDirectory({ rooms, navigate }) {
  const [category, setCategory] = useState('All')
  const [availability, setAvailability] = useState('All')
  const filtered = rooms.filter((r) => {
    const catMatch = category === 'All' || r.category === category
    const availMatch = availability === 'All' || (availability === 'Vacant' ? r.isAvailable : !r.isAvailable)
    return catMatch && availMatch
  })

  return (
    <section className="page">
      <PageTitle eyebrow="Room directory" title="Rooms and details" text="Browse rooms, inspect rates, and confirm availability before starting a reservation." />
      <div className="toolbar">
        <FilterBar value={category} setValue={setCategory} items={categories} />
        <FilterBar value={availability} setValue={setAvailability} items={['All', 'Vacant', 'Occupied']} />
      </div>
      <RoomGrid rooms={filtered} navigate={navigate} details />
    </section>
  )
}

function RoomDetail({ roomNumber, rooms, navigate }) {
  const room = rooms.find((r) => String(r.roomNumber) === String(roomNumber))
  if (!room) return <NotFound navigate={navigate} />
  return (
    <section className="page narrow">
      <PageTitle eyebrow="Room detail" title={`Room ${room.roomNumber}`} text="A focused room profile for front desk lookup and guest inquiry." />
      <div className="detail-card">
        <Badge status={room.isAvailable ? 'Vacant' : 'Occupied'} />
        <h2>{room.category}</h2>
        <dl className="definition-grid">
          <div><dt>Bedrooms</dt><dd>{room.bedrooms}</dd></div>
          <div><dt>Nightly Rate</dt><dd>{formatCurrency(room.pricePerNight)}</dd></div>
          <div><dt>Room Number</dt><dd>{room.roomNumber}</dd></div>
          <div><dt>Status</dt><dd>{room.isAvailable ? 'Available for reservation' : 'Currently occupied'}</dd></div>
        </dl>
        <button className="primary-button" type="button" disabled={!room.isAvailable} onClick={() => navigate('/reserve')}>
          Reserve This Room
        </button>
      </div>
    </section>
  )
}

// ─── Reserve ──────────────────────────────────────────────────────────────────

function Reserve({ rooms, navigate, showToast, refreshRooms }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    checkIn: today(1),
    checkOut: today(2),
    guestName: '',
    numberOfGuests: 1,
    category: '',
    roomId: '',        // MongoDB _id from backend
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const days = dateDiff(form.checkIn, form.checkOut)
  const selectedRoom = rooms.find((r) => r._id === form.roomId)
  const roomRate = selectedRoom ? selectedRoom.pricePerNight * (days + 1) : 0

  const update = (key, value) => setForm((cur) => ({ ...cur, [key]: value }))

  const validateStep = () => {
    const errs = {}
    if (step === 1) {
      if (!/^[A-Za-z ]{2,}$/.test(form.guestName.trim())) errs.guestName = 'Use letters and spaces, at least 2 characters.'
      if (Number(form.numberOfGuests) < 1) errs.numberOfGuests = 'Guest count must be greater than 0.'
      if (form.checkIn < today(0)) errs.checkIn = 'Check-in must be today or later.'
      if (!days) errs.checkOut = 'Check-out must be after check-in.'
    }
    if (step === 2 && !form.category) errs.category = 'Select a room type.'
    if (step === 3 && !form.roomId) errs.roomId = 'Select an available room.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const next = () => { if (validateStep()) setStep((s) => Math.min(4, s + 1)) }

  const confirmReservation = async (payNow) => {
    if (!selectedRoom || submitting) return
    setSubmitting(true)
    try {
      const booking = await bookingsApi.create({
        guestName: form.guestName.trim(),
        numberOfGuests: Number(form.numberOfGuests),
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        roomId: selectedRoom._id,
      })
      await refreshRooms()
      showToast(`Reservation ${booking.referenceNumber} created.`)
      navigate(payNow ? `/payment/${booking.referenceNumber}` : `/booking/${booking.referenceNumber}`)
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to create reservation.'
      showToast(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const vacantInCategory = rooms.filter((r) => r.category === form.category && r.isAvailable)

  return (
    <section className="page narrow">
      <PageTitle eyebrow="Reservation wizard" title="Reserve a room" text="A four-step flow to select dates, room type, and confirm your reservation." />
      <StepIndicator step={step} labels={['Dates', 'Type', 'Room', 'Review']} />
      <div className="panel">
        {step === 1 ? (
          <div className="form-grid">
            <Input label="Check-In" type="date" value={form.checkIn} min={today(0)} error={errors.checkIn} onChange={(v) => update('checkIn', v)} />
            <Input label="Check-Out" type="date" value={form.checkOut} min={form.checkIn || today(1)} error={errors.checkOut} onChange={(v) => update('checkOut', v)} />
            <Input label="Guest Name" value={form.guestName} error={errors.guestName} onChange={(v) => update('guestName', v)} />
            <Input label="Number of Guests" type="number" min="1" value={form.numberOfGuests} error={errors.numberOfGuests} onChange={(v) => update('numberOfGuests', v)} />
            <div className="readout"><span>Number of Days</span><strong>{days}</strong></div>
          </div>
        ) : null}
        {step === 2 ? (
          <div>
            <div className="choice-grid">
              {categories.slice(1).map((cat) => (
                <button
                  className={form.category === cat ? 'choice selected' : 'choice'}
                  type="button"
                  key={cat}
                  onClick={() => update('category', cat)}
                >
                  <strong>{cat}</strong>
                  <span>{roomRange(rooms, cat)}</span>
                  <small>{priceRange(rooms, cat)}</small>
                </button>
              ))}
            </div>
            <ErrorText message={errors.category} />
          </div>
        ) : null}
        {step === 3 ? (
          <div>
            <div className="table-card">
              <table>
                <thead><tr><th>Room</th><th>Bedrooms</th><th>Rate</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {vacantInCategory.map((room) => (
                    <tr key={room._id}>
                      <td className="mono">{room.roomNumber}</td>
                      <td>{room.bedrooms}</td>
                      <td>{formatCurrency(room.pricePerNight)}</td>
                      <td><Badge status="Vacant" /></td>
                      <td>
                        <button className="table-action" type="button" onClick={() => update('roomId', room._id)}>
                          {form.roomId === room._id ? 'Selected' : 'Select'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {vacantInCategory.length === 0 ? <EmptyState title={`No vacant ${form.category} rooms available.`} /> : null}
            <ErrorText message={errors.roomId} />
          </div>
        ) : null}
        {step === 4 ? (
          <div className="summary-stack">
            <BillRows rows={[
              ['Guest', form.guestName],
              ['Dates', `${form.checkIn} to ${form.checkOut}`],
              ['Room', selectedRoom ? `Room ${selectedRoom.roomNumber}, ${selectedRoom.category}` : 'No room selected'],
              ['Guests', form.numberOfGuests],
              ['Room Rate', formatCurrency(roomRate)],
            ]} />
            <div className="button-row">
              <button className="primary-button" type="button" disabled={submitting} onClick={() => confirmReservation(true)}>
                {submitting ? 'Processing…' : 'Proceed to Payment'}
              </button>
              <button className="outline-button" type="button" disabled={submitting} onClick={() => confirmReservation(false)}>
                Pay Later
              </button>
            </div>
          </div>
        ) : null}
      </div>
      <div className="wizard-actions">
        {step > 1 ? <button className="ghost-button" type="button" onClick={() => setStep(step - 1)}>Back</button> : <span></span>}
        {step < 4 ? <button className="primary-button" type="button" onClick={next}>Continue</button> : null}
      </div>
    </section>
  )
}

// ─── Booking Lookup ───────────────────────────────────────────────────────────

function BookingLookup({ navigate }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)

  const search = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    try {
      const data = await bookingsApi.list({ guestName: query.trim() })
      setResults(data)
      setSearched(true)
    } catch {
      setResults([])
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page narrow">
      <PageTitle eyebrow="Guest lookup" title="Find a booking" text="Search by guest name and open the full booking record." />
      <form className="search-panel" onSubmit={search}>
        <Input label="Guest Name" value={query} onChange={setQuery} />
        <button className="primary-button" type="submit" disabled={loading}>{loading ? 'Searching…' : 'Search'}</button>
      </form>
      {searched && results.length === 0 ? <EmptyState title={`No bookings found for "${query}".`} /> : null}
      <div className="list-stack">
        {searched && results.map((booking) => <BookingCard booking={booking} key={booking.referenceNumber} navigate={navigate} />)}
      </div>
    </section>
  )
}

// ─── Booking Detail ───────────────────────────────────────────────────────────

function BookingDetail({ refNumber, navigate }) {
  const [booking, setBooking] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    bookingsApi.get(refNumber)
      .then(setBooking)
      .catch(() => setNotFound(true))
  }, [refNumber])

  if (notFound) return <NotFound navigate={navigate} />
  if (!booking) return <LoadingPage />

  return (
    <section className="page narrow">
      <PageTitle eyebrow="Booking detail" title={booking.referenceNumber} text="Reservation summary, payment state, and next available action." />
      <div className="detail-card">
        <div className="split-heading">
          <h2>{booking.guestName}</h2>
          <Badge status={booking.isPaid ? 'Paid' : 'Unpaid'} />
        </div>
        <BillRows rows={[
          ['Room', `${booking.roomNumber} - ${booking.roomType}`],
          ['Dates', `${booking.checkIn?.slice(0, 10)} to ${booking.checkOut?.slice(0, 10)}`],
          ['Guests', booking.numberOfGuests],
          ['Room Rate', formatCurrency(booking.roomRate)],
          ['Amenities', formatCurrency(booking.amenitiesTotal)],
          ['Final Amount', formatCurrency(booking.finalAmount)],
          ['Status', booking.status],
        ]} />
        {!booking.isPaid ? (
          <button className="primary-button" type="button" onClick={() => navigate(`/payment/${booking.referenceNumber}`)}>
            Continue to Payment
          </button>
        ) : null}
      </div>
    </section>
  )
}

// ─── Payment ──────────────────────────────────────────────────────────────────

function Payment({ refNumber, navigate, showToast, amenities }) {
  const [booking, setBooking] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [amenityCategory, setAmenityCategory] = useState('Convenience')
  const [selectedCodes, setSelectedCodes] = useState([])
  const [method, setMethod] = useState('Cash')
  const [details, setDetails] = useState({
    amountReceived: '', cardName: '', cardNumber: '', expiry: '', cvv: '',
    gcashNumber: '', gcashName: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    bookingsApi.get(refNumber)
      .then((b) => {
        setBooking(b)
        setSelectedCodes(b.amenityCodes || [])
      })
      .catch(() => setNotFound(true))
  }, [refNumber])

  if (notFound) return <NotFound navigate={navigate} />
  if (!booking) return <LoadingPage />
  if (booking.isPaid) return <Receipt refNumber={refNumber} navigate={navigate} />

  const selectedAmenities = amenities.filter((a) => selectedCodes.includes(a.code))
  const amenitiesTotal = selectedAmenities.reduce((sum, a) => sum + amenityCost(a, booking), 0)
  const finalAmount = (booking.roomRate || 0) + amenitiesTotal
  const cashChange = Number(details.amountReceived || 0) - finalAmount

  const toggleAmenity = (code) => {
    setSelectedCodes((cur) => cur.includes(code) ? cur.filter((c) => c !== code) : [...cur, code])
  }

  const validatePayment = () => {
    if (method === 'Cash' && Number(details.amountReceived) < finalAmount) return 'Cash amount must cover the final amount.'
    if (method === 'Card' && !/^[A-Za-z ]{2,}$/.test(details.cardName)) return 'Cardholder name is required.'
    if (method === 'Card' && !/^\d{12,16}$/.test(details.cardNumber)) return 'Card number must contain 12 to 16 digits.'
    if (method === 'Card' && !/^(0[1-9]|1[0-2])\/\d{2}$/.test(details.expiry)) return 'Expiry must use MM/YY.'
    if (method === 'Card' && !/^\d{3}$/.test(details.cvv)) return 'CVV must contain exactly 3 digits.'
    if (method === 'GCash' && !/^\d{11}$/.test(details.gcashNumber)) return 'GCash number must contain exactly 11 digits.'
    if (method === 'GCash' && !/^[A-Za-z ]{2,}$/.test(details.gcashName)) return 'GCash account name is required.'
    return ''
  }

  const pay = async () => {
    const paymentError = validatePayment()
    setError(paymentError)
    if (paymentError || submitting) return

    setSubmitting(true)
    try {
      const payload = {
        amenityCodes: selectedCodes,
        paymentMethod: method,
        amountReceived: method === 'Cash' ? Number(details.amountReceived) : finalAmount,
        ...(method === 'Card' && {
          card: {
            cardName: details.cardName,
            cardNumber: details.cardNumber,
            expiry: details.expiry,
            cvv: details.cvv,
          },
        }),
        ...(method === 'GCash' && {
          gcash: {
            gcashNumber: details.gcashNumber,
            gcashName: details.gcashName,
          },
        }),
      }
      await bookingsApi.pay(refNumber, payload)
      showToast(`Payment completed for ${refNumber}.`)
      navigate(`/payment/${refNumber}/receipt`)
    } catch (err) {
      const msg = err?.response?.data?.message || 'Payment failed. Please try again.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="page">
      <PageTitle eyebrow="Payment" title={`Process ${refNumber}`} text="Preview bill details, add amenities, and complete the selected payment method." />
      <div className="payment-layout">
        <div className="panel">
          <h2>Bill Summary</h2>
          <BillRows rows={[
            ['Guest', booking.guestName],
            ['Room', `${booking.roomNumber} - ${booking.roomType}`],
            ['Number of Days', booking.numberOfDays],
            ['Room Rate', formatCurrency(booking.roomRate)],
          ]} />
          <h2>Amenities</h2>
          <Select label="Amenity Category" value={amenityCategory} options={amenityCategories} onChange={setAmenityCategory} />
          <div className="table-card compact">
            <table>
              <thead><tr><th>Code</th><th>Name</th><th>Price</th><th>Type</th><th></th></tr></thead>
              <tbody>
                {amenities.filter((a) => a.category === amenityCategory).map((amenity) => (
                  <tr key={amenity.code}>
                    <td className="mono">{amenity.code}</td>
                    <td>{amenity.name}</td>
                    <td>{formatCurrency(amenity.price)}</td>
                    <td>{amenity.type}</td>
                    <td>
                      <button className="table-action" type="button" onClick={() => toggleAmenity(amenity.code)}>
                        {selectedCodes.includes(amenity.code) ? 'Remove' : 'Add'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="panel sticky-panel">
          <h2>Payment Details</h2>
          <BillRows rows={[
            ['Room Rate', formatCurrency(booking.roomRate)],
            ['Amenities Total', formatCurrency(amenitiesTotal)],
            ['Final Amount', formatCurrency(finalAmount)],
          ]} strongLast />
          <div className="method-grid">
            {['Cash', 'Card', 'GCash'].map((item) => (
              <button className={method === item ? 'choice selected' : 'choice'} type="button" key={item} onClick={() => setMethod(item)}>{item}</button>
            ))}
          </div>
          {method === 'Cash' ? (
            <>
              <Input label="Amount Received" type="number" value={details.amountReceived} onChange={(v) => setDetails({ ...details, amountReceived: v })} />
              <div className="readout"><span>Change</span><strong>{cashChange >= 0 ? formatCurrency(cashChange) : 'Insufficient'}</strong></div>
            </>
          ) : null}
          {method === 'Card' ? (
            <div className="form-grid one">
              <Input label="Cardholder Name" value={details.cardName} onChange={(v) => setDetails({ ...details, cardName: v })} />
              <Input label="Card Number" value={details.cardNumber} onChange={(v) => setDetails({ ...details, cardNumber: v.replace(/\D/g, '') })} />
              <Input label="Expiry Date" placeholder="MM/YY" value={details.expiry} onChange={(v) => setDetails({ ...details, expiry: v })} />
              <Input label="CVV" value={details.cvv} onChange={(v) => setDetails({ ...details, cvv: v.replace(/\D/g, '') })} />
            </div>
          ) : null}
          {method === 'GCash' ? (
            <div className="form-grid one">
              <Input label="GCash Number" value={details.gcashNumber} onChange={(v) => setDetails({ ...details, gcashNumber: v.replace(/\D/g, '') })} />
              <Input label="GCash Account Name" value={details.gcashName} onChange={(v) => setDetails({ ...details, gcashName: v })} />
            </div>
          ) : null}
          <ErrorText message={error} />
          <button className="primary-button full" type="button" disabled={submitting} onClick={pay}>
            {submitting ? 'Processing…' : 'Pay Now'}
          </button>
        </div>
      </div>
    </section>
  )
}

// ─── Receipt ──────────────────────────────────────────────────────────────────

function Receipt({ refNumber, navigate }) {
  const [receipt, setReceipt] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    // Receipts are keyed by OR number; find via booking reference
    bookingsApi.get(refNumber)
      .then(async (booking) => {
        if (!booking.isPaid) { setNotFound(true); return }
        // Try to fetch the receipt using the OR number stored on the booking
        try {
          const r = await receiptsApi.get(booking.orNumber)
          setReceipt({ ...r, booking })
        } catch {
          // Fallback: render what we have from the booking
          setReceipt({ ...booking, booking })
        }
      })
      .catch(() => setNotFound(true))
  }, [refNumber])

  if (notFound) return <NotFound navigate={navigate} />
  if (!receipt) return <LoadingPage />

  const b = receipt.booking
  return (
    <section className="page narrow print-page">
      <PageTitle eyebrow="Receipt" title={receipt.orNumber || `Receipt for ${refNumber}`} text="Read-only receipt preview for printing or guest handoff." />
      <div className="receipt-card">
        <div className="receipt-head">
          <strong>ESPLENIN HOTEL</strong>
          <span>Official Receipt</span>
        </div>
        <BillRows rows={[
          ['OR Number', receipt.orNumber || '—'],
          ['Reference Number', refNumber],
          ['Guest Name', b.guestName],
          ['Room', `${b.roomNumber} - ${b.roomType}`],
          ['Room Rate', formatCurrency(b.roomRate)],
          ['Amenities Total', formatCurrency(b.amenitiesTotal)],
          ['Total Due', formatCurrency(b.finalAmount)],
          ['Amount Paid', formatCurrency(b.amountReceived)],
          ['Change', formatCurrency(b.change)],
          ['Payment Method', b.paymentMethod || 'Pending'],
          ['Issued At', receipt.issuedAt || new Date().toLocaleString()],
        ]} />
      </div>
      <div className="button-row no-print">
        <button className="primary-button" type="button" onClick={() => window.print()}>Print</button>
        <button className="outline-button" type="button" onClick={() => navigate('/booking')}>Back to Lookup</button>
      </div>
    </section>
  )
}

// ─── Staff ────────────────────────────────────────────────────────────────────

function StaffLogin({ setStaffAuthed, navigate, showToast }) {
  const [id, setId] = useState('frontdesk')
  return (
    <section className="page narrow">
      <PageTitle eyebrow="Staff portal" title="Staff login" text="A session gate for protected registry, checkout, and inquiry views." />
      <div className="panel">
        <Input label="Staff ID" value={id} onChange={setId} />
        <Input label="Password" type="password" value="demo" onChange={() => {}} />
        <button
          className="primary-button full"
          type="button"
          onClick={() => { setStaffAuthed(true); showToast('Staff session started.'); navigate('/staff') }}
        >
          Sign In
        </button>
      </div>
    </section>
  )
}

function StaffDashboard({ staffAuthed, navigate }) {
  if (!staffAuthed) return <StaffLanding navigate={navigate} />
  return (
    <section className="page">
      <PageTitle eyebrow="Staff dashboard" title="Front desk workspace" text="Protected operational screens for reservation registry, checkout, and inquiry." />
      <div className="feature-grid">
        <FeatureCard title="Registry" text="Search active bookings and cancel reservations." action="Open Registry" onClick={() => navigate('/staff/registry')} />
        <FeatureCard title="Checkout" text="Lookup a reference number and mark the room vacant." action="Open Checkout" onClick={() => navigate('/staff/checkout')} />
        <FeatureCard title="Inquiry" text="Browse rates, amenities, and room availability." action="Open Inquiry" onClick={() => navigate('/staff/inquiry')} />
      </div>
    </section>
  )
}

function StaffLanding({ navigate }) {
  return (
    <section className="page narrow">
      <PageTitle eyebrow="Staff portal" title="Protected workspace" text="Sign in to access registry cancellation, checkout, and inquiry operations." />
      <button className="primary-button" type="button" onClick={() => navigate('/staff/login')}>Staff Login</button>
    </section>
  )
}

function Protected({ staffAuthed, navigate, page }) {
  if (!staffAuthed) return <StaffLanding navigate={navigate} />
  return page
}

// ─── Registry ─────────────────────────────────────────────────────────────────

function Registry({ showToast, refreshRooms }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [target, setTarget] = useState(null)
  const [loading, setLoading] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const search = async () => {
    setLoading(true)
    try {
      const data = await bookingsApi.list({ status: 'Active', guestName: query || undefined })
      setResults(data)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { search() }, [])

  const cancel = async () => {
    if (!target || cancelling) return
    setCancelling(true)
    try {
      await bookingsApi.cancel(target.referenceNumber)
      await refreshRooms()
      showToast(`${target.referenceNumber} cancelled.`)
      setTarget(null)
      search()
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to cancel booking.')
    } finally {
      setCancelling(false)
    }
  }

  return (
    <section className="page">
      <PageTitle eyebrow="Registry" title="Search and cancel reservations" text="Staff can inspect active bookings and cancel with confirmation." />
      <div className="search-panel inline">
        <Input label="Guest Name" value={query} onChange={setQuery} />
        <button className="primary-button" type="button" disabled={loading} onClick={search}>Search</button>
      </div>
      {loading ? <EmptyState title="Loading…" /> : <BookingTable bookings={results} onCancel={setTarget} />}
      {results.length === 0 && !loading ? <EmptyState title="No active bookings found." /> : null}
      {target ? (
        <Modal title={`Cancel ${target.referenceNumber}`} onClose={() => setTarget(null)}>
          <p>{target.guestName} in room {target.roomNumber} will be cancelled and the room will return to vacant status.</p>
          <div className="button-row">
            <button className="danger-button" type="button" disabled={cancelling} onClick={cancel}>
              {cancelling ? 'Cancelling…' : 'Yes, Cancel'}
            </button>
            <button className="outline-button" type="button" onClick={() => setTarget(null)}>Go Back</button>
          </div>
        </Modal>
      ) : null}
    </section>
  )
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

function Checkout({ navigate, showToast, refreshRooms }) {
  const [ref, setRef] = useState('')
  const [booking, setBooking] = useState(null)
  const [error, setError] = useState('')
  const [looking, setLooking] = useState(false)
  const [checking, setChecking] = useState(false)

  const lookup = async () => {
    setLooking(true)
    setError('')
    setBooking(null)
    try {
      const found = await bookingsApi.get(ref.trim().toUpperCase())
      if (found.status !== 'Active') {
        setError(`Booking ${ref} is not active (status: ${found.status}).`)
      } else {
        setBooking(found)
      }
    } catch {
      setError('Reference number not found.')
    } finally {
      setLooking(false)
    }
  }

  const checkout = async () => {
    if (!booking || checking) return
    setChecking(true)
    try {
      await bookingsApi.checkout(booking.referenceNumber)
      await refreshRooms()
      showToast(`${booking.referenceNumber} checked out. Room is now vacant.`)
      navigate('/staff')
    } catch (err) {
      showToast(err?.response?.data?.message || 'Checkout failed.')
    } finally {
      setChecking(false)
    }
  }

  return (
    <section className="page narrow">
      <PageTitle eyebrow="Checkout" title="Guest checkout" text="Fetch a booking, verify payment, and finalize the guest stay." />
      <div className="search-panel">
        <Input label="Reference Number" value={ref} onChange={(v) => setRef(v.toUpperCase())} />
        <button className="primary-button" type="button" disabled={looking} onClick={lookup}>
          {looking ? 'Looking…' : 'Lookup'}
        </button>
      </div>
      <ErrorText message={error} />
      {booking ? (
        <div className="detail-card">
          <div className="split-heading">
            <h2>{booking.guestName}</h2>
            <Badge status={booking.isPaid ? 'Paid' : 'Unpaid'} />
          </div>
          <BillRows rows={[
            ['Room', `${booking.roomNumber} - ${booking.roomType}`],
            ['Dates', `${booking.checkIn?.slice(0, 10)} to ${booking.checkOut?.slice(0, 10)}`],
            ['Final Amount', formatCurrency(booking.finalAmount)],
          ]} />
          {!booking.isPaid ? (
            <div className="warning-panel">
              <strong>Payment required</strong>
              <p>This booking must be paid before checkout can be completed.</p>
              <button className="primary-button" type="button" onClick={() => navigate(`/payment/${booking.referenceNumber}`)}>Go to Payment</button>
            </div>
          ) : (
            <button className="primary-button" type="button" disabled={checking} onClick={checkout}>
              {checking ? 'Checking out…' : 'Confirm Checkout'}
            </button>
          )}
        </div>
      ) : null}
    </section>
  )
}

// ─── Inquiry ──────────────────────────────────────────────────────────────────

function Inquiry({ rooms, amenities }) {
  const [tab, setTab] = useState('Room Rates')
  const [category, setCategory] = useState('Classic')
  const [amenityCategory, setAmenityCategory] = useState('Convenience')
  const roomRows = rooms.filter((r) => r.category === category)

  return (
    <section className="page">
      <PageTitle eyebrow="Inquiry hub" title="Rates, amenities, and availability" text="Browse room rates, amenity pricing, and live availability from the backend." />
      <FilterBar value={tab} setValue={setTab} items={['Room Rates', 'Amenities', 'Availability']} />
      {tab !== 'Amenities' ? <Select label="Room Category" value={category} options={categories.slice(1)} onChange={setCategory} /> : null}
      {tab === 'Amenities' ? <Select label="Amenity Category" value={amenityCategory} options={amenityCategories} onChange={setAmenityCategory} /> : null}
      <div className="table-card">
        {tab === 'Amenities' ? (
          <table>
            <thead><tr><th>Code</th><th>Name</th><th>Price</th><th>Billing</th></tr></thead>
            <tbody>
              {amenities.filter((a) => a.category === amenityCategory).map((a) => (
                <tr key={a.code}>
                  <td className="mono">{a.code}</td>
                  <td>{a.name}</td>
                  <td>{formatCurrency(a.price)}</td>
                  <td>{a.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table>
            <thead><tr><th>Room</th><th>Category</th><th>Bedrooms</th><th>Rate</th><th>Status</th></tr></thead>
            <tbody>
              {roomRows.map((r) => (
                <tr key={r._id}>
                  <td className="mono">{r.roomNumber}</td>
                  <td>{r.category}</td>
                  <td>{r.bedrooms}</td>
                  <td>{formatCurrency(r.pricePerNight)}</td>
                  <td><Badge status={r.isAvailable ? 'Vacant' : 'Occupied'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}

// ─── Shared Components ────────────────────────────────────────────────────────

function PageTitle({ eyebrow, title, text }) {
  return (
    <div className="page-title">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{text}</p>
    </div>
  )
}

function FilterBar({ value, setValue, items }) {
  return (
    <div className="filter-bar">
      {items.map((item) => (
        <button className={value === item ? 'active' : ''} type="button" key={item} onClick={() => setValue(item)}>{item}</button>
      ))}
    </div>
  )
}

function RoomGrid({ rooms, navigate, details = false }) {
  return (
    <div className="room-grid">
      {rooms.map((room) => <RoomCard room={room} key={room._id} navigate={navigate} details={details} />)}
    </div>
  )
}

function RoomCard({ room, navigate, details }) {
  return (
    <article className={room.isAvailable ? 'room-card' : 'room-card dimmed'}>
      <div className="split-heading">
        <h2>Room {room.roomNumber}</h2>
        <Badge status={room.isAvailable ? 'Vacant' : 'Occupied'} />
      </div>
      <p>{room.category}</p>
      <dl className="mini-facts">
        <div><dt>Bedrooms</dt><dd>{room.bedrooms}</dd></div>
        <div><dt>Rate</dt><dd>{formatCurrency(room.pricePerNight)}</dd></div>
      </dl>
      <div className="card-actions">
        {details ? <button className="outline-button" type="button" onClick={() => navigate(`/rooms/${room.roomNumber}`)}>View Details</button> : null}
        <button className="primary-button" type="button" disabled={!room.isAvailable} onClick={() => navigate('/reserve')}>
          {room.isAvailable ? 'Reserve' : 'Unavailable'}
        </button>
      </div>
    </article>
  )
}

function BookingCard({ booking, navigate }) {
  return (
    <button className="booking-card" type="button" onClick={() => navigate(`/booking/${booking.referenceNumber}`)}>
      <div className="split-heading">
        <h2>{booking.guestName}</h2>
        <Badge status={booking.isPaid ? 'Paid' : 'Unpaid'} />
      </div>
      <BillRows rows={[
        ['Reference', booking.referenceNumber],
        ['Dates', `${booking.checkIn?.slice(0, 10)} to ${booking.checkOut?.slice(0, 10)}`],
        ['Room', `${booking.roomType} ${booking.roomNumber}`],
        ['Room Rate', formatCurrency(booking.roomRate)],
      ]} />
    </button>
  )
}

function BookingTable({ bookings, onCancel }) {
  return (
    <div className="table-card">
      <table>
        <thead><tr><th>Ref</th><th>Room</th><th>Type</th><th>Guest</th><th>Check-In</th><th>Check-Out</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.referenceNumber}>
              <td className="mono">{booking.referenceNumber}</td>
              <td>{booking.roomNumber}</td>
              <td>{booking.roomType}</td>
              <td>{booking.guestName}</td>
              <td>{booking.checkIn?.slice(0, 10)}</td>
              <td>{booking.checkOut?.slice(0, 10)}</td>
              <td><Badge status={booking.status} /></td>
              <td><button className="danger-link" type="button" onClick={() => onCancel(booking)}>Cancel</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function BillRows({ rows, strongLast = false }) {
  return (
    <dl className={strongLast ? 'bill-rows strong-last' : 'bill-rows'}>
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd className={String(label).toLowerCase().includes('reference') || String(label).toLowerCase().includes('or') ? 'mono' : ''}>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function StepIndicator({ step, labels }) {
  return (
    <ol className="step-indicator">
      {labels.map((label, index) => (
        <li className={step === index + 1 ? 'active' : step > index + 1 ? 'done' : ''} key={label}>
          <span>{index + 1}</span>{label}
        </li>
      ))}
    </ol>
  )
}

function Badge({ status }) {
  const key = String(status).toLowerCase()
  return <span className={`badge ${key}`}>{status}</span>
}

function Input({ label, value, onChange, error, type = 'text', ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} {...props} />
      <ErrorText message={error} />
    </label>
  )
}

function Select({ label, value, options, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => <option value={option} key={option}>{option}</option>)}
      </select>
    </label>
  )
}

function Modal({ title, children, onClose }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="split-heading">
          <h2>{title}</h2>
          <button className="ghost-button icon-only" type="button" onClick={onClose} aria-label="Close">x</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function FeatureCard({ title, text, action, onClick }) {
  return (
    <article className="feature-card">
      <h2>{title}</h2>
      <p>{text}</p>
      <button className="outline-button" type="button" onClick={onClick}>{action}</button>
    </article>
  )
}

function EmptyState({ title }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">□</span>
      <strong>{title}</strong>
    </div>
  )
}

function LoadingPage() {
  return (
    <div className="empty-state" style={{ minHeight: '40vh' }}>
      <span className="empty-icon">⋯</span>
      <strong>Loading…</strong>
    </div>
  )
}

function ErrorText({ message }) {
  return message ? <small className="error-text">{message}</small> : null
}

function NotFound({ navigate }) {
  return (
    <section className="page narrow">
      <PageTitle eyebrow="Not found" title="This page is unavailable" text="The route or record could not be found." />
      <button className="primary-button" type="button" onClick={() => navigate('/')}>Back to Availability</button>
    </section>
  )
}

export default App