import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight } from 'lucide-react';
import { createOrder, resetCreate } from '../../store/slices/orderSlice';
import { clearCart } from '../../store/slices/cartSlice';
import { computeTotals, formatPrice } from '../../utils/helpers';
import CheckoutSteps from '../../components/cart/CheckoutSteps';
import Message from '../../components/ui/Message';
import { Spinner } from '../../components/ui/Loader';
import Meta from '../../components/ui/Meta';

const PlaceOrderPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems, shippingAddress, paymentMethod } = useSelector((s) => s.cart);
  const { user } = useSelector((s) => s.auth);
  const { loading, error, success, order } = useSelector((s) => s.order.create);

  const totals = computeTotals(cartItems);

  useEffect(() => {
    if (success && order) {
      dispatch(clearCart());
      toast.success('Order placed!');
      navigate(`/order/${order._id}`);
    }
    return () => {
      if (success) dispatch(resetCreate());
    };
  }, [success, order, dispatch, navigate]);

  const onPlaceOrder = () => {
    dispatch(
      createOrder({
        orderItems: cartItems.map((i) => ({ product: i.product, qty: i.qty })),
        shippingAddress,
        paymentMethod,
      })
    );
  };

  if (!shippingAddress) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6">
        <Message variant="info">
          Please complete your <Link to="/shipping" className="font-semibold underline">shipping details</Link> first.
        </Message>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6">
      <Meta title="Review Order" />
      <CheckoutSteps current="Place Order" />

      <p className="kicker mb-4">Step three</p>
      <h1 className="mb-10 font-serif text-4xl text-ink md:text-5xl">Review your order</h1>

      {error && <Message variant="error" className="mb-8">{error}</Message>}

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Left: shipping / payment / items */}
        <div className="space-y-10 lg:col-span-2">
          <section className="border-b border-line pb-8">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl text-ink">Shipping</h2>
              <Link to="/shipping" className="link-arrow group text-faint hover:text-ink">
                Edit
                <ArrowRight className="h-3 w-3 arrow-slide" aria-hidden="true" />
              </Link>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {shippingAddress.address}, {shippingAddress.city} {shippingAddress.postalCode},{' '}
              {shippingAddress.country}
            </p>
          </section>

          <section className="border-b border-line pb-8">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl text-ink">Payment</h2>
              <Link to="/payment" className="link-arrow group text-faint hover:text-ink">
                Edit
                <ArrowRight className="h-3 w-3 arrow-slide" aria-hidden="true" />
              </Link>
            </div>
            <p className="mt-3 text-sm text-muted">{paymentMethod}</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink">Items</h2>
            <ul className="mt-2 border-t border-line">
              {cartItems.map((item) => (
                <li key={item.product} className="flex items-center gap-5 border-b border-line py-5">
                  <img
                    src={item.image}
                    alt=""
                    loading="lazy"
                    className="h-16 w-16 border border-line object-cover"
                  />
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

        {/* Right: totals */}
        <aside className="h-fit border border-line p-8 lg:sticky lg:top-24">
          <h2 className="font-serif text-2xl text-ink">Order summary</h2>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Items</dt>
              <dd className="font-serif text-base">{formatPrice(totals.itemsPrice)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Shipping</dt>
              <dd className="font-serif text-base">
                {totals.shippingPrice === 0 ? 'Free' : formatPrice(totals.shippingPrice)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Tax (8%)</dt>
              <dd className="font-serif text-base">{formatPrice(totals.taxPrice)}</dd>
            </div>
          </dl>
          <div className="mt-5 flex items-baseline justify-between border-t border-line pt-5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
              Total
            </span>
            <span className="font-serif text-3xl italic text-ink">{formatPrice(totals.totalPrice)}</span>
          </div>
          <p className="mt-5 border border-line p-4 text-xs leading-relaxed text-muted">
            Prices are confirmed and computed on the server when you place the order.
          </p>
          <button
            type="button"
            onClick={onPlaceOrder}
            disabled={loading || cartItems.length === 0}
            className="btn-primary mt-6 w-full"
          >
            {loading && <Spinner />} Place order
          </button>
          <p className="mt-4 text-center text-xs text-faint">
            Signed in as <span className="font-medium text-muted">{user?.email}</span>
          </p>
        </aside>
      </div>
    </div>
  );
};

export default PlaceOrderPage;
