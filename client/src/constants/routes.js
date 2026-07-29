/** Central route path registry (DESIGN-SYSTEM §13, ARCHITECTURE §14). */
export const ROUTES = Object.freeze({
  LANDING: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',
  DASHBOARD: '/dashboard',
  ROOMS: '/rooms',
  BOOKINGS: '/bookings',
  MY_BOOKINGS: '/bookings/me',
  CALENDAR: '/calendar',
  APPROVALS: '/approvals',
  USERS: '/users',
  REPORTS: '/reports',
  NOTIFICATIONS: '/notifications',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  NOT_FOUND: '*',
});

export default ROUTES;
