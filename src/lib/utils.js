import { format, differenceInDays, addDays, isAfter, isBefore, isEqual, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Format currency amount
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date to display format
 */
export function formatDate(date, pattern = 'd MMM yyyy') {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern, { locale: es });
}

/**
 * Format a date range (e.g., "15 Ago → 18 Ago")
 */
export function formatDateRange(checkIn, checkOut) {
  return `${formatDate(checkIn, 'd MMM')} → ${formatDate(checkOut, 'd MMM')}`;
}

/**
 * Calculate number of nights between two dates
 */
export function calculateNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const start = typeof checkIn === 'string' ? parseISO(checkIn) : checkIn;
  const end = typeof checkOut === 'string' ? parseISO(checkOut) : checkOut;
  return Math.max(0, differenceInDays(end, start));
}

/**
 * Calculate booking total
 */
export function calculateBookingTotal(pricePerNight, nights, taxRate = 0.10) {
  const subtotal = pricePerNight * nights;
  const tax = subtotal * taxRate;
  return {
    subtotal,
    tax,
    total: subtotal + tax,
    nights,
    pricePerNight,
    taxRate,
  };
}

/**
 * Generate reservation code
 */
export function generateReservationCode() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `AUR-${num}`;
}

/**
 * Get status badge class
 */
export function getStatusBadgeClass(status) {
  const map = {
    pending: 'badge-pending',
    confirmed: 'badge-confirmed',
    checked_in: 'badge-checked-in',
    checked_out: 'badge-checked-out',
    cancelled: 'badge-cancelled',
    paid: 'badge-confirmed',
    failed: 'badge-cancelled',
    refunded: 'badge-checked-out',
    available: 'badge-available',
    maintenance: 'badge-maintenance',
    inactive: 'badge-inactive',
  };
  return map[status] || 'badge-pending';
}

/**
 * Get status label in Spanish
 */
export function getStatusLabel(status) {
  const map = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    checked_in: 'Check-in',
    checked_out: 'Check-out',
    cancelled: 'Cancelada',
    paid: 'Pagado',
    failed: 'Fallido',
    refunded: 'Reembolsado',
    available: 'Disponible',
    maintenance: 'Mantenimiento',
    inactive: 'Inactiva',
  };
  return map[status] || status;
}

/**
 * Get user initials for avatar
 */
export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Truncate text
 */
export function truncate(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
export function getTodayISO() {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Get tomorrow's date as ISO string
 */
export function getTomorrowISO() {
  return format(addDays(new Date(), 1), 'yyyy-MM-dd');
}

/**
 * Debounce function
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Classnames helper (like clsx)
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export { addDays, isAfter, isBefore, isEqual, differenceInDays, parseISO, format };
