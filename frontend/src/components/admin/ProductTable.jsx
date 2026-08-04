import { Link } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { formatPrice } from '../../utils/helpers';

// Admin product list row
const ProductTable = ({ product, onDelete, deleting }) => (
  <tr className="border-b border-line last:border-0 transition hover:bg-ink/[0.025]">
    <td className="py-3">
      <img
        src={product.image}
        alt=""
        loading="lazy"
        className="h-14 w-14 border border-line object-cover"
      />
    </td>
    <td className="px-4 py-3 font-serif text-base text-ink">{product.name}</td>
    <td className="px-4 py-3 font-serif italic text-muted">{formatPrice(product.price)}</td>
    <td className="hidden px-4 py-3 text-sm text-muted sm:table-cell">{product.category}</td>
    <td className="hidden px-4 py-3 text-sm text-muted md:table-cell">{product.countInStock}</td>
    <td className="px-4 py-3 text-right">
      <div className="flex justify-end gap-2">
        <Link
          to={`/admin/product/${product._id}/edit`}
          aria-label={`Edit ${product.name}`}
          className="border border-transparent p-2 text-muted transition hover:border-line hover:text-ink"
        >
          <Pencil className="h-4 w-4" />
        </Link>
        <button
          type="button"
          onClick={() => onDelete(product)}
          disabled={deleting}
          aria-label={`Delete ${product.name}`}
          className="border border-transparent p-2 text-muted transition hover:border-danger/40 hover:text-danger disabled:opacity-40"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </td>
  </tr>
);

export default ProductTable;
