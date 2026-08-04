import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { listProducts, deleteProduct, resetRemove, resetUpdate } from '../../store/slices/productSlice';
import { PAGE_SIZE } from '../../constants';
import ProductTable from '../../components/admin/ProductTable';
import Loader from '../../components/ui/Loader';
import Message from '../../components/ui/Message';
import Meta from '../../components/ui/Meta';

const ProductListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { products, pages, loading, error } = useSelector((s) => s.product.list);
  const remove = useSelector((s) => s.product.remove);
  const update = useSelector((s) => s.product.update);

  useEffect(() => {
    dispatch(listProducts({ page, pageSize: PAGE_SIZE }));
  }, [dispatch, page]);

  useEffect(() => {
    if (remove.success) {
      toast.success('Product deleted');
      dispatch(listProducts({ page, pageSize: PAGE_SIZE }));
      dispatch(resetRemove());
    }
  }, [remove.success, dispatch, page]);

  useEffect(() => {
    if (update.success) {
      dispatch(resetUpdate());
    }
  }, [update.success, dispatch]);

  const onDelete = (product) => {
    if (window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
      dispatch(deleteProduct(product._id));
    }
  };

  const onNew = async () => {
    navigate('/admin/product/new');
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6">
      <Meta title="Admin — Products" />

      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker mb-4">Administration</p>
          <h1 className="font-serif text-4xl text-ink md:text-5xl">
            <em>Products</em>
          </h1>
        </div>
        <button type="button" onClick={onNew} className="btn-primary">
          <Plus className="h-4 w-4" /> New product
        </button>
      </div>

      {remove.error && <Message variant="error" className="mb-4">{remove.error}</Message>}
      {error && <Message variant="error" className="mb-4">{error}</Message>}

      {loading ? (
        <Loader label="Loading products…" />
      ) : products.length === 0 ? (
        <Message variant="info">No products yet — create your first one.</Message>
      ) : (
        <>
          <div className="border border-line">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-line text-[11px] uppercase tracking-[0.18em] text-faint">
                  <th className="py-3 font-semibold">Image</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="hidden px-4 py-3 font-semibold sm:table-cell">Category</th>
                  <th className="hidden px-4 py-3 font-semibold md:table-cell">Stock</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <ProductTable key={product._id} product={product} onDelete={onDelete} deleting={remove.loading} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <nav className="mt-6 flex items-center justify-center gap-1.5" aria-label="Pagination">
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  aria-current={n === page ? 'page' : undefined}
                  className={`btn !px-4 ${n === page ? 'bg-accent text-white' : 'btn-outline'}`}
                >
                  {n}
                </button>
              ))}
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default ProductListPage;
