import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { listUsers, updateUser, resetUpdate } from '../../store/slices/userSlice';
import { Spinner } from '../../components/ui/Loader';
import Message from '../../components/ui/Message';
import Meta from '../../components/ui/Meta';

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Enter a valid email address'),
  isAdmin: z.boolean(),
});

const UserEditPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { users, loading, error } = useSelector((s) => s.user.list);
  const update = useSelector((s) => s.user.update);

  const target = users.find((u) => u._id === id);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(userSchema) });

  useEffect(() => {
    dispatch(listUsers());
  }, [dispatch]);

  // Seed the form when the user arrives from the list fetch
  useEffect(() => {
    if (target) {
      setValue('name', target.name);
      setValue('email', target.email);
      setValue('isAdmin', target.isAdmin);
    }
  }, [target, setValue]);

  useEffect(() => {
    if (update.success) {
      toast.success('User updated');
      dispatch(resetUpdate());
      navigate('/admin/users');
    }
  }, [update.success, dispatch, navigate]);

  const onSubmit = (data) => {
    dispatch(updateUser({ id, data }));
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-14 sm:px-6">
      <Meta title="Edit User" />

      <Link to="/admin/users" className="link-arrow group mb-8 text-faint hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back to users
      </Link>

      <p className="kicker mb-4">Administration</p>
      <h1 className="mb-8 font-serif text-4xl text-ink md:text-5xl">
        <em>Edit user</em>
      </h1>

      {loading ? (
        <Spinner className="mx-auto my-16 h-8 w-8 text-accent" />
      ) : error ? (
        <Message variant="error">{error}</Message>
      ) : !target ? (
        <Message variant="error">User not found</Message>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="border border-line space-y-6 p-8" noValidate>
          <div>
            <label htmlFor="name" className="label">Name</label>
            <input id="name" type="text" className="input" {...register('name')} />
            {errors.name && <p className="field-error">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input id="email" type="email" className="input" {...register('email')} />
            {errors.email && <p className="field-error">{errors.email.message}</p>}
          </div>
          <label className="flex cursor-pointer items-center justify-between border border-line p-5 transition hover:border-faint">
            <span>
              <span className="block font-semibold">Admin privileges</span>
              <span className="text-sm text-muted">Can manage products, orders and users</span>
            </span>
            <input type="checkbox" className="h-5 w-5 accent-[rgb(var(--accent))]" {...register('isAdmin')} />
          </label>

          {update.error && <Message variant="error">{update.error}</Message>}

          <div className="flex gap-3">
            <button type="submit" disabled={update.loading} className="btn-primary flex-1">
              {update.loading && <Spinner />} Save changes
            </button>
            <Link to="/admin/users" className="btn-outline">Cancel</Link>
          </div>
        </form>
      )}
    </div>
  );
};

export default UserEditPage;
