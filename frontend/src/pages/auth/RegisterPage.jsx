import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { register, clearError } from '../../store/slices/authSlice';
import FormContainer from '../../components/ui/FormContainer';
import Message from '../../components/ui/Message';
import { Spinner } from '../../components/ui/Loader';
import Meta from '../../components/ui/Meta';

// Mirrors the backend Joi rules: name ≥2, valid email, password ≥6
const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) });

  useEffect(() => () => dispatch(clearError()), [dispatch]);

  const onSubmit = async ({ name, email, password }) => {
    const result = await dispatch(register({ name, email, password }));
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/');
    }
  };

  return (
    <FormContainer>
      <Meta title="Create Account" />
      <p className="kicker mb-4">Join</p>
      <h1 className="font-serif text-4xl text-ink md:text-5xl">
        Create your <em>account</em>
      </h1>
      <p className="mt-3 text-sm text-muted">Join Nordstroma — takes less than a minute.</p>

      {error && <Message variant="error" className="mt-8">{error}</Message>}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-7" noValidate>
        <div>
          <label htmlFor="name" className="label">Name</label>
          <input id="name" type="text" autoComplete="name" className="input" placeholder="Jane Doe" {...registerField('name')} />
          {errors.name && <p className="field-error">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" type="email" autoComplete="email" className="input" placeholder="you@example.com" {...registerField('email')} />
          {errors.email && <p className="field-error">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="password" className="label">Password</label>
          <input id="password" type="password" autoComplete="new-password" className="input" placeholder="At least 6 characters" {...registerField('password')} />
          {errors.password && <p className="field-error">{errors.password.message}</p>}
        </div>
        <div>
          <label htmlFor="confirmPassword" className="label">Confirm password</label>
          <input id="confirmPassword" type="password" autoComplete="new-password" className="input" placeholder="Repeat your password" {...registerField('confirmPassword')} />
          {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading && <Spinner />} Create account
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold underline underline-offset-4 transition hover:text-ink">
          Sign in
        </Link>
      </p>
    </FormContainer>
  );
};

export default RegisterPage;
