import { Link } from 'react-router-dom';

const steps = [
  { label: 'Sign In', path: '/login' },
  { label: 'Shipping', path: '/shipping' },
  { label: 'Payment', path: '/payment' },
  { label: 'Place Order', path: '/placeorder' },
];

// Checkout progress — numbered editorial steps with hairline connectors
const CheckoutSteps = ({ current }) => {
  const currentIndex = steps.findIndex((s) => s.label === current);

  return (
    <nav aria-label="Checkout progress" className="mb-12">
      <ol className="flex flex-wrap items-center justify-center gap-y-3">
        {steps.map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;

          return (
            <li key={step.label} className="flex items-center">
              {i > 0 && (
                <span
                  className="mx-5 h-px w-8 bg-line sm:mx-10 sm:w-16"
                  aria-hidden="true"
                />
              )}
              {done ? (
                <Link to={step.path} className="group flex items-baseline gap-2.5" aria-label={`Go back to ${step.label}`}>
                  <span className="font-serif text-sm italic text-muted transition group-hover:text-ink">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted transition group-hover:text-ink">
                    {step.label}
                  </span>
                </Link>
              ) : (
                <span
                  className={`flex items-baseline gap-2.5 ${active ? '' : 'opacity-35'}`}
                  aria-current={active ? 'step' : undefined}
                >
                  <span className="font-serif text-sm italic text-ink">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${
                      active ? 'text-ink' : 'text-faint'
                    }`}
                  >
                    {step.label}
                  </span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default CheckoutSteps;
