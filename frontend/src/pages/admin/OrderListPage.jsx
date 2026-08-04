import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { listOrders } from '../../store/slices/orderSlice';
import OrderTable from '../../components/admin/OrderTable';
import Loader from '../../components/ui/Loader';
import Message from '../../components/ui/Message';
import Meta from '../../components/ui/Meta';

const OrderListPage = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((s) => s.order.list);

  useEffect(() => {
    dispatch(listOrders());
  }, [dispatch]);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6">
      <Meta title="Admin — Orders" />

      <div className="mb-10">
        <p className="kicker mb-4">Administration</p>
        <h1 className="font-serif text-4xl text-ink md:text-5xl">
          <em>Orders</em>
        </h1>
      </div>

      {error && <Message variant="error" className="mb-4">{error}</Message>}

      {loading ? (
        <Loader label="Loading orders…" />
      ) : orders.length === 0 ? (
        <Message variant="info">No orders yet — they will appear here once customers check out.</Message>
      ) : (
        <div className="border border-line">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-line text-[11px] uppercase tracking-[0.18em] text-faint">
                <th className="py-3 font-semibold">ID</th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell">User</th>
                <th className="hidden px-4 py-3 font-semibold md:table-cell">Date</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Paid</th>
                <th className="px-4 py-3 font-semibold">Delivered</th>
                <th className="px-4 py-3 text-right font-semibold">View</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <OrderTable key={order._id} order={order} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderListPage;
