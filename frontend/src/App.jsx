import { useEffect, useState } from 'react'
import './App.css'

const categories = ['All', 'Classic', 'De Luxe', 'Suite', 'Imperial Grand']
const amenityCategories = ['Convenience', 'Pool', 'Spa']

const seedRooms = [
  { id: 'r101', roomNumber: 101, category: 'Classic', bedrooms: 1, pricePerNight: 2800, isAvailable: true },
  { id: 'r102', roomNumber: 102, category: 'Classic', bedrooms: 1, pricePerNight: 3000, isAvailable: true },
  { id: 'r201', roomNumber: 201, category: 'De Luxe', bedrooms: 2, pricePerNight: 4600, isAvailable: true },
  { id: 'r202', roomNumber: 202, category: 'De Luxe', bedrooms: 2, pricePerNight: 4800, isAvailable: false },
  { id: 'r301', roomNumber: 301, category: 'Suite', bedrooms: 2, pricePerNight: 7200, isAvailable: true },
  { id: 'r302', roomNumber: 302, category: 'Suite', bedrooms: 3, pricePerNight: 8200, isAvailable: true },
  { id: 'r401', roomNumber: 401, category: 'Imperial Grand', bedrooms: 3, pricePerNight: 12800, isAvailable: false },
  { id: 'r402', roomNumber: 402, category: 'Imperial Grand', bedrooms: 4, pricePerNight: 14800, isAvailable: true },
]

const seedAmenities = [
  { code: 'CON1', name: 'Breakfast Tray', price: 650, type: 'PerGuest', category: 'Convenience' },
  { code: 'CON2', name: 'Laundry Service', price: 900, type: 'PerNight', category: 'Convenience' },
  { code: 'CON3', name: 'Airport Transfer', price: 1800, type: 'PerBooking', category: 'Convenience' },
  { code: 'POL1', name: 'Pool Cabana Access', price: 1200, type: 'PerNight', category: 'Pool' },
  { code: 'POL2', name: 'Private Swim Coach', price: 1600, type: 'PerGuest', category: 'Pool' },
  { code: 'SPA1', name: 'Signature Massage', price: 2200, type: 'PerGuest', category: 'Spa' },
  { code: 'SPA2', name: 'Sauna Suite Access', price: 1500, type: 'PerNight', category: 'Spa' },
]

const seedBookings = [
  {
    referenceNumber: 'B0001',
    guestName: 'Maria Santos',
    numberOfGuests: 2,
    checkIn: today(1),
    checkOut: today(4),
    numberOfDays: 3,
    roomId: 'r202',
    roomNumber: 202,
    roomType: 'De Luxe',
    pricePerNight: 4800,
    roomRate: 19200,
    amenityCodes: ['CON1'],
    amenitiesTotal: 1300,
    finalAmount: 20500,
    isPaid: false,
    paymentMethod: null,
    amountReceived: 0,
    change: 0,
    status: 'Active',
  },
  {
    referenceNumber: 'B0002',
    guestName: 'Daniel Reyes',
    numberOfGuests: 3,
    checkIn: today(0),
    checkOut: today(2),
    numberOfDays: 2,
    roomId: 'r401',
    roomNumber: 401,
    roomType: 'Imperial Grand',
    pricePerNight: 12800,
    roomRate: 38400,
    amenityCodes: ['SPA2'],
    amenitiesTotal: 3000,
    finalAmount: 41400,
    isPaid: true,
    paymentMethod: 'Card',
    amountReceived: 41400,
    change: 0,
    status: 'Active',
  },
]

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

function makeReference(bookings) {
  return `B${String(bookings.length + 1).padStart(4, '0')}`
}

function makeReceiptNumber(receipts) {
  return `RCPT-${String(receipts.length + 1).padStart(4, '0')}`
}

