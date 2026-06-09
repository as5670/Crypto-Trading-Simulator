"use client";

import { useState } from "react";
import Link from "next/link";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --obsidian: #0d0c09; --obsidian-2: #141208; --obsidian-3: #1c1a12;
    --gold: #d4af37; --gold-light: #f0d060; --gold-dim: rgba(212,175,55,0.12);
    --gold-border: rgba(212,175,55,0.25); --text-primary: #f5f0e8;
    --text-secondary: #a89878; --text-dim: #5a5040;
    --green: #22c55e; --red: #ef4444; --glass-border: rgba(255,255,255,0.07);
  }
  html, body { height: 100%; }
  .auth-root {
    min-height: 100vh; background: var(--obsidian);
    color: var(--text-primary); font-family: 'DM Sans', sans-serif;
    display: grid; grid-template-columns: 1fr 1fr;
    position: relative; overflow: hidden;
  }
  .auth-root::before {
    content: ''; position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none; z-index: 0; opacity: 0.7;
  }
  /* Left panel — brand */
  .auth-brand {
    position: relative; z-index: 1;
    display: flex; flex-direction: column;
    justify-content: space-between; padding: 48px;
    border-right: 1px solid var(--glass-border);
    background: var(--obsidian-2);
    overflow: hidden;
  }
  .brand-orb {
    position: absolute; width: 500px; height: 500px;
    top: -100px; left: -100px; border-radius: 50%;
    background: radial-gradient(circle, rgba(212,175,55,0.07), transparent 70%);
    pointer-events: none;
  }
  .brand-logo {
    font-family: 'Playfair Display', serif; font-size: 22px;
    font-weight: 700; color: var(--text-primary); position: relative; z-index: 1;
    display: flex; align-items: center; gap: 10px;
  }
  .brand-logo-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--gold); box-shadow: 0 0 10px var(--gold);
  }
  .brand-center { position: relative; z-index: 1; }
  .brand-eyebrow {
    font-family: 'DM Mono', monospace; font-size: 10px;
    letter-spacing: 0.3em; text-transform: uppercase;
    color: var(--gold); opacity: 0.7; margin-bottom: 20px;
  }
  .brand-title {
    font-family: 'Playfair Display', serif; font-size: 48px;
    font-weight: 700; line-height: 1.1; letter-spacing: -1px;
    color: var(--text-primary); margin-bottom: 20px;
  }
  .brand-title em { font-style: italic; color: var(--gold); }
  .brand-desc {
    font-family: 'DM Sans', sans-serif; font-size: 15px;
    font-weight: 300; color: var(--text-secondary); line-height: 1.7;
    max-width: 360px;
  }
  .brand-footer {
    position: relative; z-index: 1;
    font-family: 'DM Mono', monospace; font-size: 10px;
    letter-spacing: 0.15em; text-transform: uppercase;
    color: var(--text-dim);
  }
  /* deco circles */
  .brand-ring {
    position: absolute; border-radius: 50%;
    border: 1px solid var(--gold-border); opacity: 0.2; pointer-events: none;
  }
  .ring-1 { width: 300px; height: 300px; bottom: -80px; right: -80px; }
  .ring-2 { width: 200px; height: 200px; bottom: -30px; right: -30px; }
  /* Right panel — form */
  .auth-form-panel {
    position: relative; z-index: 1;
    display: flex; flex-direction: column;
    justify-content: center; align-items: center;
    padding: 48px;
    animation: fadeIn 0.6s ease both;
  }
  @keyframes fadeIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
  .form-box { width: 100%; max-width: 400px; }
  .form-heading {
    font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700;
    color: var(--text-primary); margin-bottom: 6px;
  }
  .form-subheading {
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 300;
    color: var(--text-secondary); margin-bottom: 40px;
  }
  .form-field { margin-bottom: 20px; }
  .form-label {
    display: block; font-family: 'DM Mono', monospace; font-size: 10px;
    letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--text-dim); margin-bottom: 8px;
  }
  .form-input {
    width: 100%; background: var(--obsidian-3);
    border: 1px solid var(--glass-border); color: var(--text-primary);
    font-family: 'DM Sans', sans-serif; font-size: 15px;
    padding: 13px 16px; border-radius: 8px; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .form-input::placeholder { color: var(--text-dim); }
  .form-input:focus { border-color: var(--gold-border); box-shadow: 0 0 0 3px rgba(212,175,55,0.07); }
  .form-divider { height: 1px; background: var(--glass-border); margin: 28px 0; }
  .btn-submit {
    width: 100%; font-family: 'DM Mono', monospace; font-size: 12px;
    letter-spacing: 0.2em; text-transform: uppercase; font-weight: 500;
    background: var(--gold); color: var(--obsidian);
    border: none; padding: 15px; border-radius: 8px;
    cursor: pointer; transition: all 0.2s; margin-bottom: 24px;
  }
  .btn-submit:hover:not(:disabled) {
    background: var(--gold-light); box-shadow: 0 0 24px rgba(212,175,55,0.25);
    transform: translateY(-1px);
  }
  .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
  .form-footer {
    font-family: 'DM Sans', sans-serif; font-size: 13px;
    color: var(--text-dim); text-align: center;
  }
  .form-footer a { color: var(--gold); text-decoration: none; margin-left: 6px; font-weight: 500; transition: color 0.2s; }
  .form-footer a:hover { color: var(--gold-light); }
  .err-msg {
    font-family: 'DM Mono', monospace; font-size: 11px;
    color: var(--red); background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.25); border-radius: 6px;
    padding: 10px 14px; margin-bottom: 20px; letter-spacing: 0.05em;
  }
  @media (max-width: 768px) {
    .auth-root { grid-template-columns: 1fr; }
    .auth-brand { display: none; }
    .auth-form-panel { padding: 32px 24px; }
  }
