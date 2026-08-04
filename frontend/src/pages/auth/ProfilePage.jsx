import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { ArrowRight } from 'lucide-react';
import { fetchProfile, updateProfile } from '../../store/slices/authSlice';
import { getMyOrders } from '../../store/slices/orderSlice';
import { formatDate, formatPrice } from '../../utils/helpers';
import Message from '../../components/ui/Message';
import { Spinner } from '../../components/ui/Loader';
import Meta from '../../components/ui/Meta';

const profileSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50),
    email: z.string().email('Enter a valid email address'),
    password: z.string().optional().or(z.literal('')),
    confirmPassword: z.string().optional().or(z.literal('')),
  })
  .refine((data) => !data.password || data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((s) => s.auth);
  const { orders, loading: ordersLoading, error: ordersError } = useSelector((s) => s.order.myList);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(profileSchema), values: { name: user?.name || '', email: user?.email || '' } });

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(getMyOrders());
  }, [dispatch]);

  const onSubmit = async ({ name, email, password }) => {
    const result = await dispatch(updateProfile({ name, email, password: password || undefined }));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Profile updated');
      reset({ name, email, password: '', confirmPassword: '' });
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6">
      <Meta title="My Profile" />
      <p className="kicker mb-4">Account</p>
      <h1 className="font-serif text-4xl text-ink md:text-5xl">
        My <em>profile</em>
      </h1>

      <div className="mt-10 grid grid-cols-1 gap-14 lg:grid-cols-2">
        {/* Update form */}
        <section>
          <div className="flex items-baseline justify-between border-b border-line pb-3">
            <h2 className="font-serif text-2xl text-ink">Account details</h2>
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-faint">Edit</span>
          </div>
          {error && <Message variant="error" className="mt-6">{error}</Message>}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-7" noValidate>
            <div>
              <label htmlFor="name" className="label">Name</label>
              <input id="name" type="text" autoComplete="name" className="input" {...register('name')} />
              {errors.name && <p className="field-error">{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input id="email" type="email" autoComplete="email" className="input" {...register('email')} />
              {errors.email && <p className="field-error">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="password" className="label">
                New password <span className="font-normal text-faint">(optional)</span>
              </label>
              <input id="password" type="password" autoComplete="new-password" className="input" placeholder="Leave blank to keep current" {...register('password')} />
              {errors.password && <p className="field-error">{errors.password.message}</p>}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="label">Confirm new password</label>
              <input id="confirmPassword" type="password" autoComplete="new-password" className="input" placeholder="Repeat new password" {...register('confirmPassword')} />
              {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading && <Spinner />} Save changes
              <ArrowRight className="h-3.5 w-3.5 arrow-slide" aria-hidden="true" />
            </button>
          </form>
        </section>

        {/* Order history */}
        <section>
          <div className="flex items-baseline justify-between border-b border-line pb-3">
            <h2 className="font-serif text-2xl text-ink">My orders</h2>
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-faint">{orders.length}</span>
          </div>
          {ordersLoading ? (
            <p className="py-16 text-center text-sm text-muted">Loading orders…</p>
          ) : ordersError ? (
            <Message variant="error" className="mt-6">{ordersError}</Message>
          ) : orders.length === 0 ? (
            <div className="mt-10 border border-line p-8">
              <p className="font-serif text-xl italic text-ink">Nothing here yet.</p>
              <p className="mt-2 text-sm text-muted">Your orders will appear here once you place one.</p>
              <Link to="/" className="link-arrow group mt-5">
                Start shopping
                <ArrowRight className="h-3.5 w-3.5 arrow-slide" aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <div className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-[11px] uppercase tracking-[0.18em] text-faint">
                    <th className="py-3 pr-4 font-semibold">ID</th>
                    <th className="py-3 pr-4 font-semibold">Date</th>
                    <th className="py-3 pr-4 font-semibold">Total</th>
                    <th className="py-3 pr-4 font-semibold">Paid</th>
                    <th className="py-3 pr-4 font-semibold">Delivered</th>
                    <th className="py-3" />
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} className="border-b border-line last:border-0">
                      <td className="py-4 pr-4 text-xs text-muted">{order._id}</td>
                      <td className="py-4 pr-4 text-muted">{formatDate(order.createdAt)}</td>
                      <td className="py-4 pr-4 font-serif text-base italic">{formatPrice(order.totalPrice)}</td>
                      <td className="py-4 pr-4">
                        {order.isPaid ? (
                          <span className="badge-success">Paid</span>
                        ) : (
                          <span className="badge-warn">Pending</span>
                        )}
                      </td>
                      <td className="py-4 pr-4">
                        {order.isDelivered ? (
                          <span className="badge-success">Delivered</span>
                        ) : (
                          <span className="badge-muted">Pending</span>
                        )}
                      </td>
                      <td className="py-4 text-right">
                        <Link to={`/order/${order._id}`} className="link-arrow group justify-end">
                          View
                          <ArrowRight className="h-3 w-3 arrow-slide" aria-hidden="true" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