function App() {
  const [path, setPath] = useState(window.location.pathname)
  const [rooms, setRooms] = useState(seedRooms)
  const [bookings, setBookings] = useState(seedBookings)
  const [receipts, setReceipts] = useState([])
  const [toast, setToast] = useState('')
  const [staffAuthed, setStaffAuthed] = useState(false)

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

  const showToast = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 3600)
  }

  const appState = {
    rooms,
    setRooms,
    bookings,
    setBookings,
    receipts,
    setReceipts,
    staffAuthed,
    setStaffAuthed,
    navigate,
    showToast,
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
        <span></span>
        <span></span>
        <span></span>
      </button>
      <nav className={open ? 'nav-links open' : 'nav-links'}>
        {links.map(([href, label]) => (
          <button
            className={path === href || (href !== '/' && path.startsWith(href)) ? 'active' : ''}
            key={href}
            type="button"
            onClick={() => {
              setOpen(false)
              navigate(href)
            }}
          >
            {label}
          </button>
        ))}
        {staffAuthed ? (
          <button className="outline-button small" type="button" onClick={() => setStaffAuthed(false)}>
            Sign Out
          </button>
        ) : (
          <button className="primary-button small" type="button" onClick={() => navigate('/staff/login')}>
            Staff Login
          </button>
        )}
      </nav>
    </header>
  )
}

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

