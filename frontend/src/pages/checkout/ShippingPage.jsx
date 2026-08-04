import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight } from 'lucide-react';
import { saveShippingAddress } from '../../store/slices/cartSlice';
import CheckoutSteps from '../../components/cart/CheckoutSteps';
import FormContainer from '../../components/ui/FormContainer';
import Meta from '../../components/ui/Meta';

const shippingSchema = z.object({
  address: z.string().min(3, 'Address is required').max(200),
  city: z.string().min(2, 'City is required').max(50),
  postalCode: z.string().min(2, 'Postal code is required').max(20),
  country: z.string().min(2, 'Country is required').max(50),
});

const ShippingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const shippingAddress = useSelector((s) => s.cart.shippingAddress);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(shippingSchema),
    values: shippingAddress || undefined,
  });

  const onSubmit = (data) => {
    dispatch(saveShippingAddress(data));
    navigate('/payment');
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6">
      <Meta title="Shipping" />
      <CheckoutSteps current="Shipping" />
      <FormContainer>
        <p className="kicker mb-4">Step one</p>
        <h1 className="font-serif text-4xl text-ink md:text-5xl">Shipping address</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-7" noValidate>
          <div>
            <label htmlFor="address" className="label">Street address</label>
            <input id="address" type="text" autoComplete="street-address" className="input" placeholder="123 Main St" {...register('address')} />
            {errors.address && <p className="field-error">{errors.address.message}</p>}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="city" className="label">City</label>
              <input id="city" type="text" autoComplete="address-level2" className="input" placeholder="Springfield" {...register('city')} />
              {errors.city && <p className="field-error">{errors.city.message}</p>}
            </div>
            <div>
              <label htmlFor="postalCode" className="label">Postal code</label>
              <input id="postalCode" type="text" autoComplete="postal-code" className="input" placeholder="12345" {...register('postalCode')} />
              {errors.postalCode && <p className="field-error">{errors.postalCode.message}</p>}
            </div>
            <div>
              <label htmlFor="country" className="label">Country</label>
              <input id="country" type="text" autoComplete="country-name" className="input" placeholder="USA" {...register('country')} />
              {errors.country && <p className="field-error">{errors.country.message}</p>}
            </div>
          </div>
          <button type="submit" className="btn-primary w-full">
            Continue to payment
            <ArrowRight className="h-3.5 w-3.5 arrow-slide" aria-hidden="true" />
          </button>
        </form>
      </FormContainer>
    </div>
  );
};

export default ShippingPage;
