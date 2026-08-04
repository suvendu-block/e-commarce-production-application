import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { formatPrice } from '../../utils/helpers';
import Rating from './Rating';

// Product tile — editorial: image, serif name, italic price, hairline top.
// `tall` makes the image 4:5 for asymmetric grids; default 1:1.
const ProductCard = ({ product, tall = false }) => (
  <Link
    to={`/product/${product._id}`}
    className="group flex flex-col border-t border-line pt-4 transition-colors hover:border-ink"
  >
    <div className={`overflow-hidden bg-surface-2 ${tall ? 'aspect-[4/5]' : 'aspect-square'}`}>
      <img
        src={product.image}
        alt={product.name}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />
    </div>
    <div className="flex flex-1 flex-col gap-1 pt-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-faint">
        {product.brand}
      </p>
      <h3 className="font-serif text-lg leading-snug text-ink transition-opacity group-hover:opacity-70">
        {product.name}
      </h3>
      <div className="mt-auto flex items-baseline justify-between gap-3 pt-2">
        <Rating value={product.rating} />
        <span className="font-serif text-lg italic text-ink">{formatPrice(product.price)}</span>
      </div>
      <p className="text-xs text-faint">
        {product.numReviews} review{product.numReviews === 1 ? '' : 's'}
      </p>
    </div>
    <span className="sr-only">View {product.name}</span>
    <ArrowUpRight
      className="mt-3 h-4 w-4 self-end text-faint transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-ink"
      aria-hidden="true"
    />
  </Link>
);

export default ProductCard;
