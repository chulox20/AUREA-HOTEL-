import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { BookingProvider } from './contexts/BookingContext';

// Layouts
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AdminLayout from './components/layout/AdminLayout';
import AccountLayout from './components/layout/AccountLayout';

// Public pages
import Home from './pages/public/Home';
import Rooms from './pages/public/Rooms';
import RoomDetail from './pages/public/RoomDetail';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Booking
import BookingPage from './pages/booking/BookingPage';

// Account pages
import AccountDashboard from './pages/account/Dashboard';
import AccountBookings from './pages/account/Bookings';
import BookingDetail from './pages/account/BookingDetail';
import Profile from './pages/account/Profile';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminRooms from './pages/admin/Rooms';
import AdminRoomTypes from './pages/admin/RoomTypes';
import AdminBookings from './pages/admin/AdminBookings';
import AdminCalendar from './pages/admin/AdminCalendar';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminReviews from './pages/admin/AdminReviews';

// Public layout wrapper
function PublicLayout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BookingProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-sm)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
              },
            }}
          />

          <Routes>
            {/* Public routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/rooms/:id" element={<RoomDetail />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Account routes */}
            <Route element={<AccountLayout />}>
              <Route path="/account" element={<AccountDashboard />} />
              <Route path="/account/bookings" element={<AccountBookings />} />
              <Route path="/account/bookings/:id" element={<BookingDetail />} />
              <Route path="/account/profile" element={<Profile />} />
            </Route>

            {/* Admin routes */}
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/rooms" element={<AdminRooms />} />
              <Route path="/admin/room-types" element={<AdminRoomTypes />} />
              <Route path="/admin/bookings" element={<AdminBookings />} />
              <Route path="/admin/calendar" element={<AdminCalendar />} />
              <Route path="/admin/customers" element={<AdminCustomers />} />
              <Route path="/admin/reviews" element={<AdminReviews />} />
            </Route>
          </Routes>
        </BookingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
