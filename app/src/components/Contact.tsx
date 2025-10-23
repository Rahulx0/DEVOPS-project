import React from 'react';
import { AppView } from '../lib/types';
import { CheckCircleIcon } from '../constants';
import { Button } from './ui/Button';

interface SuccessViewProps {
  setView: (view: AppView) => void;
}

const SuccessView: React.FC<SuccessViewProps> = ({ setView }) => {
  return (
    <section className="py-16 bg-background min-h-[calc(100vh-80px)] flex items-center justify-center">
      <div className="container mx-auto px-6 text-center">
        <div className="bg-white p-12 rounded-lg max-w-2xl mx-auto border border-gray-200">
          <CheckCircleIcon className="w-24 h-24 text-secondary mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4 text-primary">Payment Successful!</h2>
          <p className="text-text-light text-lg mb-8">
            Thank you for your purchase. Your order is being processed and you will receive a confirmation email shortly.
          </p>
          <Button size="lg" onClick={() => setView({type: 'home'})}>
            Continue Shopping
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SuccessView;