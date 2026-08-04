import useReveal from '../../hooks/useReveal';

/**
 * Fade-up wrapper for scroll reveals.
 * `delay` (ms) staggers siblings; `as` sets the element type.
 */
const Reveal = ({ children, delay = 0, className = '', as: Tag = 'div' }) => {
  const ref = useReveal();
  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`}
      style={{ '--reveal-delay': `${delay}ms` }}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
