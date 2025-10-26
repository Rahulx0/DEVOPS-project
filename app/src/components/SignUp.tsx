import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/useToast';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

const SignUp = ({ setView }: { setView: (view: any) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      showToast(error.message, { type: 'error' });
      setLoading(false);
      return;
    }

    // Optionally store a profile row for the user if a 'profiles' table exists (id UUID primary key)
    try {
      if (data.user) {
        await supabase.from('profiles').insert({ id: data.user.id, email });
      }
    } catch (e) {
      // Ignore if table or RLS policy isn't set up; auth still succeeded
      console.warn('Skipping profile insert:', e);
    }

    showToast('Check your email for the confirmation link!', { type: 'success' });
    setView({ name: 'login' });
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create a new account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <Input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating account...' : 'Sign up'}
            </Button>
          </div>
        </form>
        <div className="text-sm text-center">
          <a href="#" onClick={() => setView({ name: 'login' })} className="font-medium text-indigo-600 hover:text-indigo-500">
            Already have an account? Sign in
          </a>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
