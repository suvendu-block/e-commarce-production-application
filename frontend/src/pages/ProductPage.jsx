import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { ArrowRight } from 'lucide-react';
import {
  getProductDetails,
  createProductReview,
  resetReview,
  getTopProducts,
} from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { formatDate, formatPrice } from '../utils/helpers';
import Rating from '../components/ui/Rating';
import Loader, { Spinner } from '../components/ui/Loader';
import Message from '../components/ui/Message';
import ProductCard from '../components/ui/ProductCard';
import Meta from '../components/ui/Meta';

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().min(3, 'Comment must be at least 3 characters').max(1000),
});

const ProductPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { product, loading, error } = useSelector((s) => s.product.detail);
  const review = useSelector((s) => s.product.review);
  const top = useSelector((s) => s.product.top);
  const { user } = useSelector((s) => s.auth);

  const [qty, setQty] = useState(1);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm({ resolver: zodResolver(reviewSchema) });

  const ratingValue = useWatch({ control, name: 'rating' }) || 0;

  useEffect(() => {
    if (id) dispatch(getProductDetails(id));
    return () => {
      dispatch(resetReview());
    };
  }, [dispatch, id]);

  useEffect(() => {
    dispatch(getTopProducts());
  }, [dispatch]);

  useEffect(() => {
    if (review.success) {
      toast.success('Review added — thank you!');
      reset();
      dispatch(getProductDetails(id));
      dispatch(resetReview());
    }
  }, [review.success, dispatch, id, reset]);

  const alreadyReviewed =
    user && product?.reviews?.some((r) => r.user === user._id || r.name === user.name);

  const onReview = ({ rating, comment }) => {
    dispatch(createProductReview({ productId: id, rating, comment }));
  };

  const onAddToCart = () => {
    dispatch(addToCart({ product, qty }));
    toast.success('Added to cart');
    navigate('/cart');
  };

  if (loading) return <Loader label="Loading product" className="py-24" />;
  if (error)
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6">
        <Message variant="error">{error}</Message>
      </div>
    );
  if (!product) return null;

  const inStock = product.countInStock > 0;
  const related = top.products.filter((p) => p._id !== product._id).slice(0, 4);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
      <Meta title={product.name} description={product.description} />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-10 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-faint">
        <Link to="/" className="transition hover:text-ink">Home</Link>
        <span aria-hidden="true">/</span>
        <Link
          to={`/?category=${encodeURIComponent(product.category)}`}
          className="transition hover:text-ink"
        >
          {product.category}
        </Link>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Image */}
        <div className="overflow-hidden bg-surface-2">
          <img
            src={product.image}
            alt={product.name}
            decoding="async"
            className="aspect-square w-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center">
          <p className="kicker">{product.brand}</p>
          <h1 className="mt-3 font-serif text-3xl leading-tight text-ink md:text-5xl">
            {product.name}
          </h1>

          <div className="mt-5 flex items-center gap-3">
            <Rating value={product.rating} />
            <span className="text-xs uppercase tracking-[0.18em] text-faint">
              {product.rating.toFixed(1)} · {product.numReviews} review
              {product.numReviews === 1 ? '' : 's'}
            </span>
          </div>

          <p className="mt-6 font-serif text-3xl italic text-ink md:text-4xl">
            {formatPrice(product.price)}
          </p>
          <p className="mt-5 max-w-prose leading-relaxed text-muted">{product.description}</p>

          {/* Meta rows */}
          <div className="mt-8 border-t border-line">
            <div className="flex items-center justify-between border-b border-line py-3.5 text-sm">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
                Availability
              </span>
              <span className={inStock ? 'text-success' : 'text-danger'}>
                {inStock ? `${product.countInStock} in stock` : 'Out of stock'}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-line py-3.5 text-sm">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
                Delivery
              </span>
              <span className="text-muted">Free over $100 · 30-day returns</span>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {inStock && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="flex h-11 w-11 items-center justify-center border border-line text-muted transition hover:border-ink hover:text-ink"
                >
                  −
                </button>
                <span className="w-12 text-center font-serif text-lg" aria-live="polite">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(product.countInStock, q + 1))}
                  aria-label="Increase quantity"
                  className="flex h-11 w-11 items-center justify-center border border-line text-muted transition hover:border-ink hover:text-ink"
                >
                  +
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={onAddToCart}
              disabled={!inStock}
              className="btn-primary flex-1 sm:flex-none sm:min-w-64"
            >
              {inStock ? 'Add to cart' : 'Sold out'}
              <ArrowRight className="h-3.5 w-3.5 arrow-slide" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section
        className="mt-24 grid grid-cols-1 gap-12 border-t border-line pt-16 lg:grid-cols-2 lg:gap-20"
        aria-labelledby="reviews-heading"
      >
        <div>
          <h2 id="reviews-heading" className="font-serif text-3xl text-ink">
            Reviews
            <span className="ml-3 font-sans text-sm italic text-faint">{product.numReviews}</span>
          </h2>
          {product.reviews.length === 0 ? (
            <p className="mt-6 text-sm text-muted">
              No reviews yet — be the first to review this product.
            </p>
          ) : (
            <ul className="mt-2">
              {product.reviews.map((r) => (
                <li key={r._id} className="border-b border-line py-6 first:border-t">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-semibold text-ink">{r.name}</span>
                    <span className="text-xs text-faint">{formatDate(r.createdAt)}</span>
                  </div>
                  <Rating value={r.rating} className="mt-2.5" />
                  <p className="mt-3 text-sm leading-relaxed text-muted">{r.comment}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="font-serif text-3xl text-ink">Share your experience</h2>
          {!user ? (
            <Message variant="info" className="mt-6">
              Please <Link to="/login" className="font-semibold underline">sign in</Link> to write a
              review.
            </Message>
          ) : alreadyReviewed ? (
            <Message variant="success" className="mt-6">
              You have already reviewed this product. Thank you!
            </Message>
          ) : (
            <form onSubmit={handleSubmit(onReview)} className="mt-6 space-y-7">
              <div>
                <span className="label">Your rating</span>
                <Rating
                  interactive
                  value={ratingValue}
                  onChange={(v) => setValue('rating', v, { shouldValidate: true })}
                />
                {errors.rating && <p className="field-error">{errors.rating.message}</p>}
              </div>
              <div>
                <label htmlFor="comment" className="label">
                  Comment
                </label>
                <textarea
                  id="comment"
                  rows="4"
                  placeholder="What did you think?"
                  className="input resize-none"
                  {...register('comment')}
                />
                {errors.comment && <p className="field-error">{errors.comment.message}</p>}
              </div>
              {review.error && <Message variant="error">{review.error}</Message>}
              <button type="submit" disabled={review.loading} className="btn-primary">
                {review.loading && <Spinner />} Submit review
              </button>
            </form>
          )}
        </div>
      </section>

      {/* More from the collection */}
      {related.length > 0 && (
        <section className="mt-24" aria-label="More from the collection">
          <div className="mb-10 flex items-end justify-between gap-6">
            <h2 className="font-serif text-3xl text-ink">More from the collection</h2>
            <Link to="/" className="link-arrow group shrink-0">
              View all
              <ArrowRight className="h-3.5 w-3.5 arrow-slide" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductPage;
