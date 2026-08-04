import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight } from 'lucide-react';
import { login, clearError } from '../../store/slices/authSlice';
import FormContainer from '../../components/ui/FormContainer';
import Message from '../../components/ui/Message';
import { Spinner } from '../../components/ui/Loader';
import Meta from '../../components/ui/Meta';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((s) => s.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  useEffect(() => () => dispatch(clearError()), [dispatch]);

  const onSubmit = async ({ email, password }) => {
    const result = await dispatch(login({ email, password }));
    if (result.meta.requestStatus === 'fulfilled') {
      navigate(location.state?.from || '/');
    }
  };

  return (
    <FormContainer>
      <Meta title="Sign In" />
      <p className="kicker mb-4">Welcome</p>
      <h1 className="font-serif text-4xl text-ink md:text-5xl">
        Welcome <em>back</em>
      </h1>
      <p className="mt-3 text-sm text-muted">Sign in to continue where you left off.</p>

      {error && <Message variant="error" className="mt-8">{error}</Message>}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-7" noValidate>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" type="email" autoComplete="email" className="input" placeholder="you@example.com" {...register('email')} />
          {errors.email && <p className="field-error">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="password" className="label">Password</label>
          <input id="password" type="password" autoComplete="current-password" className="input" placeholder="••••••••" {...register('password')} />
          {errors.password && <p className="field-error">{errors.password.message}</p>}
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading && <Spinner />} Sign in
          <ArrowRight className="h-3.5 w-3.5 arrow-slide" aria-hidden="true" />
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-muted">
        New to Nordstroma?{' '}
        <Link to="/register" className="font-semibold underline underline-offset-4 transition hover:text-ink">
          Create an account
        </Link>
      </p>

      <div className="mt-8 border border-line p-5">
        <p className="kicker">Demo accounts</p>
        <dl className="mt-3 space-y-1.5 text-xs text-muted">
          <div className="flex justify-between gap-4">
            <dt>Admin</dt>
            <dd className="font-medium text-ink">admin@example.com / admin123</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Customer</dt>
            <dd className="font-medium text-ink">john@example.com / john123</dd>
          </div>
        </dl>
      </div>
    </FormContainer>
  );
};

export default LoginPage;