`;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) return setError("Please fill in all fields.");
    setError(""); setLoading(true);
    try {
      const response = await fetch("https://crypto-trading-backend-6yvb.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) { setError(data.message || "Login failed."); setLoading(false); return; }
      localStorage.setItem("token", data.token);
      window.location.href = "/dashboard";
    } catch (e) {
      setError("Unable to connect. Try again."); setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") handleLogin(); };

  return (
    <>
      <style>{CSS}</style>
      <div className="auth-root">
        {/* Brand panel */}
        <div className="auth-brand">
          <div className="brand-orb" />
          <div className="brand-ring ring-1" />
          <div className="brand-ring ring-2" />
          <div className="brand-logo">
            <div className="brand-logo-dot" />
            Crypto Desk
          </div>
          <div className="brand-center">
            <div className="brand-eyebrow">Private Trading Platform</div>
            <h2 className="brand-title">Welcome<br /><em>Back.</em></h2>
            <p className="brand-desc">
              Access live crypto markets, track your portfolio in real-time,
              and execute trades with precision — all in one place.
            </p>
          </div>
          <div className="brand-footer">© 2025 Crypto Desk · Simulator</div>
        </div>

        {/* Form panel */}
        <div className="auth-form-panel">
          <div className="form-box">
            <h1 className="form-heading">Sign In</h1>
            <p className="form-subheading">Enter your credentials to access the platform</p>

            {error && <div className="err-msg">{error}</div>}

            <div className="form-field">
              <label className="form-label">Email Address</label>
              <input
                type="email" placeholder="you@example.com"
                className="form-input" value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKey}
              />
            </div>

            <div className="form-field">
              <label className="form-label">Password</label>
              <input
                type="password" placeholder="••••••••"
                className="form-input" value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKey}
              />
            </div>

            <div className="form-divider" />

            <button className="btn-submit" onClick={handleLogin} disabled={loading}>
              {loading ? "Authenticating···" : "Sign In"}
            </button>

            <p className="form-footer">
              No account yet?
              <Link href="/signup">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}