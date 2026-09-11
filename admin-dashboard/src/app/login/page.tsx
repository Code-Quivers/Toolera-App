'use client';

import { useState } from 'react';
import { TextInput } from '@mantine/core';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '48px 40px', boxShadow: '0 8px 40px rgba(0,0,0,0.06)' }}>

        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <img src="/logo.png" alt="Toolera" style={{ height: '32px', width: 'auto' }} />
        </div>

        <form onSubmit={(e) => { e.preventDefault(); window.location.href = '/'; }}>
          {/* Email */}
          <div style={{ marginBottom: '20px' }}>
            <TextInput
              label="Email"
              placeholder="admin@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="username"
              leftSection={
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#0e9b6d' }}>mail</span>
              }
              styles={{
                label: { fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#3d4a42', marginBottom: '6px' },
                input: {
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  color: '#0b1c30',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  '--input-placeholder-color': '#94a3b8',
                } as React.CSSProperties,
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#3d4a42', marginBottom: '6px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: '#6d7a72', pointerEvents: 'none' }}>lock</span>
              <input
                className="login-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ padding: '10px 14px 10px 38px' }}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            style={{ width: '100%', padding: '11px', borderRadius: '8px', background: '#006948', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, letterSpacing: '0.05em', border: 'none', cursor: 'pointer' }}
          >
            Login as Admin
          </button>
        </form>

        <style>{`
          .login-input { width: 100%; border-radius: 8px; border: 1px solid #e2e8f0 !important; font-family: Inter, sans-serif; font-size: 14px; color: #0b1c30 !important; outline: none; box-sizing: border-box; background: #fff !important; box-shadow: none !important; }
          .login-input::placeholder { color: #94a3b8; opacity: 1; }
          .login-input:focus { border-color: #0e9b6d !important; box-shadow: 0 0 0 3px rgba(14,155,109,0.15) !important; }
        `}</style>
      </div>
    </div>
  );
}
