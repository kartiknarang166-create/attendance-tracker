import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage({
          type: 'success',
          text: 'Success! Check your email for a confirmation link.',
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // Upon successful login, the session state in App.jsx will automatically update
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ fontFamily: 'var(--font-body)' }}>
      <div className="w-full max-w-md auth-card animate-pop-in">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="animate-float inline-block mb-4">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl" style={{ background: 'var(--yellow)', border: '3px solid var(--border)' }}>
              📚
            </div>
          </div>
          <h1 className="text-3xl font-bold title-shadow mb-2">
            {isSignUp ? 'Join the Club!' : 'Welcome Back!'}
          </h1>
          <p style={{ color: '#64748B', fontWeight: 600 }}>
            {isSignUp ? 'Create an account to start tracking' : 'Sign in to your attendance tracker'}
          </p>
        </div>

        {/* Messages */}
        {message.text && (
          <div 
            className="mb-6 animate-pop-in"
            style={{ 
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              border: '2.5px solid var(--border)',
              background: message.type === 'error' ? '#FEE2E2' : '#DCFCE7',
              color: message.type === 'error' ? 'var(--red-dark)' : 'var(--green-dark)',
              fontWeight: 700,
              fontSize: '0.875rem',
              fontFamily: 'var(--font-heading)'
            }}
          >
            {message.type === 'error' ? '⚠️ ' : '✅ '}{message.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label 
              className="block mb-1.5" 
              htmlFor="email"
              style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.9rem', color: '#475569' }}
            >
              📧 Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-notebook"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label 
              className="block mb-1.5" 
              htmlFor="password"
              style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.9rem', color: '#475569' }}
            >
              🔒 Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-notebook"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-pill btn-blue w-full justify-center"
            style={{ padding: '0.85rem', fontSize: '1rem' }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="spinner-notebook" style={{ width: 20, height: 20, borderWidth: 3 }}></div>
                Processing...
              </span>
            ) : isSignUp ? '🚀 Sign Up' : '✨ Sign In'}
          </button>
        </form>

        {/* Toggle */}
        <div className="mt-6 text-center">
          <p style={{ color: '#64748B', fontWeight: 600, fontSize: '0.9rem' }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setMessage({ type: '', text: '' });
              }}
              style={{ 
                marginLeft: '0.5rem',
                color: 'var(--blue)',
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
                textUnderlineOffset: '3px'
              }}
            >
              {isSignUp ? 'Sign in instead' : 'Sign up now'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Auth;
