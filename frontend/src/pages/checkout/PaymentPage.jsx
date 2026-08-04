import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CreditCard, DollarSign, HandCoins } from 'lucide-react';
import { savePaymentMethod } from '../../store/slices/cartSlice';
import { PAYMENT_METHODS } from '../../constants';
import CheckoutSteps from '../../components/cart/CheckoutSteps';
import FormContainer from '../../components/ui/FormContainer';
import Meta from '../../components/ui/Meta';

const icons = { Stripe: CreditCard, PayPal: DollarSign, COD: HandCoins };

const PaymentPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const paymentMethod = useSelector((s) => s.cart.paymentMethod);
  const [selected, setSelected] = useState(paymentMethod || 'COD');

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(savePaymentMethod(selected));
    navigate('/placeorder');
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6">
      <Meta title="Payment" />
      <CheckoutSteps current="Payment" />
      <FormContainer>
        <p className="kicker mb-4">Step two</p>
        <h1 className="font-serif text-4xl text-ink md:text-5xl">Payment method</h1>

        <form onSubmit={onSubmit} className="mt-10" noValidate>
          <div>
            {PAYMENT_METHODS.map((method) => {
              const Icon = icons[method];
              const active = selected === method;
              return (
                <label
                  key={method}
                  className={`flex cursor-pointer items-center gap-4 border-t border-line py-5 transition last:border-b ${
                    active ? 'bg-surface-2' : 'hover:bg-surface-2/50'
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                      active ? 'border-ink' : 'border-line'
                    }`}
                    aria-hidden="true"
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full bg-ink transition ${
                        active ? 'scale-100' : 'scale-0'
                      }`}
                    />
                  </span>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={active}
                    onChange={() => setSelected(method)}
                    className="sr-only"
                  />
                  <Icon className="h-5 w-5 text-ink" aria-hidden="true" />
                  <span className="font-serif text-lg text-ink">{method}</span>
                  <span className="ml-auto text-xs uppercase tracking-[0.18em] text-faint">
                    {method === 'COD' ? 'Pay on delivery' : 'Pay securely online'}
                  </span>
                </label>
              );
            })}
          </div>

          <button type="submit" className="btn-primary mt-10 w-full">
            Continue to review
            <ArrowRight className="h-3.5 w-3.5 arrow-slide" aria-hidden="true" />
          </button>
        </form>
      </FormContainer>
    </div>
  );
};

export default PaymentPage;
