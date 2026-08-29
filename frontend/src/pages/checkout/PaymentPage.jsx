import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, HandCoins } from 'lucide-react';
import { savePaymentMethod } from '../../store/slices/cartSlice';
import CheckoutSteps from '../../components/cart/CheckoutSteps';
import FormContainer from '../../components/ui/FormContainer';
import Meta from '../../components/ui/Meta';

const PaymentPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // COD is the only payment method — auto-select and continue
  useEffect(() => {
    dispatch(savePaymentMethod('COD'));
  }, [dispatch]);

  const onContinue = () => navigate('/placeorder');

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6">
      <Meta title="Payment" />
      <CheckoutSteps current="Payment" />
      <FormContainer>
        <p className="kicker mb-4">Step two</p>
        <h1 className="font-serif text-4xl text-ink md:text-5xl">Payment method</h1>

        <div className="mt-10 border-t border-line py-6">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center border border-ink bg-surface-2">
              <HandCoins className="h-5 w-5 text-ink" aria-hidden="true" />
            </span>
            <div>
              <span className="font-serif text-lg text-ink">Cash on Delivery</span>
              <p className="mt-0.5 text-xs uppercase tracking-[0.18em] text-faint">
                Pay when your order arrives
              </p>
            </div>
          </div>
        </div>

        <button type="button" onClick={onContinue} className="btn-primary mt-10 w-full">
          Continue to review
          <ArrowRight className="h-3.5 w-3.5 arrow-slide" aria-hidden="true" />
        </button>
      </FormContainer>
    </div>
  );
};

export default PaymentPage;
