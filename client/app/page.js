import Link from "next/link";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --obsidian: #0d0c09; --obsidian-2: #141208; --obsidian-3: #1c1a12;
    --gold: #d4af37; --gold-light: #f0d060; --gold-dim: rgba(212,175,55,0.12);
    --gold-border: rgba(212,175,55,0.25); --text-primary: #f5f0e8;
    --text-secondary: #a89878; --text-dim: #5a5040;
    --green: #22c55e; --glass-border: rgba(255,255,255,0.07);
  }
  html, body { height: 100%; }
  .home-root {
    min-height: 100vh; background: var(--obsidian);
    color: var(--text-primary); font-family: 'DM Sans', sans-serif;
    display: flex; flex-direction: column; justify-content: center; align-items: center;
    position: relative; overflow: hidden;
  }
  /* grain */
  .home-root::before {
    content: ''; position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none; z-index: 0; opacity: 0.7;
  }
  /* ambient orb */
  .orb {
    position: absolute; border-radius: 50%; pointer-events: none;
    filter: blur(80px); z-index: 0;
  }
  .orb-1 { width: 600px; height: 600px; top: -200px; left: 50%; transform: translateX(-50%); background: radial-gradient(circle, rgba(212,175,55,0.08), transparent 70%); }
  .orb-2 { width: 300px; height: 300px; bottom: -100px; right: 10%; background: radial-gradient(circle, rgba(212,175,55,0.05), transparent 70%); }
  /* decorative lines */
  .deco-line {
    position: absolute; pointer-events: none; z-index: 0;
    border: 1px solid var(--gold-border); border-radius: 50%;
    opacity: 0.3;
  }
  .deco-line-1 { width: 700px; height: 700px; top: 50%; left: 50%; transform: translate(-50%, -50%); }
  .deco-line-2 { width: 500px; height: 500px; top: 50%; left: 50%; transform: translate(-50%, -50%); }
  .content {
    position: relative; z-index: 1; text-align: center;
    max-width: 680px; padding: 0 32px;
    animation: fadeUp 0.9s ease both;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .eyebrow {
    font-family: 'DM Mono', monospace; font-size: 11px;
    letter-spacing: 0.3em; text-transform: uppercase;
    color: var(--gold); opacity: 0.8; margin-bottom: 20px;
    display: flex; align-items: center; justify-content: center; gap: 12px;
  }
  .eyebrow::before, .eyebrow::after {
    content: ''; display: block; width: 40px; height: 1px; background: var(--gold-border);
  }
  .hero-title {
    font-family: 'Playfair Display', serif; font-size: clamp(44px, 7vw, 76px);
    font-weight: 700; line-height: 1.05; letter-spacing: -1px;
    color: var(--text-primary); margin-bottom: 10px;
  }
  .hero-title em { font-style: italic; color: var(--gold); }
  .hero-sub {
    font-family: 'DM Sans', sans-serif; font-size: 17px; font-weight: 300;
    color: var(--text-secondary); line-height: 1.7; margin-bottom: 52px;
    max-width: 480px; margin-left: auto; margin-right: auto;
  }
  .hero-sub b { font-weight: 52px; }
  .cta-row { display: flex; gap: 16px; justify-content: center; align-items: center; margin-bottom: 64px; }
  .btn-primary {
    font-family: 'DM Mono', monospace; font-size: 12px; letter-spacing: 0.18em;
    text-transform: uppercase; font-weight: 500;
    background: var(--gold); color: var(--obsidian);
    border: none; padding: 15px 40px; border-radius: 6px;
    cursor: pointer; transition: all 0.2s; text-decoration: none; display: inline-block;
  }
  .btn-primary:hover { background: var(--gold-light); box-shadow: 0 0 32px rgba(212,175,55,0.3); transform: translateY(-1px); }
  .btn-secondary {
    font-family: 'DM Mono', monospace; font-size: 12px; letter-spacing: 0.18em;
    text-transform: uppercase; font-weight: 400;
    background: transparent; color: var(--text-secondary);
    border: 1px solid var(--glass-border); padding: 15px 40px; border-radius: 6px;
    cursor: pointer; transition: all 0.2s; text-decoration: none; display: inline-block;
  }
  .btn-secondary:hover { border-color: var(--gold-border); color: var(--gold); background: var(--gold-dim); }
  .stats-row {
    display: flex; gap: 0; border: 1px solid var(--glass-border);
    border-radius: 12px; overflow: hidden; background: var(--obsidian-3);
    animation: fadeUp 0.9s 0.2s ease both;
  }
  .stat-item {
    flex: 1; padding: 20px 28px; text-align: center;
    border-right: 1px solid var(--glass-border);
  }
  .stat-item:last-child { border-right: none; }
  .stat-val {
    font-family: 'DM Mono', monospace; font-size: 22px; font-weight: 500;
    color: var(--gold-light); letter-spacing: -0.03em; margin-bottom: 4px;
  }
  .stat-lbl {
    font-family: 'DM Mono', monospace; font-size: 10px;
    letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-dim);
  }
  /* corner marks */
  .corner { position: absolute; width: 20px; height: 20px; z-index: 0; opacity: 0.4; }
  .corner-tl { top: 32px; left: 32px; border-top: 1px solid var(--gold); border-left: 1px solid var(--gold); }
  .corner-tr { top: 32px; right: 32px; border-top: 1px solid var(--gold); border-right: 1px solid var(--gold); }
  .corner-bl { bottom: 32px; left: 32px; border-bottom: 1px solid var(--gold); border-left: 1px solid var(--gold); }
  .corner-br { bottom: 32px; right: 32px; border-bottom: 1px solid var(--gold); border-right: 1px solid var(--gold); }
`;

export default function HomePage() {
  return (
    <>
      <style>{CSS}</style>
      <div className="home-root">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="deco-line deco-line-1" />
        <div className="deco-line deco-line-2" />
        <div className="corner corner-tl" />
        <div className="corner corner-tr" />
        <div className="corner corner-bl" />
        <div className="corner corner-br" />

        <div className="content">
          <div className="eyebrow">Digital Asset Trading</div>

          <h1 className="hero-title">
            Trade Crypto.<br /><em>Master Markets.</em>
          </h1>

          <p className="hero-sub">
            Practice with live prices, real-time portfolio tracking,
            and institutional-grade analytics — zero risk.
          </p>

          <div className="cta-row">
            <Link href="/login" className="btn-primary">Enter Platform</Link>
            <Link href="/signup" className="btn-secondary">Create Account</Link>
          </div>

          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-val">3</div>
              <div className="stat-lbl">Live Assets</div>
            </div>
            <div className="stat-item">
              <div className="stat-val">Real-time</div>
              <div className="stat-lbl">Price Feeds</div>
            </div>
            <div className="stat-item">
              <div className="stat-val">₹0</div>
              <div className="stat-lbl">Risk</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}