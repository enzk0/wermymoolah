import clsx from 'clsx';

const base =
  'cursor-pointer rounded-lg border font-medium transition-colors ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

const variants = {
  default:
    'border-rule-strong bg-surface text-ink hover:enabled:border-ink-faint hover:enabled:bg-surface-hover',
  primary: 'border-accent bg-accent text-accent-ink hover:enabled:brightness-110',
  ghost: 'border-transparent text-ink-soft hover:enabled:bg-surface-hover',
  danger: 'border-transparent text-danger hover:enabled:bg-danger-wash',
  outline: 'border-transparent text-ink-soft hover:enabled:border-ink-faint',
};

const sizes = {
  normal: 'px-3 py-1.5 text-sm',
  small: 'px-2 py-1 text-xs',
  icon: 'grid size-8 place-items-center text-lg leading-none',
};

export function Button({ variant = 'default', size = 'normal', className, ...props }) {
  return (
    <button
      type="button"
      className={clsx(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
