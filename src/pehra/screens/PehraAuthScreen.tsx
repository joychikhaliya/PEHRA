import React, { useState } from 'react';
import { Lock, Mail, Shield, AlertCircle } from 'lucide-react';

interface PehraAuthScreenProps {
  onSuccess: () => void;
  onBackToSplash: () => void;
}

export const PehraAuthScreen: React.FC<PehraAuthScreenProps> = ({
  onSuccess,
  onBackToSplash,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('arjun.mehta@pehra.org');
  const [password, setPassword] = useState('••••••••');
  const [fullName, setFullName] = useState('Arjun Mehta');
  const [sector, setSector] = useState('Sector 4 — Bandra West');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide your registered credentials.');
      return;
    }
    setError(null);
    onSuccess();
  };

  return (
    <div className="min-h-[640px] flex flex-col justify-between p-6 bg-[#F7F7F4] text-[#1E252B]">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pt-4 mb-6">
          <button
            onClick={onBackToSplash}
            className="text-xs text-[#6B727A] hover:text-[#1E252B] transition-colors"
          >
            &larr; Back
          </button>
          <span className="text-xs font-medium text-[#6B727A]">Pehra Access</span>
        </div>

        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[#EFEFEA] border border-[#E5E5DF] flex items-center justify-center text-[#1B3B48]">
            <Shield className="w-4 h-4 stroke-[1.8px]" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-[#1E252B]">
            {isSignUp ? 'Create your account' : 'Sign in to Pehra'}
          </h2>
        </div>

        <p className="text-xs text-[#555E68] mb-6">
          {isSignUp
            ? 'Join the community vigilance and hazard reporting network.'
            : 'Access verified logs, perimeter rounds, and emergency rosters.'}
        </p>

        {/* Error notification if any */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label
                htmlFor="auth-fullname"
                className="block text-xs font-medium text-[#3A434C] mb-1.5"
              >
                Full Name
              </label>
              <input
                id="auth-fullname"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-white border border-[#D5D5CD] rounded-lg text-sm text-[#1E252B] focus:outline-none focus:border-[#1B3B48] focus:ring-1 focus:ring-[#1B3B48] transition-all"
                placeholder="e.g. Arjun Mehta"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="auth-email"
              className="block text-xs font-medium text-[#3A434C] mb-1.5"
            >
              Email Address or Officer ID
            </label>
            <input
              id="auth-email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-white border border-[#D5D5CD] rounded-lg text-sm text-[#1E252B] focus:outline-none focus:border-[#1B3B48] focus:ring-1 focus:ring-[#1B3B48] transition-all"
              placeholder="name@pehra.org or PH-8842"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="auth-password"
                className="block text-xs font-medium text-[#3A434C]"
              >
                Password
              </label>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={() => alert('Password reset instructions sent to registered officer email.')}
                  className="text-[11px] text-[#6B727A] hover:text-[#1B3B48] transition-colors"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-white border border-[#D5D5CD] rounded-lg text-sm text-[#1E252B] focus:outline-none focus:border-[#1B3B48] focus:ring-1 focus:ring-[#1B3B48] transition-all"
              placeholder="Enter your security passkey"
            />
          </div>

          {isSignUp && (
            <div>
              <label
                htmlFor="auth-sector"
                className="block text-xs font-medium text-[#3A434C] mb-1.5"
              >
                Assigned Municipal Sector / Society
              </label>
              <input
                id="auth-sector"
                type="text"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-white border border-[#D5D5CD] rounded-lg text-sm text-[#1E252B] focus:outline-none focus:border-[#1B3B48] focus:ring-1 focus:ring-[#1B3B48] transition-all"
                placeholder="e.g. Sector 4 — Bandra West"
              />
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#1B3B48] hover:bg-[#152E38] text-white text-sm font-medium rounded-lg transition-colors active:translate-y-[0.5px]"
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>

      {/* Footer toggle */}
      <div className="pt-6 border-t border-[#E5E5DF] text-center">
        <p className="text-xs text-[#6B727A]">
          {isSignUp ? 'Already have credentials?' : "Don't have an officer account yet?"}{' '}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="font-medium text-[#1B3B48] hover:underline ml-1"
          >
            {isSignUp ? 'Sign In' : 'Register Sector Lead'}
          </button>
        </p>

        <p className="text-[11px] text-[#858D95] mt-3">
          Authorized Municipal Disaster Cell Protocol · Encrypted
        </p>
      </div>
    </div>
  );
};
