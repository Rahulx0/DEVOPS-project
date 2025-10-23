import React from 'react';
import { useCart } from '../hooks/useCart';
import { AppView } from '../lib/types';
import CheckoutSummary from './TeamCard'; // Repurposed as CheckoutSummary
import { CreditCardIcon } from '../constants';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface CheckoutViewProps {
  setView: (view: AppView) => void;
}

const CheckoutView: React.FC<CheckoutViewProps> = ({ setView }) => {
  const { totalPrice, clearCart, cartItems } = useCart();

  const handlePayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (cartItems.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    const formData = new FormData(e.currentTarget);
    const name = formData.get('fullName') as string;
    const email = formData.get('email') as string;

    const options = {
      key: 'rzp_test_1DPvlsxVqlfD9I', // Use a public test key
      amount: totalPrice * 100, // Amount in the smallest currency unit (paise for INR)
      currency: "INR",
      name: "UrbanGear",
      description: "Test Transaction",
      image: "/favicon.svg",
      handler: function (response: any) {
        clearCart();
        setView({ type: 'success' });
      },
      prefill: {
        name: name || "Test User",
        email: email || "test.user@example.com",
        contact: "9999999999",
      },
      notes: {
        address: "UrbanGear Corporate Office",
      },
      theme: {
        color: "#2c3e50",
      },
    };
    
    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  return (
    <section className="py-16 bg-background min-h-[calc(100vh-80px)]">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-heading font-bold mb-8 text-center text-primary">Checkout</h2>
        <form onSubmit={handlePayment} className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="lg:col-span-2 bg-white p-8 rounded-lg border border-gray-200">
            <h3 className="text-2xl font-heading font-bold mb-6 text-primary">Shipping Information</h3>
            <div className="space-y-4">
              <Input name="fullName" type="text" placeholder="Full Name" defaultValue="Test User" required />
              <Input name="email" type="email" placeholder="Email Address" defaultValue="test.user@example.com" required />
              <Input name="address" type="text" placeholder="Address" required />
              <div className="flex flex-col sm:flex-row gap-4">
                <Input name="city" type="text" placeholder="City" required />
                <Input name="pincode" type="text" placeholder="Pincode" required pattern="\\d{6}" title="Enter a valid 6-digit pincode" />
              </div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-lg border border-gray-200 self-start">
             <CheckoutSummary />
            <Button
              type="submit"
              className="w-full mt-6"
              size="lg"
              disabled={cartItems.length === 0}
            >
              <CreditCardIcon className="w-6 h-6"/>
              Pay ₹{totalPrice.toLocaleString()}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default CheckoutView;