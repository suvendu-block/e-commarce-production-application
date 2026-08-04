import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { removeFromCart, setQty } from '../store/slices/cartSlice';
import { formatPrice, getSubtotal } from '../utils/helpers';
import CartItem from '../components/cart/CartItem';
import Meta from '../components/ui/Meta';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((s) => s.cart.cartItems);
  const { user } = useSelector((s) => s.auth);

  const subtotal = getSubtotal(cartItems);
  const itemCount = cartItems.reduce((n, i) => n + i.qty, 0);

  const onCheckout = () => navigate(user ? '/shipping' : '/login');

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6">
      <Meta title="Shopping Cart" />

      <p className="kicker mb-4">Your selection</p>
      <h1 className="font-serif text-4xl text-ink md:text-5xl">
        {cartItems.length === 0 ? (
          'Cart'
        ) : (
          <>
            Cart <em>— {itemCount} piece{itemCount === 1 ? '' : 's'}</em>
          </>
        )}
      </h1>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-28 text-center">
          <p className="font-serif text-2xl text-ink">Your cart is <em>empty</em></p>
          <p className="max-w-sm text-sm text-muted">
            Discover something worth keeping from the collection.
          </p>
          <Link to="/" className="btn-primary mt-2">
            Shop the collection
            <ArrowRight className="h-3.5 w-3.5 arrow-slide" aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Items */}
          <div className="border-t border-line lg:col-span-2">
            {cartItems.map((item) => (
              <CartItem
                key={item.product}
                item={item}
                onQtyChange={(productId, qty) => dispatch(setQty({ productId, qty }))}
                onRemove={(productId) => dispatch(removeFromCart(productId))}
              />
            ))}
          </div>

          {/* Summary */}
          <aside className="h-fit border border-line p-8 lg:sticky lg:top-24">
            <h2 className="font-serif text-2xl text-ink">Order summary</h2>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal ({itemCount} items)</dt>
                <dd className="font-serif text-base">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Shipping</dt>
                <dd className="text-muted">Calculated at checkout</dd>
              </div>
            </dl>
            <div className="mt-5 flex items-baseline justify-between border-t border-line pt-5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
                Total
              </span>
              <span className="font-serif text-3xl italic text-ink">{formatPrice(subtotal)}</span>
            </div>
            <button type="button" onClick={onCheckout} className="btn-primary mt-7 w-full">
              Proceed to checkout
              <ArrowRight className="h-3.5 w-3.5 arrow-slide" aria-hidden="true" />
            </button>
            <Link to="/" className="link-arrow group mt-5 justify-center w-full">
              Continue shopping
              <ArrowRight className="h-3.5 w-3.5 arrow-slide" aria-hidden="true" />
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
};

export default CartPage;
