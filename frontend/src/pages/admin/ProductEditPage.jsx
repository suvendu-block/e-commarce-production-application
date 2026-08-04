import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { ArrowLeft, ImagePlus } from 'lucide-react';
import {
  getProductDetails,
  createProduct,
  updateProduct,
  resetCreate,
  resetUpdate,
} from '../../store/slices/productSlice';
import { upload, resetUpload } from '../../store/slices/uploadSlice';
import { CATEGORIES } from '../../constants';
import Loader, { Spinner } from '../../components/ui/Loader';
import Message from '../../components/ui/Message';
import Meta from '../../components/ui/Meta';

const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  price: z.coerce.number().positive('Price must be greater than 0'),
  brand: z.string().max(50).optional().or(z.literal('')),
  category: z.string().max(50).optional().or(z.literal('')),
  countInStock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  description: z.string().max(2000).optional().or(z.literal('')),
  image: z.string().optional().or(z.literal('')),
});

// Create & edit are the same form — presence of :id switches modes
const ProductEditPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id;

  const detail = useSelector((s) => s.product.detail);
  const create = useSelector((s) => s.product.create);
  const update = useSelector((s) => s.product.update);
  const uploadState = useSelector((s) => s.upload);

  const fileRef = useRef(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm({ resolver: zodResolver(productSchema) });

  const imageValue = useWatch({ control, name: 'image' }) || '';
  const preview = imageValue;

  useEffect(() => {
    if (!isNew && id) dispatch(getProductDetails(id));
  }, [dispatch, id, isNew]);

  // Seed the form from the fetched product
  useEffect(() => {
    if (detail.product && !isNew) {
      setValue('name', detail.product.name);
      setValue('price', detail.product.price);
      setValue('brand', detail.product.brand || '');
      setValue('category', detail.product.category || '');
      setValue('countInStock', detail.product.countInStock);
      setValue('description', detail.product.description || '');
      setValue('image', detail.product.image || '');
    }
  }, [detail.product, isNew, setValue]);

  useEffect(() => {
    if (uploadState.url) {
      setValue('image', uploadState.url);
      toast.success('Image uploaded');
    }
  }, [uploadState.url, setValue]);

  useEffect(() => {
    if (create.success && create.product) {
      toast.success('Product created');
      dispatch(resetCreate());
      navigate(`/admin/product/${create.product._id}/edit`);
    }
    if (update.success) {
      toast.success('Product saved');
      dispatch(resetUpdate());
    }
  }, [create.success, create.product, update.success, dispatch, navigate]);

  useEffect(
    () => () => {
      dispatch(resetUpload());
    },
    [dispatch]
  );

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    dispatch(upload(file));
    e.target.value = '';
  };

  const onSubmit = (data) => {
    const payload = {
      name: data.name,
      price: data.price,
      brand: data.brand || '',
      category: data.category || '',
      countInStock: data.countInStock ?? 0,
      description: data.description || '',
      image: data.image || '',
    };
    if (isNew) {
      dispatch(createProduct(payload));
    } else {
      dispatch(updateProduct({ id, data: payload }));
    }
  };

  const submitting = create.loading || update.loading;

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <Meta title={isNew ? 'New Product' : 'Edit Product'} />

      <Link to="/admin/products" className="link-arrow group mb-8 text-faint hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back to products
      </Link>

      <p className="kicker mb-4">Administration</p>
      <h1 className="mb-8 font-serif text-4xl text-ink md:text-5xl">
        <em>{isNew ? 'New product' : 'Edit product'}</em>
      </h1>

      {isNew ? null : detail.loading ? (
        <Loader label="Loading product…" />
      ) : detail.error ? (
        <Message variant="error">{detail.error}</Message>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="border border-line p-8 space-y-6" noValidate>
          {/* Image */}
          <div>
            <span className="label">Image</span>
            <div className="flex items-start gap-4">
              <div className="h-28 w-28 shrink-0 overflow-hidden border border-line bg-surface-2">
                {preview ? (
                  <img src={preview} alt="Product preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-faint">
                    <ImagePlus className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={onFileChange} className="hidden" id="image-upload" />
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploadState.loading} className="btn-outline">
                  {uploadState.loading && <Spinner />} {preview ? 'Replace image' : 'Upload image'}
                </button>
                <input type="hidden" {...register('image')} />
                {uploadState.error && <Message variant="error">{uploadState.error}</Message>}
                <p className="text-xs text-faint">JPEG, PNG, WebP or GIF · max 5 MB</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="label">Name *</label>
              <input id="name" type="text" className="input" placeholder="iPhone 15 Pro" {...register('name')} />
              {errors.name && <p className="field-error">{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="price" className="label">Price (USD) *</label>
              <input id="price" type="number" step="0.01" min="0" className="input" placeholder="999.00" {...register('price')} />
              {errors.price && <p className="field-error">{errors.price.message}</p>}
            </div>
            <div>
              <label htmlFor="brand" className="label">Brand</label>
              <input id="brand" type="text" className="input" placeholder="Apple" {...register('brand')} />
              {errors.brand && <p className="field-error">{errors.brand.message}</p>}
            </div>
            <div>
              <label htmlFor="category" className="label">Category</label>
              <select id="category" className="input" {...register('category')}>
                <option value="">Select category…</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.category && <p className="field-error">{errors.category.message}</p>}
            </div>
            <div>
              <label htmlFor="countInStock" className="label">Count in stock</label>
              <input id="countInStock" type="number" min="0" className="input" placeholder="20" {...register('countInStock')} />
              {errors.countInStock && <p className="field-error">{errors.countInStock.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="label">Description</label>
            <textarea id="description" rows="5" className="input resize-none" placeholder="Describe the product…" {...register('description')} />
            {errors.description && <p className="field-error">{errors.description.message}</p>}
          </div>

          {!isNew && imageValue === '' && !preview && (
            <Message variant="info">No image set — the storefront will show a placeholder.</Message>
          )}

          {create.error && <Message variant="error">{create.error}</Message>}
          {update.error && <Message variant="error">{update.error}</Message>}

          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting && <Spinner />} {isNew ? 'Create product' : 'Save changes'}
            </button>
            <Link to="/admin/products" className="btn-outline">
              Cancel
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProductEditPage;
