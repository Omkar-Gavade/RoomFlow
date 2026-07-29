/**
 * FormField — label + control + inline error near the field (DESIGN-SYSTEM §8.2).
 * Error is linked via aria-describedby for screen readers (§15 #8).
 */
import { useId } from 'react';

import { Label } from './Label.jsx';
import { Input } from './Input.jsx';

export function FormField({ label, name, required, error, hint, children, ...inputProps }) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className="mb-4">
      {label && (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      )}
      {children || (
        <Input id={id} name={name} error={Boolean(error)} aria-describedby={error ? errorId : undefined} {...inputProps} />
      )}
      {hint && !error && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p id={errorId} className="mt-1 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export default FormField;
