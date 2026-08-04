// Alert box — hairline bar on the left, sharp corners, muted fills.
// variant: 'error' | 'success' | 'warning' | 'info' (default 'info')
const styles = {
  error: { wrap: 'border-danger/30 border-l-danger bg-danger-soft/60', text: 'text-danger' },
  success: { wrap: 'border-success/30 border-l-success bg-success-soft/60', text: 'text-success' },
  warning: { wrap: 'border-warn/30 border-l-warn bg-warn-soft/60', text: 'text-warn' },
  info: { wrap: 'border-line border-l-ink bg-surface', text: 'text-muted' },
};

const Message = ({ children, variant = 'info', className = '' }) => {
  const style = styles[variant] || styles.info;
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`border border-l-[3px] px-5 py-3.5 text-sm leading-relaxed ${style.wrap} ${style.text} ${className}`}
    >
      {children}
    </div>
  );
};

export default Message;
