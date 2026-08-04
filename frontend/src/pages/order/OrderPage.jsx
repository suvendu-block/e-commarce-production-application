import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getOrderDetails, payOrder, deliverOrder, resetPay, resetDeliver } from '../../store/slices/orderSlice';
import { formatDate, formatPrice } from '../../utils/helpers';
import Loader, { Spinner } from '../../components/ui/Loader';
import Message from '../../components/ui/Message';
import Meta from '../../components/ui/Meta';

// Shared order detail — used by both /order/:id (user) and /admin/order/:id
const OrderPage = () => {
  const dispatch = useDispatch();
  const { id } = useParams();

  const { order, loading, error } = useSelector((s) => s.order.detail);
  const pay = useSelector((s) => s.order.pay);
  const deliver = useSelector((s) => s.order.deliver);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    if (id) dispatch(getOrderDetails(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (pay.success) {
      toast.success('Order marked as paid');
      dispatch(resetPay());
    }
    if (deliver.success) {
      toast.success('Order marked as delivered');
      dispatch(resetDeliver());
    }
  }, [pay.success, deliver.success, dispatch]);

  if (loading) return <Loader label="Loading order" className="py-24" />;
  if (error) return (
    <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6">
      <Message variant="error">{error}</Message>
    </div>
  );
  if (!order) return null;

  const itemsCount = order.orderItems.reduce((n, i) => n + i.qty, 0);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6">
      <Meta title={`Order ${order._id}`} />

      <p className="kicker mb-4">Confirmation</p>
      <h1 className="font-serif text-4xl text-ink md:text-5xl">
        Order <em className="text-muted">#{order._id}</em>
      </h1>
      <p className="mt-3 text-sm text-muted">
        Placed on {formatDate(order.createdAt)} · {itemsCount} item{itemsCount === 1 ? '' : 's'}
      </p>

      {pay.error && <Message variant="error" className="mt-6">{pay.error}</Message>}
      {deliver.error && <Message variant="error" className="mt-6">{deliver.error}</Message>}

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          {/* Shipping */}
          <section className="border-b border-line pb-8">
            <h2 className="font-serif text-2xl text-ink">Shipping</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {order.shippingAddress.address}, {order.shippingAddress.city}{' '}
              {order.shippingAddress.postalCode}, {order.shippingAddress.country}
            </p>
            <div className="mt-4">
              {order.isDelivered ? (
                <span className="badge-success">
                  Delivered on {formatDate(order.deliveredAt)}
                </span>
              ) : (
                <span className="badge-muted">Not yet delivered</span>
              )}
            </div>
          </section>

          {/* Payment */}
          <section className="border-b border-line pb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-serif text-2xl text-ink">Payment — {order.paymentMethod}</h2>
              {order.isPaid ? (
                <span className="badge-success">Paid on {formatDate(order.paidAt)}</span>
              ) : (
                <span className="badge-warn">Not paid</span>
              )}
            </div>
            {order.paymentResult?.status && (
              <p className="mt-3 text-sm text-muted">
                Provider status: <span className="font-medium text-ink">{order.paymentResult.status}</span>
                {order.paymentResult.id && <> · ref {order.paymentResult.id}</>}
              </p>
            )}
            {!order.isPaid && user.isAdmin && (
              <button
                type="button"
                onClick={() => dispatch(payOrder({ id: order._id, paymentResult: { id: 'mock_pay', status: 'completed' } }))}
                disabled={pay.loading}
                className="btn-primary mt-6"
              >
                {pay.loading && <Spinner />} Mark as paid
                <ArrowRight className="h-3.5 w-3.5 arrow-slide" aria-hidden="true" />
              </button>
            )}
          </section>

          {/* Items */}
          <section>
            <h2 className="font-serif text-2xl text-ink">Items</h2>
            <ul className="mt-2 border-t border-line">
              {order.orderItems.map((item) => (
                <li key={item.product} className="flex items-center gap-5 border-b border-line py-5">
                  <img src={item.image} alt="" loading="lazy" className="h-16 w-16 border border-line object-cover" />
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/product/${item.product}`}
                      className="line-clamp-1 font-serif text-lg text-ink transition hover:opacity-70"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-xs uppercase tracking-[0.18em] text-faint">
                      {item.qty} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <span className="font-serif text-lg italic text-ink">
                    {formatPrice(item.price * item.qty)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Totals */}
        <aside className="h-fit border border-line p-8 lg:sticky lg:top-24">
          <h2 className="font-serif text-2xl text-ink">Order summary</h2>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Items</dt>
              <dd className="font-serif text-base">{formatPrice(order.itemsPrice)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Shipping</dt>
              <dd className="font-serif text-base">{order.shippingPrice === 0 ? 'Free' : formatPrice(order.shippingPrice)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Tax (8%)</dt>
              <dd className="font-serif text-base">{formatPrice(order.taxPrice)}</dd>
            </div>
          </dl>
          <div className="mt-5 flex items-baseline justify-between border-t border-line pt-5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
              Total
            </span>
            <span className="font-serif text-3xl italic text-ink">{formatPrice(order.totalPrice)}</span>
          </div>
          {user.isAdmin && !order.isDelivered && (
            <button
              type="button"
              onClick={() => dispatch(deliverOrder(order._id))}
              disabled={deliver.loading}
              className="btn-outline mt-6 w-full"
            >
              {deliver.loading && <Spinner />} Mark as delivered
            </button>
          )}
          <Link
            to={user.isAdmin ? '/admin/orders' : '/profile'}
            className="link-arrow group mt-6 w-full justify-center"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to {user.isAdmin ? 'orders' : 'profile'}
          </Link>
        </aside>
      </div>
    </div>
  );
};

export default OrderPage;