function Landing({ rooms, navigate }) {
  const [filter, setFilter] = useState('All')
  const filtered = filter === 'All' ? rooms : rooms.filter((room) => room.category === filter)
  const vacant = rooms.filter((room) => room.isAvailable).length

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
  const occupied = rooms.filter((room) => !room.isAvailable).length
  return (
    <div className="stats-grid">
      <Metric label="Vacant Rooms" value={rooms.length - occupied} />
      <Metric label="Occupied Rooms" value={occupied} />
      <Metric label="Room Categories" value="4" />
      <Metric label="Starting Rate" value={formatCurrency(Math.min(...rooms.map((room) => room.pricePerNight)))} />
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

function RoomsDirectory({ rooms, navigate }) {
  const [category, setCategory] = useState('All')
  const [availability, setAvailability] = useState('All')
  const filtered = rooms.filter((room) => {
    const categoryMatch = category === 'All' || room.category === category
    const availabilityMatch =
      availability === 'All' || (availability === 'Vacant' ? room.isAvailable : !room.isAvailable)
    return categoryMatch && availabilityMatch
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
  const room = rooms.find((item) => String(item.roomNumber) === String(roomNumber))
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

function Reserve({ rooms, bookings, setBookings, setRooms, navigate, showToast }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    checkIn: today(1),
    checkOut: today(2),
    guestName: '',
    numberOfGuests: 1,
    category: '',
    roomId: '',
  })
  const [errors, setErrors] = useState({})
  const days = dateDiff(form.checkIn, form.checkOut)
  const selectedRoom = rooms.find((room) => room.id === form.roomId)
  const roomRate = selectedRoom ? selectedRoom.pricePerNight * (days + 1) : 0

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const validateStep = () => {
    const nextErrors = {}
    if (step === 1) {
      if (!/^[A-Za-z ]{2,}$/.test(form.guestName.trim())) nextErrors.guestName = 'Use letters and spaces, at least 2 characters.'
      if (Number(form.numberOfGuests) < 1) nextErrors.numberOfGuests = 'Guest count must be greater than 0.'
      if (form.checkIn < today(0)) nextErrors.checkIn = 'Check-in must be today or later.'
      if (!days) nextErrors.checkOut = 'Check-out must be after check-in.'
    }
    if (step === 2 && !form.category) nextErrors.category = 'Select a room type.'
    if (step === 3 && !form.roomId) nextErrors.roomId = 'Select an available room.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const next = () => {
    if (validateStep()) setStep((current) => Math.min(4, current + 1))
  }

  const confirmReservation = (payNow) => {
    if (!selectedRoom) return
    const referenceNumber = makeReference(bookings)
    const booking = {
      referenceNumber,
      guestName: form.guestName.trim(),
      numberOfGuests: Number(form.numberOfGuests),
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      numberOfDays: days,
      roomId: selectedRoom.id,
      roomNumber: selectedRoom.roomNumber,
      roomType: selectedRoom.category,
      pricePerNight: selectedRoom.pricePerNight,
      roomRate,
      amenityCodes: [],
      amenitiesTotal: 0,
      finalAmount: roomRate,
      isPaid: false,
      paymentMethod: null,
      amountReceived: 0,
      change: 0,
      status: 'Active',
    }
    setBookings((current) => [...current, booking])
    setRooms((current) => current.map((room) => (room.id === selectedRoom.id ? { ...room, isAvailable: false } : room)))
    showToast(`Reservation ${referenceNumber} created.`)
    navigate(payNow ? `/payment/${referenceNumber}` : `/booking/${referenceNumber}`)
  }

  return (
    <section className="page narrow">
      <PageTitle eyebrow="Reservation wizard" title="Reserve a room" text="A four-step frontend flow matching the original reserve function." />
      <StepIndicator step={step} labels={['Dates', 'Type', 'Room', 'Review']} />
      <div className="panel">
        {step === 1 ? (
          <div className="form-grid">
            <Input label="Check-In" type="date" value={form.checkIn} min={today(0)} error={errors.checkIn} onChange={(value) => update('checkIn', value)} />
            <Input label="Check-Out" type="date" value={form.checkOut} min={form.checkIn || today(1)} error={errors.checkOut} onChange={(value) => update('checkOut', value)} />
            <Input label="Guest Name" value={form.guestName} error={errors.guestName} onChange={(value) => update('guestName', value)} />
            <Input label="Number of Guests" type="number" min="1" value={form.numberOfGuests} error={errors.numberOfGuests} onChange={(value) => update('numberOfGuests', value)} />
            <div className="readout"><span>Number of Days</span><strong>{days}</strong></div>
          </div>
        ) : null}
        {step === 2 ? (
          <div>
            <div className="choice-grid">
              {categories.slice(1).map((category) => (
                <button className={form.category === category ? 'choice selected' : 'choice'} type="button" key={category} onClick={() => update('category', category)}>
                  <strong>{category}</strong>
                  <span>{roomRange(rooms, category)}</span>
                  <small>{priceRange(rooms, category)}</small>
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
                  {rooms.filter((room) => room.category === form.category && room.isAvailable).map((room) => (
                    <tr key={room.id}>
                      <td className="mono">{room.roomNumber}</td>
                      <td>{room.bedrooms}</td>
                      <td>{formatCurrency(room.pricePerNight)}</td>
                      <td><Badge status="Vacant" /></td>
                      <td><button className="table-action" type="button" onClick={() => update('roomId', room.id)}>{form.roomId === room.id ? 'Selected' : 'Select'}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rooms.filter((room) => room.category === form.category && room.isAvailable).length === 0 ? <EmptyState title={`No vacant ${form.category} rooms available.`} /> : null}
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
              ['Reference Preview', makeReference(bookings)],
            ]} />
            <div className="button-row">
              <button className="primary-button" type="button" onClick={() => confirmReservation(true)}>Proceed to Payment</button>
              <button className="outline-button" type="button" onClick={() => confirmReservation(false)}>Pay Later</button>
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

function BookingLookup({ bookings, navigate }) {
  const [query, setQuery] = useState('')
  const [searched, setSearched] = useState(false)
  const results = bookings.filter((booking) => booking.guestName.toLowerCase().includes(query.trim().toLowerCase()))

  return (
    <section className="page narrow">
      <PageTitle eyebrow="Guest lookup" title="Find a booking" text="Search by guest name and open the full booking record." />
      <form className="search-panel" onSubmit={(event) => { event.preventDefault(); setSearched(true) }}>
        <Input label="Guest Name" value={query} onChange={setQuery} />
        <button className="primary-button" type="submit">Search</button>
      </form>
      {searched && results.length === 0 ? <EmptyState title={`No bookings found for ${query}.`} /> : null}
      <div className="list-stack">
        {searched && results.map((booking) => <BookingCard booking={booking} key={booking.referenceNumber} navigate={navigate} />)}
      </div>
    </section>
  )
}

function BookingDetail({ refNumber, bookings, navigate }) {
  const booking = bookings.find((item) => item.referenceNumber === refNumber)
  if (!booking) return <NotFound navigate={navigate} />
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
          ['Dates', `${booking.checkIn} to ${booking.checkOut}`],
          ['Guests', booking.numberOfGuests],
          ['Room Rate', formatCurrency(booking.roomRate)],
          ['Amenities', formatCurrency(booking.amenitiesTotal)],
          ['Final Amount', formatCurrency(booking.finalAmount)],
          ['Status', booking.status],
        ]} />
        {!booking.isPaid ? <button className="primary-button" type="button" onClick={() => navigate(`/payment/${booking.referenceNumber}`)}>Continue to Payment</button> : null}
      </div>
    </section>
  )
}

function Payment({ refNumber, bookings, setBookings, receipts, setReceipts, navigate, showToast }) {
  const booking = bookings.find((item) => item.referenceNumber === refNumber)
  const [amenityCategory, setAmenityCategory] = useState('Convenience')
  const [selectedCodes, setSelectedCodes] = useState(booking?.amenityCodes || [])
  const [method, setMethod] = useState('Cash')
  const [details, setDetails] = useState({ amountReceived: '', cardName: '', cardNumber: '', expiry: '', cvv: '', gcashNumber: '', gcashName: '' })
  const [error, setError] = useState('')

  const selectedAmenities = seedAmenities.filter((item) => selectedCodes.includes(item.code))
  const amenitiesTotal = selectedAmenities.reduce((total, amenity) => total + amenityCost(amenity, booking), 0)
  const finalAmount = (booking?.roomRate || 0) + amenitiesTotal
  const cashChange = Number(details.amountReceived || 0) - finalAmount

  if (!booking) return <NotFound navigate={navigate} />
  if (booking.isPaid) return <Receipt refNumber={refNumber} bookings={bookings} receipts={receipts} navigate={navigate} />

  const toggleAmenity = (code) => {
    setSelectedCodes((current) => current.includes(code) ? current.filter((item) => item !== code) : [...current, code])
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

  const pay = () => {
    const paymentError = validatePayment()
    setError(paymentError)
    if (paymentError) return
    const amountReceived = method === 'Cash' ? Number(details.amountReceived) : finalAmount
    const receipt = {
      orNumber: makeReceiptNumber(receipts),
      referenceNumber: booking.referenceNumber,
      guestName: booking.guestName,
      roomNumber: booking.roomNumber,
      roomType: booking.roomType,
      roomRate: booking.roomRate,
      amenitiesTotal,
      finalAmount,
      amountReceived,
      change: Math.max(0, amountReceived - finalAmount),
      paymentMethod: method,
      issuedAt: new Date().toLocaleString(),
    }
    setReceipts((current) => [...current, receipt])
    setBookings((current) => current.map((item) => item.referenceNumber === refNumber ? {
      ...item,
      amenityCodes: selectedCodes,
      amenitiesTotal,
      finalAmount,
      isPaid: true,
      paymentMethod: method,
      amountReceived,
      change: receipt.change,
    } : item))
    showToast(`Payment completed for ${refNumber}.`)
    navigate(`/payment/${refNumber}/receipt`)
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
                {seedAmenities.filter((item) => item.category === amenityCategory).map((amenity) => (
                  <tr key={amenity.code}>
                    <td className="mono">{amenity.code}</td>
                    <td>{amenity.name}</td>
                    <td>{formatCurrency(amenity.price)}</td>
                    <td>{amenity.type}</td>
                    <td><button className="table-action" type="button" onClick={() => toggleAmenity(amenity.code)}>{selectedCodes.includes(amenity.code) ? 'Remove' : 'Add'}</button></td>
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
              <Input label="Amount Received" type="number" value={details.amountReceived} onChange={(value) => setDetails({ ...details, amountReceived: value })} />
              <div className="readout"><span>Change</span><strong>{cashChange >= 0 ? formatCurrency(cashChange) : 'Insufficient'}</strong></div>
            </>
          ) : null}
          {method === 'Card' ? (
            <div className="form-grid one">
              <Input label="Cardholder Name" value={details.cardName} onChange={(value) => setDetails({ ...details, cardName: value })} />
              <Input label="Card Number" value={details.cardNumber} onChange={(value) => setDetails({ ...details, cardNumber: value.replace(/\D/g, '') })} />
              <Input label="Expiry Date" placeholder="MM/YY" value={details.expiry} onChange={(value) => setDetails({ ...details, expiry: value })} />
              <Input label="CVV" value={details.cvv} onChange={(value) => setDetails({ ...details, cvv: value.replace(/\D/g, '') })} />
            </div>
          ) : null}
          {method === 'GCash' ? (
            <div className="form-grid one">
              <Input label="GCash Number" value={details.gcashNumber} onChange={(value) => setDetails({ ...details, gcashNumber: value.replace(/\D/g, '') })} />
              <Input label="GCash Account Name" value={details.gcashName} onChange={(value) => setDetails({ ...details, gcashName: value })} />
            </div>
          ) : null}
          <ErrorText message={error} />
          <button className="primary-button full" type="button" onClick={pay}>Pay Now</button>
        </div>
      </div>
    </section>
  )
}

function Receipt({ refNumber, bookings, receipts, navigate }) {
  const booking = bookings.find((item) => item.referenceNumber === refNumber)
  const receipt = [...receipts].reverse().find((item) => item.referenceNumber === refNumber) || booking
  if (!booking || !receipt) return <NotFound navigate={navigate} />
  return (
    <section className="page narrow print-page">
      <PageTitle eyebrow="Receipt" title={receipt.orNumber || `Receipt for ${refNumber}`} text="Read-only receipt preview for printing or guest handoff." />
      <div className="receipt-card">
        <div className="receipt-head">
          <strong>ESPLENIN HOTEL</strong>
          <span>Official Receipt</span>
        </div>
        <BillRows rows={[
          ['OR Number', receipt.orNumber || 'Generated in backend'],
          ['Reference Number', refNumber],
          ['Guest Name', booking.guestName],
          ['Room', `${booking.roomNumber} - ${booking.roomType}`],
          ['Room Rate', formatCurrency(booking.roomRate)],
          ['Amenities Total', formatCurrency(booking.amenitiesTotal)],
          ['Total Due', formatCurrency(booking.finalAmount)],
          ['Amount Paid', formatCurrency(booking.amountReceived)],
          ['Change', formatCurrency(booking.change)],
          ['Payment Method', booking.paymentMethod || 'Pending'],
          ['Issued At', receipt.issuedAt || 'Pending'],
        ]} />
      </div>
      <div className="button-row no-print">
        <button className="primary-button" type="button" onClick={() => window.print()}>Print</button>
        <button className="outline-button" type="button" onClick={() => navigate('/booking')}>Back to Lookup</button>
      </div>
    </section>
  )
}

function StaffLogin({ setStaffAuthed, navigate, showToast }) {
  const [id, setId] = useState('frontdesk')
  return (
    <section className="page narrow">
      <PageTitle eyebrow="Staff portal" title="Staff login" text="A frontend-only session gate for protected registry, checkout, and inquiry views." />
      <div className="panel">
        <Input label="Staff ID" value={id} onChange={setId} />
        <Input label="Password" type="password" value="demo" onChange={() => {}} />
        <button className="primary-button full" type="button" onClick={() => { setStaffAuthed(true); showToast('Staff session started.'); navigate('/staff') }}>Sign In</button>
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

function Registry({ bookings, setBookings, setRooms, showToast }) {
  const [query, setQuery] = useState('')
  const [target, setTarget] = useState(null)
  const results = bookings.filter((booking) => booking.status === 'Active' && booking.guestName.toLowerCase().includes(query.toLowerCase()))

  const cancel = () => {
    setBookings((current) => current.map((booking) => booking.referenceNumber === target.referenceNumber ? { ...booking, status: 'Cancelled' } : booking))
    setRooms((current) => current.map((room) => room.id === target.roomId ? { ...room, isAvailable: true } : room))
    showToast(`${target.referenceNumber} cancelled.`)
    setTarget(null)
  }

  return (
    <section className="page">
      <PageTitle eyebrow="Registry" title="Search and cancel reservations" text="Staff can inspect active bookings and cancel with confirmation." />
      <div className="search-panel inline">
        <Input label="Guest Name" value={query} onChange={setQuery} />
      </div>
      <BookingTable bookings={results} onCancel={setTarget} />
      {target ? (
        <Modal title={`Cancel ${target.referenceNumber}`} onClose={() => setTarget(null)}>
          <p>{target.guestName} in room {target.roomNumber} will be cancelled and the room will return to vacant status.</p>
          <div className="button-row">
            <button className="danger-button" type="button" onClick={cancel}>Yes, Cancel</button>
            <button className="outline-button" type="button" onClick={() => setTarget(null)}>Go Back</button>
          </div>
        </Modal>
      ) : null}
    </section>
  )
}

function Checkout({ bookings, setBookings, setRooms, navigate, showToast }) {
  const [ref, setRef] = useState('')
  const [booking, setBooking] = useState(null)
  const [error, setError] = useState('')

  const lookup = () => {
    const found = bookings.find((item) => item.referenceNumber === ref.trim().toUpperCase() && item.status === 'Active')
    setBooking(found || null)
    setError(found ? '' : 'Reference number not found.')
  }

  const checkout = () => {
    setBookings((current) => current.map((item) => item.referenceNumber === booking.referenceNumber ? { ...item, status: 'CheckedOut' } : item))
    setRooms((current) => current.map((room) => room.id === booking.roomId ? { ...room, isAvailable: true } : room))
    showToast(`${booking.referenceNumber} checked out. Room is now vacant.`)
    navigate('/staff')
  }

  return (
    <section className="page narrow">
      <PageTitle eyebrow="Checkout" title="Guest checkout" text="Fetch a booking, verify payment, and finalize the guest stay." />
      <div className="search-panel">
        <Input label="Reference Number" value={ref} onChange={(value) => setRef(value.toUpperCase())} />
        <button className="primary-button" type="button" onClick={lookup}>Lookup</button>
      </div>
      <ErrorText message={error} />
      {booking ? (
        <div className="detail-card">
          <div className="split-heading"><h2>{booking.guestName}</h2><Badge status={booking.isPaid ? 'Paid' : 'Unpaid'} /></div>
          <BillRows rows={[
            ['Room', `${booking.roomNumber} - ${booking.roomType}`],
            ['Dates', `${booking.checkIn} to ${booking.checkOut}`],
            ['Final Amount', formatCurrency(booking.finalAmount)],
          ]} />
          {!booking.isPaid ? (
            <div className="warning-panel">
              <strong>Payment required</strong>
              <p>This booking must be paid before checkout can be completed.</p>
              <button className="primary-button" type="button" onClick={() => navigate(`/payment/${booking.referenceNumber}`)}>Go to Payment</button>
            </div>
          ) : (
            <button className="primary-button" type="button" onClick={checkout}>Confirm Checkout</button>
          )}
        </div>
      ) : null}
    </section>
  )
}

function Inquiry({ rooms }) {
  const [tab, setTab] = useState('Room Rates')
  const [category, setCategory] = useState('Classic')
  const [amenityCategory, setAmenityCategory] = useState('Convenience')
  const roomRows = rooms.filter((room) => room.category === category)

  return (
    <section className="page">
      <PageTitle eyebrow="Inquiry hub" title="Rates, amenities, and availability" text="Client-side tabs for the inquiry menu and its sub-functions." />
      <FilterBar value={tab} setValue={setTab} items={['Room Rates', 'Amenities', 'Availability']} />
      {tab !== 'Amenities' ? <Select label="Room Category" value={category} options={categories.slice(1)} onChange={setCategory} /> : null}
      {tab === 'Amenities' ? <Select label="Amenity Category" value={amenityCategory} options={amenityCategories} onChange={setAmenityCategory} /> : null}
      <div className="table-card">
        {tab === 'Amenities' ? (
          <table>
            <thead><tr><th>Code</th><th>Name</th><th>Price</th><th>Billing</th></tr></thead>
            <tbody>{seedAmenities.filter((item) => item.category === amenityCategory).map((item) => <tr key={item.code}><td className="mono">{item.code}</td><td>{item.name}</td><td>{formatCurrency(item.price)}</td><td>{item.type}</td></tr>)}</tbody>
          </table>
        ) : (
          <table>
            <thead><tr><th>Room</th><th>Category</th><th>Bedrooms</th><th>Rate</th><th>Status</th></tr></thead>
            <tbody>{roomRows.map((room) => <tr key={room.id}><td className="mono">{room.roomNumber}</td><td>{room.category}</td><td>{room.bedrooms}</td><td>{formatCurrency(room.pricePerNight)}</td><td><Badge status={room.isAvailable ? 'Vacant' : 'Occupied'} /></td></tr>)}</tbody>
          </table>
        )}
      </div>
    </section>
  )
}

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
      {items.map((item) => <button className={value === item ? 'active' : ''} type="button" key={item} onClick={() => setValue(item)}>{item}</button>)}
    </div>
  )
}

function RoomGrid({ rooms, navigate, details = false }) {
  return (
    <div className="room-grid">
      {rooms.map((room) => <RoomCard room={room} key={room.id} navigate={navigate} details={details} />)}
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
        <button className="primary-button" type="button" disabled={!room.isAvailable} onClick={() => navigate('/reserve')}>{room.isAvailable ? 'Reserve' : 'Unavailable'}</button>
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
        ['Dates', `${booking.checkIn} to ${booking.checkOut}`],
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
              <td>{booking.checkIn}</td>
              <td>{booking.checkOut}</td>
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
      {labels.map((label, index) => <li className={step === index + 1 ? 'active' : step > index + 1 ? 'done' : ''} key={label}><span>{index + 1}</span>{label}</li>)}
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
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} {...props} />
      <ErrorText message={error} />
    </label>
  )
}

function Select({ label, value, options, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
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

function ErrorText({ message }) {
  return message ? <small className="error-text">{message}</small> : null
}

function NotFound({ navigate }) {
  return (
    <section className="page narrow">
      <PageTitle eyebrow="Not found" title="This page is unavailable" text="The route or record could not be found in the frontend demo data." />
      <button className="primary-button" type="button" onClick={() => navigate('/')}>Back to Availability</button>
    </section>
  )
}

function amenityCost(amenity, booking) {
  if (!booking) return 0
  if (amenity.type === 'PerNight') return amenity.price * booking.numberOfDays
  if (amenity.type === 'PerGuest') return amenity.price * booking.numberOfGuests
  return amenity.price
}

function roomRange(rooms, category) {
  const values = rooms.filter((room) => room.category === category).map((room) => room.bedrooms)
  return `${Math.min(...values)}-${Math.max(...values)} bedrooms`
}

function priceRange(rooms, category) {
  const values = rooms.filter((room) => room.category === category).map((room) => room.pricePerNight)
  return `${formatCurrency(Math.min(...values))} to ${formatCurrency(Math.max(...values))}`
}

export default App
