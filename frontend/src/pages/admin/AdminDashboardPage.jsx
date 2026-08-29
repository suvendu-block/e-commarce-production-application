import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ArrowRight, Package, ShoppingCart, Users, CircleDollarSign, Truck, Clock } from 'lucide-react';
import { listProducts } from '../../store/slices/productSlice';
import { listOrders } from '../../store/slices/orderSlice';
import { listUsers } from '../../store/slices/userSlice';
import { formatPrice, formatDate } from '../../utils/helpers';
import Loader from '../../components/ui/Loader';
import Message from '../../components/ui/Message';
import Meta from '../../components/ui/Meta';

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div className="border border-line p-6">
    <div className="flex items-center gap-3">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center ${accent ? 'bg-accent text-paper' : 'bg-surface-2 text-ink'}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div> 
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">{label}</p>
        <p className="font-serif text-2xl text-ink">{value}</p>
      </div>
    </div>
  </div>
);

const AdminDashboardPage = () => {
  const dispatch = useDispatch();

  const { products, loading: productsLoading } = useSelector((s) => s.product.list);
  const { orders, loading: ordersLoading } = useSelector((s) => s.order.list);
  const { users, loading: usersLoading } = useSelector((s) => s.user.list);

  useEffect(() => {
    dispatch(listProducts({ page: 1, pageSize: 100 }));
    dispatch(listOrders());
    dispatch(listUsers());
  }, [dispatch]);

  const loading = productsLoading || ordersLoading || usersLoading;
  const error = productsLoading ? null : ordersLoading ? null : usersLoading ? null : null;

  if (loading) return <Loader label="Loading dashboard" className="py-24" />;

  const totalProducts = products.length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => !o.isPaid).length;
  const deliveredOrders = orders.filter((o) => o.isDelivered).length;
  const totalUsers = users.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  const recentOrders = [...orders].slice(0, 5);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6">
      <Meta title="Admin Dashboard" />

      <div className="mb-10">
        <p className="kicker mb-4">Administration</p>
        <h1 className="font-serif text-4xl text-ink md:text-5xl">
          <em>Dashboard</em>
        </h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={ShoppingCart} label="Total Orders" value={totalOrders} accent />
        <StatCard icon={Clock} label="Pending Payment" value={pendingOrders} />
        <StatCard icon={Truck} label="Delivered" value={deliveredOrders} />
        <StatCard icon={Package} label="Products" value={totalProducts} />
        <StatCard icon={Users} label="Users" value={totalUsers} />
        <StatCard icon={CircleDollarSign} label="Revenue" value={formatPrice(totalRevenue)} />
      </div>

      {/* Quick links */}
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          to="/admin/products"
          className="group flex items-center justify-between border border-line p-6 transition hover:border-ink"
        >
          <div>
            <p className="font-serif text-xl text-ink">Products</p>
            <p className="mt-1 text-xs text-muted">{totalProducts} in catalog</p>
          </div>
          <ArrowRight className="h-4 w-4 text-faint transition group-hover:translate-x-1 group-hover:text-ink" />
        </Link>
        <Link
          to="/admin/orders"
          className="group flex items-center justify-between border border-line p-6 transition hover:border-ink"
        >
          <div>
            <p className="font-serif text-xl text-ink">Orders</p>
            <p className="mt-1 text-xs text-muted">{pendingOrders} pending</p>
          </div>
          <ArrowRight className="h-4 w-4 text-faint transition group-hover:translate-x-1 group-hover:text-ink" />
        </Link>
        <Link
          to="/admin/users"
          className="group flex items-center justify-between border border-line p-6 transition hover:border-ink"
        >
          <div>
            <p className="font-serif text-xl text-ink">Users</p>
            <p className="mt-1 text-xs text-muted">{totalUsers} registered</p>
          </div>
          <ArrowRight className="h-4 w-4 text-faint transition group-hover:translate-x-1 group-hover:text-ink" />
        </Link>
      </div>

      {/* Recent orders */}
      <div className="mt-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="font-serif text-2xl text-ink">Recent orders</h2>
          <Link to="/admin/orders" className="link-arrow group shrink-0">
            View all
            <ArrowRight className="h-3.5 w-3.5 arrow-slide" aria-hidden="true" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <Message variant="info">No orders yet.</Message>
        ) : (
          <div className="border border-line">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-line text-[11px] uppercase tracking-[0.18em] text-faint">
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="hidden px-4 py-3 font-semibold sm:table-cell">Date</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Paid</th>
                  <th className="px-4 py-3 font-semibold">Delivered</th>
                  <th className="px-4 py-3 text-right font-semibold">View</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id} className="border-b border-line last:border-0 transition hover:bg-ink/[0.025]">
                    <td className="px-4 py-3 text-xs text-muted">{order._id}</td>
                    <td className="hidden px-4 py-3 text-sm text-muted sm:table-cell">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-serif text-lg italic text-ink">
                      {formatPrice(order.totalPrice)}
                    </td>
                    <td className="px-4 py-3">
                      {order.isPaid ? (
                        <span className="badge-success">Paid</span>
                      ) : (
                        <span className="badge-warn">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {order.isDelivered ? (
                        <span className="badge-success">Delivered</span>
                      ) : (
                        <span className="badge-muted">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/admin/order/${order._id}`} className="link-arrow group justify-end">
                        Details
                        <ArrowRight className="h-3 w-3 arrow-slide" aria-hidden="true" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
