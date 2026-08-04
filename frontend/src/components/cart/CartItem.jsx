import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { formatPrice } from '../../utils/helpers';

// Single cart row — hairline bottom rule, image, serif name, underline qty, italic total
const CartItem = ({ item, onQtyChange, onRemove }) => (
  <div className="flex items-center gap-4 border-b border-line py-6 first:border-t sm:gap-6">
    <Link to={`/product/${item.product}`} className="shrink-0">
      <img
        src={item.image}
        alt={item.name}
        loading="lazy"
        decoding="async"
        className="h-20 w-20 border border-line object-cover sm:h-24 sm:w-24"
      />
    </Link>

    <div className="min-w-0 flex-1">
      <Link
        to={`/product/${item.product}`}
        className="line-clamp-1 font-serif text-lg text-ink transition hover:opacity-70"
      >
        {item.name}
      </Link>
      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-faint">
        {formatPrice(item.price)} each
      </p>
    </div>

    <label className="flex items-center gap-2 text-sm text-muted">
      <span className="sr-only">Quantity for {item.name}</span>
      <select
        value={item.qty}
        onChange={(e) => onQtyChange(item.product, Number(e.target.value))}
        className="input !w-20 !border-b-0 !py-1"
      >
        {Array.from({ length: item.countInStock }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </label>

    <span className="w-20 text-right font-serif text-lg italic text-ink sm:w-24">
      {formatPrice(item.price * item.qty)}
    </span>

    <button
      type="button"
      onClick={() => onRemove(item.product)}
      aria-label={`Remove ${item.name} from cart`}
      className="flex h-9 w-9 items-center justify-center text-faint transition hover:bg-danger-soft hover:text-danger"
    >
      <X className="h-4 w-4" />
    </button>
  </div>
);

export default CartItem;
