import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { formatDate, formatPrice } from '../../utils/helpers';

const StatusBadge = ({ paid }) =>
  paid ? <span className="badge-success">Paid</span> : <span className="badge-warn">Pending</span>;

const DeliveryBadge = ({ delivered }) =>
  delivered ? <span className="badge-success">Delivered</span> : <span className="badge-muted">Pending</span>;

// Admin order list row
const OrderTable = ({ order }) => (
  <tr className="border-b border-line last:border-0 transition hover:bg-ink/[0.025]">
    <td className="px-4 py-3 text-xs text-muted">{order._id}</td>
    <td className="hidden px-4 py-3 font-serif text-base text-ink sm:table-cell">{order.userName}</td>
    <td className="hidden px-4 py-3 text-sm text-muted md:table-cell">
      {formatDate(order.createdAt)}
    </td>
    <td className="px-4 py-3 font-serif text-lg italic text-ink">{formatPrice(order.totalPrice)}</td>
    <td className="px-4 py-3">
      <StatusBadge paid={order.isPaid} />
    </td>
    <td className="px-4 py-3">
      <DeliveryBadge delivered={order.isDelivered} />
    </td>
    <td className="px-4 py-3 text-right">
      <Link to={`/admin/order/${order._id}`} className="link-arrow group justify-end">
        Details
        <ArrowRight className="h-3 w-3 arrow-slide" aria-hidden="true" />
      </Link>
    </td>
  </tr>
);

export default OrderTable;
