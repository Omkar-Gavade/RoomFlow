/**
 * Shared UX states — DESIGN-SYSTEM §14.3 and skill "Feedback: Empty States"
 * (never a blank screen: always a message + an action) and "Error Recovery"
 * (always give a next step, never an error message alone).
 */
import { motion } from 'framer-motion';
import { Inbox, SearchX, ShieldAlert, WifiOff, AlertCircle, RefreshCw } from 'lucide-react';

import { cn } from '../../lib/cn.js';
import { Button } from './Button.jsx';
import { scaleIn } from '../../lib/motion.js';

function Shell({ icon: Icon, title, message, action, tone = 'muted', className }) {
  const toneCls = {
    muted: 'text-muted-foreground bg-muted',
    danger: 'text-destructive bg-destructive/10',
    warn: 'text-status-pending bg-status-pending/10',
  }[tone];

  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="show"
      className={cn('flex flex-col items-center justify-center gap-3 px-6 py-14 text-center', className)}
    >
      <span className={cn('rounded-2xl p-4', toneCls)}>
        <Icon size={26} aria-hidden />
      </span>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      {action}
    </motion.div>
  );
}

export function EmptyState({ title = 'Nothing here yet', message = 'When there is data it will appear here.', action, className }) {
  return <Shell icon={Inbox} title={title} message={message} action={action} className={className} />;
}

export function SearchEmptyState({ query, onClear }) {
  return (
    <Shell
      icon={SearchX}
      title="No matches found"
      message={query ? `Nothing matched “${query}”. Try a different term or clear your filters.` : 'Try adjusting your filters.'}
      action={
        onClear && (
          <Button variant="outline" size="sm" onClick={onClear}>
            Clear filters
          </Button>
        )
      }
    />
  );
}

export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <Shell
      icon={AlertCircle}
      tone="danger"
      title="We hit a problem"
      message={message}
      action={
        onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw size={14} /> Try again
          </Button>
        )
      }
    />
  );
}

export function PermissionDenied() {
  return (
    <Shell
      icon={ShieldAlert}
      tone="warn"
      title="You don’t have access"
      message="Your role doesn’t permit this page. Contact an administrator if you believe this is a mistake."
    />
  );
}

export function OfflineState({ onRetry }) {
  return (
    <Shell
      icon={WifiOff}
      tone="warn"
      title="You’re offline"
      message="Check your connection — RoomFlow will reconnect automatically."
      action={
        onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        )
      }
    />
  );
}

export default EmptyState;
