/** AuthLayout — DESIGN-SYSTEM §13.2.2. Split: brand panel + form card (≤400px). */
import { Link } from 'react-router-dom';

import { ROUTES } from '../../constants/routes.js';

export function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <Link to={ROUTES.LANDING} className="text-2xl font-bold">
          RoomFlow
        </Link>
        <div>
          <h1 className="text-3xl font-bold leading-tight">Smart room booking, without the conflicts.</h1>
          <p className="mt-3 max-w-sm text-primary-foreground/80">
            Real-time availability, approval workflows, and instant confirmations for classrooms,
            labs, and halls.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/70">© RoomFlow</p>
      </div>
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-[400px]">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
