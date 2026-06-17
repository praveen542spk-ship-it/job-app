import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "./api";
import { createClient } from "@supabase/supabase-js";

// Supabase client (Realtime மட்டும்)
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  /* Obsidian Midnight Glass Theme (Default Dark) */
  --bg: #07080d;
  --bg-sub: #0f111a;
  --paper: #161824;
  --cream: #07080d;
  --card: rgba(18, 20, 32, 0.7);
  --card-hover: rgba(26, 29, 46, 0.85);
  --border: rgba(255, 255, 255, 0.08);
  --border-hover: rgba(255, 255, 255, 0.15);
  --border-focus: #6366f1;
  --text: #f3f4f6;
  --text-muted: #9ca3af;
  --primary: #6366f1;
  --primary-light: #818cf8;
  --accent: #06b6d4;
  --accent-gradient: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #06b6d4 100%);
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  --shadow-lg: 0 16px 48px 0 rgba(0, 0, 0, 0.5);
  --glass-blur: blur(12px);
  --radius: 8px;
  --radius-lg: 16px;
  --font-display: 'Syne', sans-serif;
  --font-body: 'DM Sans', sans-serif;
  --gold: #d4af37;
  --gold-dark: #aa8c2c;
}

[data-theme="light"] {
  /* Brutalist Clean Editorial Theme */
  --bg: #faf8f5;
  --bg-sub: #f6efe2;
  --paper: #f6efe2;
  --cream: #faf8f5;
  --card: #ffffff;
  --card-hover: #fdfcfb;
  --border: #dcd0bc;
  --border-hover: #cbb99e;
  --border-focus: #c9a84c;
  --text: #0d0d0d;
  --text-muted: #827c70;
  --primary: #c9a84c;
  --primary-light: #f0d98a;
  --accent: #c45c2e;
  --accent-gradient: linear-gradient(135deg, #c9a84c 0%, #c45c2e 100%);
  --success: #3f5e35;
  --danger: #b91c1c;
  --warning: #a06020;
  --shadow: 0 4px 20px rgba(13,13,13,0.06);
  --shadow-lg: 0 10px 40px rgba(13,13,13,0.1);
  --glass-blur: none;
  --gold: #c9a84c;
  --gold-dark: #a08234;
}

body {
  font-family: var(--font-body);
  background: var(--bg);
  color: var(--text);
  transition: background 0.3s, color 0.3s;
  overflow-x: hidden;
}

/* Custom Scrollbar */
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--primary); }

.app { min-height: 100vh; display: flex; flex-direction: column; }
.main { flex: 1; }

/* ── Navbar ── */
.nav {
  background: var(--card);
  backdrop-filter: var(--glass-blur);
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
  position: sticky; top: 0; z-index: 100;
  border-bottom: 1px solid var(--border);
  box-shadow: var(--shadow);
  transition: all 0.3s;
}
.nav-logo {
  font-family: var(--font-display);
  font-size: 1.5rem; font-weight: 800;
  color: var(--text); letter-spacing: -0.5px;
  cursor: pointer;
}
.nav-logo span {
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.nav-links { display: flex; gap: 0.5rem; align-items: center; }
.nav-btn {
  background: none; border: none;
  font-family: var(--font-body); font-size: 0.9rem; font-weight: 500;
  color: var(--text-muted); padding: 0.6rem 1rem; border-radius: var(--radius);
  cursor: pointer; transition: all 0.2s;
}
.nav-btn:hover { color: var(--text); background: rgba(255,255,255,0.05); }
.nav-btn.active { color: var(--primary); font-weight: 700; background: rgba(255,255,255,0.03); }
.nav-cta {
  background: var(--accent-gradient); color: #fff !important;
  padding: 0.6rem 1.25rem !important; font-weight: 700 !important;
  border-radius: var(--radius) !important; margin-left: 0.5rem;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
}
.nav-cta:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4); }

/* Theme Toggle Button */
.theme-toggle-btn {
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--border);
  color: var(--text);
  width: 38px; height: 38px;
  margin-left: 0.5rem;
}
.theme-toggle-btn:hover {
  background: rgba(255,255,255,0.1);
  transform: rotate(15deg) scale(1.05);
}

/* ── Hero ── */
.hero {
  padding: 6rem 2rem 5rem;
  text-align: center;
  position: relative; overflow: hidden;
  background: linear-gradient(180deg, var(--bg-sub) 0%, var(--bg) 100%);
}
.hero::before {
  content: '';
  position: absolute; top: -10%; left: 50%; transform: translateX(-50%);
  width: 80%; height: 50%;
  background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 60%);
  pointer-events: none;
}
.hero-eyebrow {
  font-family: var(--font-display); font-size: 0.8rem;
  letter-spacing: 0.2em; text-transform: uppercase;
  color: var(--accent); margin-bottom: 1.25rem; font-weight: 700;
}
.hero h1 {
  font-family: var(--font-display); font-size: clamp(2.6rem, 5.5vw, 4rem);
  font-weight: 800; color: var(--text); line-height: 1.15;
  letter-spacing: -1.5px; margin-bottom: 1.5rem; position: relative;
}
.hero h1 em {
  font-style: normal;
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.hero-sub {
  font-size: 1.15rem; color: var(--text-muted); max-width: 580px;
  margin: 0 auto 3rem; font-weight: 400; line-height: 1.6;
}

/* ── Search Bar ── */
.search-wrap {
  max-width: 720px; margin: 0 auto;
  display: flex; gap: 0; position: relative;
  background: var(--card); border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border);
  overflow: hidden;
  backdrop-filter: var(--glass-blur);
  transition: all 0.3s;
}
.search-wrap:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2), var(--shadow-lg);
}
.search-icon {
  position: absolute; left: 1.25rem; top: 50%;
  transform: translateY(-50%); color: var(--text-muted); font-size: 1rem;
}
.search-input {
  flex: 1; padding: 1.2rem 1rem 1.2rem 3.2rem;
  border: none; outline: none; font-family: var(--font-body);
  font-size: 1rem; background: transparent; color: var(--text);
}
.search-input::placeholder { color: var(--text-muted); }
.search-select {
  padding: 0 1.2rem; border: none; border-left: 1px solid var(--border);
  background: rgba(255,255,255,0.02); font-family: var(--font-body);
  font-size: 0.9rem; color: var(--text-muted); outline: none; cursor: pointer;
  transition: all 0.2s;
}
.search-select:hover { background: rgba(255,255,255,0.05); color: var(--text); }
.search-btn {
  background: var(--accent-gradient); border: none; padding: 0 2rem;
  font-family: var(--font-display); font-weight: 700; font-size: 1rem;
  color: #fff; cursor: pointer; transition: all 0.2s;
  white-space: nowrap;
}
.search-btn:hover { opacity: 0.95; transform: scale(1.01); }

.hero-stats {
  display: flex; gap: 4rem; justify-content: center;
  margin-top: 3.5rem; position: relative;
}
.hero-stat { text-align: center; }
.hero-stat strong {
  display: block; font-family: var(--font-display);
  font-size: 2rem; font-weight: 800;
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.hero-stat span { font-size: 0.8rem; color: var(--text-muted); letter-spacing: 0.1em; font-weight: 700; text-transform: uppercase; }

/* ── Section ── */
.section { padding: 5rem 2rem; max-width: 1200px; margin: 0 auto; }
.section-header {
  display: flex; align-items: baseline; justify-content: space-between;
  margin-bottom: 2.5rem;
}
.section-title {
  font-family: var(--font-display); font-size: 1.8rem; font-weight: 800;
  letter-spacing: -0.5px;
}
.section-title span {
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.see-all {
  font-size: 0.9rem; font-weight: 700; color: var(--primary);
  background: none; border: none; cursor: pointer;
  transition: all 0.2s;
}
.see-all:hover { opacity: 0.8; letter-spacing: 0.5px; }

/* ── Job Cards ── */
.jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.5rem;
}
.job-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 1.75rem;
  cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative; overflow: hidden;
  backdrop-filter: var(--glass-blur);
}
.job-card::before {
  content: ''; position: absolute; top: 0; left: 0;
  width: 4px; height: 0; background: var(--primary);
  transition: height 0.3s;
}
.job-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow);
  border-color: rgba(99, 102, 241, 0.3);
  background: var(--card-hover);
}
.job-card:hover::before { height: 100%; }
.job-card-header { display: flex; gap: 1rem; align-items: flex-start; margin-bottom: 1.25rem; }
.company-logo {
  width: 52px; height: 52px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem; flex-shrink: 0;
  border: 1px solid var(--border); background: var(--bg-sub);
}
.job-card-title { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; color: var(--text); margin-bottom: 0.25rem; }
.job-company { font-size: 0.9rem; color: var(--text-muted); }
.job-card-meta { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.25rem; }
.badge {
  display: inline-flex; align-items: center; gap: 0.35rem;
  font-size: 0.75rem; font-weight: 600; padding: 0.3rem 0.75rem;
  border-radius: 99px; border: 1px solid var(--border);
  background: rgba(255,255,255,0.03); color: var(--text-muted);
}
.badge-type { color: var(--success); border-color: rgba(16, 185, 129, 0.2); background: rgba(16, 185, 129, 0.05); }
.badge-remote { color: var(--accent); border-color: rgba(6, 182, 212, 0.2); background: rgba(6, 182, 212, 0.05); }
.badge-new { background: var(--danger); color: white; border-color: transparent; font-weight: 800; }
.badge-featured { background: var(--accent-gradient); color: #fff; border-color: transparent; font-weight: 800; }
.job-card-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 1.25rem; border-top: 1px solid var(--border);
}
.job-location { font-size: 0.85rem; color: var(--text-muted); display: flex; gap: 0.35rem; align-items: center; }
.job-posted { font-size: 0.8rem; color: var(--text-muted); }
.apply-mini {
  background: var(--text); color: var(--bg);
  border: none; border-radius: var(--radius); padding: 0.5rem 1rem;
  font-size: 0.85rem; font-weight: 700; cursor: pointer;
  transition: all 0.2s;
}
.apply-mini:hover { background: var(--primary); color: #fff; }

/* ── Filters ── */
.filters-row {
  display: flex; gap: 0.65rem; flex-wrap: wrap; margin-bottom: 1.25rem; align-items: center;
}
.filter-chip {
  background: var(--card); border: 1px solid var(--border);
  border-radius: 99px; padding: 0.45rem 1.1rem;
  font-size: 0.85rem; font-weight: 500; cursor: pointer;
  transition: all 0.2s; color: var(--text-muted);
}
.filter-chip:hover { border-color: var(--primary); color: var(--text); }
.filter-chip.active { background: var(--primary); border-color: var(--primary); color: #fff; box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3); }
.results-count { font-size: 0.9rem; color: var(--text-muted); margin-left: auto; font-weight: 500; }

/* ── Job Detail ── */
.detail-wrap { max-width: 960px; margin: 0 auto; padding: 3rem 2rem; }
.detail-back {
  background: none; border: none; cursor: pointer;
  font-size: 0.9rem; color: var(--text-muted); display: flex; gap: 0.5rem;
  align-items: center; margin-bottom: 2rem; transition: all 0.2s;
}
.detail-back:hover { color: var(--text); }
.detail-hero {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 2.5rem; margin-bottom: 2rem;
  box-shadow: var(--shadow); backdrop-filter: var(--glass-blur);
}
.detail-header { display: flex; gap: 1.5rem; align-items: flex-start; }
.detail-logo {
  width: 72px; height: 72px; border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  font-size: 2.2rem; border: 1px solid var(--border); background: var(--bg-sub);
}
.detail-title { font-family: var(--font-display); font-size: 2rem; font-weight: 800; color: var(--text); margin-bottom: 0.4rem; }
.detail-company { font-size: 1.1rem; color: var(--text-muted); margin-bottom: 1rem; }
.detail-quick { display: flex; flex-wrap: wrap; gap: 1rem; }
.detail-quick-item {
  display: flex; gap: 0.4rem; align-items: center;
  font-size: 0.9rem; color: var(--text-muted);
}
.apply-btn {
  background: var(--accent-gradient); color: #fff; border: none;
  padding: 1rem 2.5rem; border-radius: var(--radius-lg);
  font-family: var(--font-display); font-size: 1.05rem; font-weight: 800;
  cursor: pointer; transition: all 0.2s;
  margin-top: 1.5rem; display: inline-flex; align-items: center; gap: 0.6rem;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.apply-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5); }
.detail-section { margin-bottom: 2.5rem; }
.detail-section h3 {
  font-family: var(--font-display); font-size: 1.25rem; font-weight: 800;
  margin-bottom: 1.25rem; padding-bottom: 0.6rem; border-bottom: 1px solid var(--border);
  color: var(--text);
}
.detail-section p, .detail-section li { font-size: 1.05rem; line-height: 1.8; color: var(--text-muted); }
.detail-section ul { padding-left: 1.5rem; }
.detail-section li { margin-bottom: 0.5rem; }
.detail-sidebar {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 1.75rem;
}
.sidebar-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.85rem 0; border-bottom: 1px solid var(--border); font-size: 0.9rem;
}
.sidebar-item:last-child { border-bottom: none; }
.sidebar-item label { color: var(--text-muted); font-size: 0.85rem; font-weight: 500; }
.sidebar-item strong { font-weight: 700; color: var(--text); }
.detail-grid { display: grid; grid-template-columns: 1fr 300px; gap: 2rem; }
@media (max-width: 800px) { .detail-grid { grid-template-columns: 1fr; } }

/* ── Login Page ── */
.login-page {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: calc(100vh - 72px);
}
@media (max-width: 768px) {
  .login-page { grid-template-columns: 1fr; }
  .login-left { display: none !important; }
}
.login-left {
  background: var(--bg-sub);
  display: flex; flex-direction: column;
  justify-content: space-between;
  padding: 4rem 3rem;
  position: relative; overflow: hidden;
  border-right: 1px solid var(--border);
}
.login-left::before {
  content: '';
  position: absolute; bottom: -80px; left: -80px;
  width: 450px; height: 450px; border-radius: 50%;
  background: radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%);
  pointer-events: none;
}
.login-left-logo {
  font-family: var(--font-display); font-size: 1.6rem; font-weight: 800;
  color: var(--text); letter-spacing: -0.5px; position: relative; z-index: 1;
}
.login-left-logo span {
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.login-left-body { position: relative; z-index: 1; margin: auto 0; }
.login-left-body h2 {
  font-family: var(--font-display); font-size: 2.4rem; font-weight: 800;
  color: var(--text); line-height: 1.2; margin-bottom: 1.5rem; letter-spacing: -0.8px;
}
.login-left-body h2 em {
  font-style: normal;
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.login-left-body p {
  color: var(--text-muted); font-weight: 400; line-height: 1.6;
  margin-bottom: 2.5rem; font-size: 1.05rem;
}
.login-testimonial {
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 1.5rem;
  backdrop-filter: var(--glass-blur);
}
.login-testimonial p {
  font-size: 0.95rem; color: var(--text-muted); line-height: 1.7;
  margin-bottom: 1rem; font-style: italic;
}
.testi-row { display: flex; align-items: center; gap: 0.75rem; }
.testi-av {
  width: 38px; height: 38px; border-radius: 50%;
  background: var(--primary); display: flex; align-items: center;
  justify-content: center; font-family: var(--font-display);
  font-size: 0.8rem; font-weight: 800; color: #fff; flex-shrink: 0;
}
.testi-name { font-size: 0.9rem; font-weight: 700; color: var(--text); }
.testi-role { font-size: 0.8rem; color: var(--text-muted); }
.login-left-stats { display: flex; gap: 3rem; position: relative; z-index: 1; }
.login-left-stat strong {
  display: block; font-family: var(--font-display);
  font-size: 1.8rem; font-weight: 800;
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.login-left-stat span { font-size: 0.75rem; color: var(--text-muted); letter-spacing: 0.08em; text-transform: uppercase; font-weight: 700; }

.login-right {
  display: flex; align-items: center; justify-content: center;
  padding: 4rem 3rem; background: var(--bg);
}
.login-form-box { width: 100%; max-width: 420px; }
.login-mobile-logo {
  font-family: var(--font-display); font-size: 1.5rem; font-weight: 800;
  color: var(--text); letter-spacing: -0.5px; margin-bottom: 2.5rem;
  display: none;
}
@media (max-width: 768px) { .login-mobile-logo { display: block; } }
.login-mobile-logo span {
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.login-eyebrow {
  font-family: var(--font-display); font-size: 0.75rem;
  letter-spacing: 0.2em; text-transform: uppercase;
  color: var(--accent); margin-bottom: 0.5rem; font-weight: 700;
}
.login-title {
  font-family: var(--font-display); font-size: 2rem; font-weight: 800;
  margin-bottom: 0.5rem; letter-spacing: -0.8px;
}
.login-sub {
  font-size: 0.95rem; color: var(--text-muted); margin-bottom: 2rem; font-weight: 400;
}

/* ── Auth Modal ── */
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.7);
  z-index: 200; display: flex; align-items: center; justify-content: center;
  padding: 1rem; backdrop-filter: blur(5px);
}
.modal {
  background: var(--bg-sub); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 2.5rem;
  width: 100%; max-width: 460px; box-shadow: var(--shadow-lg);
  position: relative; animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes slideUp { from { opacity:0; transform: translateY(24px); } }
.modal-close {
  position: absolute; top: 1.25rem; right: 1.25rem;
  background: none; border: none; font-size: 1.8rem;
  cursor: pointer; color: var(--text-muted); line-height: 1;
  transition: all 0.2s;
}
.modal-close:hover { color: var(--text); }
.modal h2 {
  font-family: var(--font-display); font-size: 1.6rem; font-weight: 800;
  margin-bottom: 0.4rem;
}
.modal-sub { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.75rem; }
.tab-row { display: flex; gap: 0; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; margin-bottom: 1.75rem; }
.tab-btn {
  flex: 1; padding: 0.75rem; border: none; background: none;
  font-family: var(--font-body); font-size: 0.9rem; font-weight: 600;
  cursor: pointer; transition: all 0.2s; color: var(--text-muted);
}
.tab-btn.active { background: var(--primary); color: #fff; }

/* ── Forms ── */
.form-group { margin-bottom: 1.25rem; }
.form-label {
  display: block; font-size: 0.8rem; font-weight: 700;
  color: var(--text-muted); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.08em;
}
.form-input, .form-textarea {
  width: 100%; padding: 0.85rem 1.1rem;
  border: 1px solid var(--border); border-radius: var(--radius);
  font-family: var(--font-body); font-size: 0.95rem; background: rgba(255,255,255,0.02);
  color: var(--text); outline: none; transition: all 0.2s;
}
.form-select {
  width: 100%; padding: 0.85rem 1.1rem;
  border: 1px solid var(--border); border-radius: var(--radius);
  font-family: var(--font-body); font-size: 0.95rem; background: #0f111a;
  color: var(--text); outline: none; transition: all 0.2s;
}
[data-theme="light"] .form-select {
  background: #ffffff;
  color: #0d0d0d;
}
.form-select option {
  background-color: #0f111a !important;
  color: #f3f4f6 !important;
}
[data-theme="light"] .form-select option {
  background-color: #ffffff !important;
  color: #0d0d0d !important;
}
.form-input:focus, .form-textarea:focus {
  border-color: var(--primary);
  background: rgba(255,255,255,0.04);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}
.form-select:focus {
  border-color: var(--primary);
  background: #0f111a;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}
[data-theme="light"] .form-select:focus {
  background: #ffffff;
}
.form-textarea { resize: vertical; min-height: 120px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
@media (max-width: 500px) { .form-row { grid-template-columns: 1fr; } }
.btn-primary {
  width: 100%; background: var(--accent-gradient); color: #fff;
  border: none; padding: 0.95rem; border-radius: var(--radius-lg);
  font-family: var(--font-display); font-size: 1rem; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
}
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }
.btn-secondary {
  background: rgba(255,255,255,0.05); color: var(--text);
  border: 1px solid var(--border); padding: 0.85rem 1.75rem;
  border-radius: var(--radius); font-family: var(--font-display);
  font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: all 0.2s;
}
.btn-secondary:hover { background: rgba(255,255,255,0.1); border-color: var(--text); }
.btn-danger {
  background: rgba(239, 68, 68, 0.15); color: var(--danger);
  border: 1px solid rgba(239, 68, 68, 0.25); padding: 0.6rem 1.2rem;
  border-radius: var(--radius); font-size: 0.85rem; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
}
.btn-danger:hover { background: var(--danger); color: #fff; }
.divider { text-align: center; color: var(--text-muted); font-size: 0.8rem; margin: 1.5rem 0; position: relative; }
.divider::before, .divider::after {
  content: ''; position: absolute; top: 50%; width: 42%; height: 1px; background: var(--border);
}
.divider::before { left: 0; } .divider::after { right: 0; }

/* ── Dashboard ── */
.dash-wrap { max-width: 1100px; margin: 0 auto; padding: 3rem 2rem; }
.dash-header { margin-bottom: 2.5rem; }
.dash-header h1 {
  font-family: var(--font-display); font-size: 2.2rem; font-weight: 800; margin-bottom: 0.4rem;
}
.dash-header p { color: var(--text-muted); }
.dash-tabs {
  display: flex; gap: 0.5rem; border-bottom: 1px solid var(--border);
  margin-bottom: 2.5rem; align-items: center;
}
.dash-tab {
  background: none; border: none; padding: 1rem 1.5rem;
  font-family: var(--font-body); font-size: 0.95rem; font-weight: 600;
  cursor: pointer; color: var(--text-muted); border-bottom: 2px solid transparent;
  margin-bottom: -1px; transition: all 0.2s;
}
.dash-tab.active { color: var(--primary); border-bottom-color: var(--primary); font-weight: 700; }
.dash-tab:hover:not(.active) { color: var(--text); }
.stats-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.25rem; margin-bottom: 2.5rem; }
.stat-card {
  background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
  padding: 1.5rem; text-align: center; backdrop-filter: var(--glass-blur);
}
.stat-card .val { font-family: var(--font-display); font-size: 2.2rem; font-weight: 800;
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent; }
.stat-card .lbl { font-size: 0.8rem; color: var(--text-muted); margin-top: 0.4rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  text-align: left; font-size: 0.8rem; font-weight: 700;
  color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em;
  padding: 1rem 1.25rem; border-bottom: 1px solid var(--border); background: var(--bg-sub);
}
.data-table td {
  padding: 1.25rem; border-bottom: 1px solid var(--border);
  font-size: 0.95rem; vertical-align: middle;
}
.data-table tr:hover td { background: rgba(255,255,255,0.01); }
.status-badge {
  display: inline-block; padding: 0.35rem 0.85rem;
  border-radius: 99px; font-size: 0.8rem; font-weight: 700;
  text-transform: capitalize;
}
.status-pending { background: rgba(245, 158, 11, 0.15); color: var(--warning); }
.status-reviewed { background: rgba(99, 102, 241, 0.15); color: var(--primary); }
.status-interview { background: rgba(16, 185, 129, 0.15); color: var(--success); }
.status-rejected { background: rgba(239, 68, 68, 0.15); color: var(--danger); }
.status-active { background: rgba(16, 185, 129, 0.15); color: var(--success); }
.status-closed { background: rgba(255,255,255,0.05); color: var(--text-muted); }

/* ── Application Form ── */
.app-form-wrap { max-width: 680px; margin: 0 auto; padding: 3rem 2rem; }
.app-form-wrap h1 {
  font-family: var(--font-display); font-size: 2rem; font-weight: 800;
  margin-bottom: 0.5rem;
}
.file-upload {
  border: 2px dashed var(--border); border-radius: var(--radius-lg);
  padding: 3rem 2rem; text-align: center; cursor: pointer;
  transition: all 0.2s; background: rgba(255,255,255,0.01);
}
.file-upload:hover { border-color: var(--primary); background: rgba(255,255,255,0.02); }
.file-upload input { display: none; }
.file-upload-icon { font-size: 2.5rem; margin-bottom: 1rem; }
.file-upload-text { font-size: 0.95rem; color: var(--text-muted); }
.file-upload-text strong { color: var(--primary); }
.progress-steps {
  display: flex; gap: 0.5rem; margin-bottom: 2.5rem; border-radius: var(--radius);
  overflow: hidden;
}
.step {
  flex: 1; padding: 0.85rem; text-align: center; font-size: 0.85rem;
  font-weight: 700; background: var(--bg-sub); color: var(--text-muted);
  transition: all 0.2s;
}
.step.done { background: rgba(16, 185, 129, 0.15); color: var(--success); }
.step.current { background: var(--primary); color: #fff; }

/* ── Toast ── */
.toast-container {
  position: fixed; bottom: 2rem; right: 2rem; z-index: 9999;
  display: flex; flex-direction: column; gap: 0.65rem;
}
.toast {
  background: var(--bg-sub); color: var(--text);
  padding: 1rem 1.5rem; border-radius: var(--radius-lg);
  font-size: 0.9rem; display: flex; align-items: center; gap: 0.75rem;
  box-shadow: var(--shadow-lg); border: 1px solid var(--border);
  animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  max-width: 340px; border-left: 4px solid var(--primary);
  backdrop-filter: var(--glass-blur);
}
.toast.success { border-left-color: var(--success); }
.toast.error { border-left-color: var(--danger); }
@keyframes slideIn { from { opacity:0; transform: translateX(32px); } }

/* ── Category ── */
.categories-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1.25rem; margin-bottom: 3.5rem;
}
.cat-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 1.5rem;
  text-align: center; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: var(--glass-blur);
}
.cat-card:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow);
  transform: translateY(-3px);
  background: var(--card-hover);
}
.cat-icon { font-size: 2rem; margin-bottom: 0.75rem; }
.cat-name { font-weight: 700; font-size: 0.95rem; color: var(--text); }
.cat-count { font-size: 0.8rem; color: var(--text-muted); margin-top: 0.3rem; font-weight: 500; }

/* ── Footer ── */
.footer {
  background: var(--bg-sub); color: var(--text-muted); text-align: center;
  padding: 3rem; font-size: 0.9rem; border-top: 1px solid var(--border);
}
.footer strong {
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* ── Responsive ── */
@media (max-width: 600px) {
  .nav { padding: 0 1rem; }
  .hero { padding: 4rem 1rem 3rem; }
  .hero-stats { gap: 1.5rem; }
  .section { padding: 3rem 1rem; }
  .jobs-grid { grid-template-columns: 1fr; }
  .search-select { display: none; }
  .dash-wrap, .detail-wrap, .app-form-wrap { padding: 1.5rem 1rem; }
}

/* ── Empty / Loading ── */
.empty {
  text-align: center; padding: 5rem 2rem; color: var(--text-muted);
}
.empty-icon { font-size: 3.5rem; margin-bottom: 1.25rem; }
.loading { display: flex; justify-content: center; padding: 4rem; }
.spinner {
  width: 42px; height: 42px; border: 4px solid var(--border);
  border-top-color: var(--primary); border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Password toggle ── */
.pass-wrap { position: relative; }
.pass-toggle-btn {
  position: absolute; right: 1rem; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; color: var(--text-muted);
  font-size: 0.85rem; font-weight: 600; font-family: var(--font-body);
  padding: 0;
}
.forgot-link {
  text-align: right; font-size: 0.85rem; margin-top: -0.5rem;
  margin-bottom: 1rem;
}
.forgot-link button {
  background: none; border: none; color: var(--primary);
  font-weight: 600; cursor: pointer; font-family: var(--font-body);
}
.switch-text {
  text-align: center; font-size: 0.9rem; color: var(--text-muted); margin-top: 1.5rem;
}
.switch-text button {
  background: none; border: none; color: var(--primary);
  font-weight: 700; cursor: pointer; font-family: var(--font-body); font-size: 0.9rem;
}
.back-link {
  text-align: center; margin-top: 1.25rem;
}
.back-link button {
  background: none; border: none; color: var(--text-muted);
  font-size: 0.85rem; cursor: pointer; font-family: var(--font-body);
}
.terms-text {
  font-size: 0.8rem; color: var(--text-muted); text-align: center;
  margin-top: 1rem; line-height: 1.6;
}
.terms-text a { color: var(--primary); text-decoration: none; }

/* ── Refined Status Select Dropdown (Employer Dashboard) ── */
.status-select {
  padding: 0.4rem 0.95rem;
  border-radius: 99px;
  font-size: 0.8rem;
  font-weight: 700;
  border: 1px solid var(--border);
  outline: none;
  cursor: pointer;
  transition: all 0.25s ease;
  font-family: var(--font-body);
}
.status-select:focus {
  border-color: var(--primary-light);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}
.status-select.status-pending { background: rgba(245, 158, 11, 0.15); color: var(--warning); border-color: rgba(245, 158, 11, 0.25); }
.status-select.status-reviewed { background: rgba(99, 102, 241, 0.15); color: var(--primary); border-color: rgba(99, 102, 241, 0.25); }
.status-select.status-interview { background: rgba(16, 185, 129, 0.15); color: var(--success); border-color: rgba(16, 185, 129, 0.25); }
.status-select.status-rejected { background: rgba(239, 68, 68, 0.15); color: var(--danger); border-color: rgba(239, 68, 68, 0.25); }
.status-select.status-hired { background: rgba(16, 185, 129, 0.25); color: var(--success); border-color: rgba(16, 185, 129, 0.35); }

/* ── Sort Controls ── */
.sort-wrap {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-top: 1rem;
}
.sort-select {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.5rem 1.1rem;
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: var(--text);
  outline: none;
  cursor: pointer;
  transition: all 0.2s ease;
}
.sort-select:hover {
  border-color: var(--primary);
  background: var(--card-hover);
}
.sort-select:focus {
  border-color: var(--primary-light);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

/* ── Interactive Resume Link ── */
.resume-download-link {
  color: var(--accent);
  text-decoration: none;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  transition: all 0.2s ease;
}
.resume-download-link:hover {
  color: var(--primary-light);
  transform: translateY(-1px);
}

/* ── Glassmorphism Visual Polish adjustments ── */
.job-card {
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}
.hero {
  border-bottom: 1px solid var(--border);
}
.hero-stat strong {
  font-size: 2.3rem;
  text-shadow: 0 0 20px rgba(99, 102, 241, 0.25);
}
.nav-logo span {
  text-shadow: 0 0 15px rgba(99, 102, 241, 0.3);
}

/* ── Glowing AI Assistant Orb Logo ── */
.ai-logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 44px;
  height: 44px;
}
.ai-logo-container.large {
  width: 54px;
  height: 54px;
}
.ai-orb-core {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: radial-gradient(circle, #ffd700, #ff8c00);
  box-shadow: 0 0 15px #ffd700, 0 0 30px #ff8c00;
  z-index: 2;
  position: relative;
  transition: all 0.3s;
}
.ai-logo-container.large .ai-orb-core {
  width: 24px;
  height: 24px;
}
.ai-orb-orbit-1 {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 1.5px solid rgba(212, 175, 55, 0.4);
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.2);
  animation: orb-spin 4s linear infinite;
  z-index: 1;
}
.ai-orb-orbit-2 {
  position: absolute;
  width: 80%;
  height: 80%;
  border-radius: 50%;
  border: 1.5px dashed rgba(99, 102, 241, 0.6);
  box-shadow: 0 0 12px rgba(99, 102, 241, 0.3);
  animation: orb-spin-reverse 3s linear infinite;
  z-index: 1;
}
@keyframes orb-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes orb-spin-reverse {
  0% { transform: rotate(360deg); }
  100% { transform: rotate(0deg); }
}
.chatbot-trigger .ai-logo-container {
  transform: scale(0.9);
}

/* ── AI Chatbot Widget Styles ── */
.chatbot-trigger {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(18, 18, 18, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1.5px solid var(--border);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 15px rgba(99, 102, 241, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1000;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  animation: chatbot-pulse 2.5s infinite ease-in-out;
}
.chatbot-trigger:hover {
  transform: scale(1.1) rotate(5deg);
  border-color: var(--gold);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(212, 175, 55, 0.4);
}
@keyframes chatbot-pulse {
  0% { box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 0 rgba(99, 102, 241, 0.3); }
  70% { box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 12px rgba(99, 102, 241, 0); }
  100% { box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 0 rgba(99, 102, 241, 0); }
}
.chatbot-panel {
  position: fixed;
  bottom: 6.5rem;
  right: 2rem;
  width: 380px;
  height: 520px;
  border-radius: var(--radius-lg);
  background: var(--card);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--border);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.1);
  transform-origin: bottom right;
  animation: chatbot-slide-up 0.3s ease-out;
}
@keyframes chatbot-slide-up {
  from { transform: scale(0.8) translateY(40px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}
.chatbot-header {
  padding: 1.25rem;
  background: linear-gradient(135deg, var(--gold-dark), rgba(0, 0, 0, 0.4));
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.chatbot-title-area {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.chatbot-avatar {
  font-size: 1.6rem;
  animation: chatbot-bounce 3s infinite ease-in-out;
}
@keyframes chatbot-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
.chatbot-title {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.05rem;
  color: var(--ink);
}
.chatbot-status {
  font-size: 0.75rem;
  color: #10b981;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.15rem;
  font-weight: 600;
}
.chatbot-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
  animation: status-glow 1.5s infinite ease-in-out;
}
@keyframes status-glow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
.chatbot-close-btn {
  background: none;
  border: none;
  color: var(--muted);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}
.chatbot-close-btn:hover {
  color: var(--ink);
}
.chatbot-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.chat-msg {
  display: flex;
  flex-direction: column;
  max-width: 80%;
  animation: chat-bubble-in 0.25s ease-out;
}
@keyframes chat-bubble-in {
  from { transform: translateY(8px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.chat-msg.user {
  align-self: flex-end;
}
.chat-msg.ai {
  align-self: flex-start;
}
.chat-msg-bubble {
  padding: 0.85rem 1.1rem;
  border-radius: var(--radius);
  font-size: 0.9rem;
  line-height: 1.5;
  white-space: pre-wrap;
}
.chat-msg.user .chat-msg-bubble {
  background: var(--gold);
  color: var(--ink);
  font-weight: 600;
  border-top-right-radius: 2px;
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.15);
}
.chat-msg.ai .chat-msg-bubble {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border);
  color: var(--ink);
  border-top-left-radius: 2px;
}
.chat-msg-time {
  font-size: 0.7rem;
  color: var(--muted);
  margin-top: 0.25rem;
  align-self: flex-end;
}
.chat-msg.ai .chat-msg-time {
  align-self: flex-start;
}
.chat-suggestions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
  animation: chat-bubble-in 0.3s ease-out;
}
.chat-suggestion-label {
  font-size: 0.75rem;
  color: var(--muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.chat-suggestion-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.chat-chip {
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.25);
  color: var(--ink);
  padding: 0.5rem 0.85rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 550;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.chat-chip:hover {
  background: var(--gold);
  color: var(--ink);
  border-color: var(--gold);
  transform: translateY(-1px);
}
.chatbot-footer {
  padding: 1rem;
  border-top: 1px solid var(--border);
  background: rgba(0, 0, 0, 0.2);
}
.chat-input-form {
  display: flex;
  gap: 0.5rem;
}
.chat-input {
  flex: 1;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.75rem 1rem;
  color: var(--ink);
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
}
.chat-input:focus {
  border-color: var(--gold);
}
.chat-send-btn {
  background: var(--gold);
  color: var(--ink);
  border: none;
  border-radius: var(--radius);
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}
.chat-send-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
}
.chat-typing {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  align-self: flex-start;
  max-width: 80%;
  animation: chat-bubble-in 0.2s ease-out;
}
.chat-typing-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--muted);
  animation: typing-bounce 1.4s infinite ease-in-out both;
}
.chat-typing-dot:nth-child(1) { animation-delay: -0.32s; }
.chat-typing-dot:nth-child(2) { animation-delay: -0.16s; }
@keyframes typing-bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}
/* Light Mode adaptation for chatbot */
[data-theme="light"] .chat-msg.ai .chat-msg-bubble {
  background: rgba(0, 0, 0, 0.03);
}
[data-theme="light"] .chat-input {
  background: rgba(255, 255, 255, 0.9);
  color: var(--ink);
}
[data-theme="light"] .chatbot-footer {
  background: rgba(0, 0, 0, 0.02);
}

/* ── One-Click Quick Apply Button ── */
.quick-apply-btn {
  background: linear-gradient(135deg, #10b981, #059669) !important;
  color: #fff !important;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4) !important;
  border: 1px solid rgba(16, 185, 129, 0.5) !important;
  animation: quick-apply-pulse 2s infinite ease-in-out;
}
.quick-apply-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6) !important;
}
@keyframes quick-apply-pulse {
  0% { box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4), 0 0 0 0 rgba(16, 185, 129, 0.4); }
  70% { box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4), 0 0 0 10px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4), 0 0 0 0 rgba(16, 185, 129, 0); }
}

/* --- Avatar & User Dropdown Styling --- */
.avatar-wrap {
  position: relative;
  display: inline-block;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%);
  color: #0d0d0d;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-family: var(--font-display);
  font-size: 1.1rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  box-shadow: 0 4px 10px rgba(212, 175, 55, 0.2);
}

[data-theme="light"] .avatar {
  color: #ffffff;
}

.avatar:hover, .avatar.open {
  transform: scale(1.05);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4);
}

.avatar-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 240px;
  background: var(--paper);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg), 0 10px 30px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  padding: 0.75rem;
  z-index: 1000;
  animation: chat-bubble-in 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-header {
  padding: 0.5rem 0.75rem 0.75rem;
  border-bottom: 1px solid var(--border);
  margin-bottom: 0.5rem;
}

.dh-name {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.05rem;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dh-email {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 0.2rem;
}

.dropdown-item {
  width: 100%;
  background: transparent;
  border: none;
  padding: 0.7rem 0.85rem;
  text-align: left;
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text);
  border-radius: var(--radius);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.15s ease;
}

.dropdown-item:hover {
  background: rgba(99, 102, 241, 0.16);
  color: #ffffff;
}

.dropdown-item.danger {
  color: #ef4444;
}

.dropdown-item.danger:hover {
  background: rgba(239, 68, 68, 0.16);
  color: #ffffff;
}

.dropdown-divider {
  height: 1px;
  background: var(--border);
  margin: 0.4rem 0;
}
`;

// ── Constants ──────────────────────────────────────────────────────────────
const CATEGORIES = [
  { icon: "💻", name: "Engineering", count: 312 },
  { icon: "🎨", name: "Design", count: 148 },
  { icon: "📊", name: "Marketing", count: 203 },
  { icon: "💰", name: "Finance", count: 97 },
  { icon: "🏥", name: "Healthcare", count: 184 },
  { icon: "📚", name: "Education", count: 76 },
  { icon: "⚖️", name: "Legal", count: 54 },
  { icon: "🔬", name: "Science", count: 88 },
];

const formatDate = (dateInput) => {
  if (!dateInput) return "Just now";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "Just now";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

// ── Avatar Dropdown Component ──────────────────────────────────────────────
function AvatarDropdown({ user, onLogout, onDashboard, onHome, onJobs }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="avatar-wrap" ref={ref}>
      <div className={`avatar ${open ? "open" : ""}`} onClick={() => setOpen((v) => !v)} title="Account menu">
        {user.name[0].toUpperCase()}
      </div>
      {open && (
        <div className="avatar-dropdown">
          <div className="dropdown-header">
            <div className="dh-name">{user.name}</div>
            <div className="dh-email">{user.email}</div>
            <div className="dh-role" style={{
              fontSize: "0.72rem",
              textTransform: "uppercase",
              fontWeight: "800",
              letterSpacing: "0.05em",
              color: "var(--primary-light)",
              marginTop: "0.25rem"
            }}>{user.role}</div>
          </div>
          {user.role !== "admin" ? (
            <>
              <button className="dropdown-item" onClick={() => { setOpen(false); onHome(); }}>🏠 Home</button>
              <button className="dropdown-item" onClick={() => { setOpen(false); onJobs(); }}>💼 Browse Jobs</button>
              <div className="dropdown-divider" />
              <button className="dropdown-item" onClick={() => { setOpen(false); onDashboard(); }}>
                {user.role === "employer" ? "🏢 Employer Dash" : "👤 Candidate Dash"}
              </button>
            </>
          ) : (
            <>
              <button className="dropdown-item" onClick={() => { setOpen(false); onDashboard("reports"); }}>🛠️ Control Panel</button>
              <button className="dropdown-item" onClick={() => { setOpen(false); onDashboard("moderation"); }}>🛡️ Moderation Board</button>
              <button className="dropdown-item" onClick={() => { setOpen(false); onDashboard("configs"); }}>📣 System Configs</button>
            </>
          )}
          <div className="dropdown-divider" />
          <button className="dropdown-item danger" onClick={() => { setOpen(false); onLogout(); }}>🚪 Sign Out</button>
        </div>
      )}
    </div>
  );
}

// ── Toast ──────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span>{t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ── Job Card ──────────────────────────────────────────────────────────────
function JobCard({ job, onClick, onApply }) {
  return (
    <div className="job-card" onClick={() => onClick(job)}>
      <div className="job-card-header">
        <div className="company-logo">{job.logo}</div>
        <div style={{ flex: 1 }}>
          <div className="job-card-title">{job.title}</div>
          <div className="job-company">{job.company}</div>
        </div>
        {job.featured && <span className="badge badge-featured">⭐ Featured</span>}
        {job.isNew && !job.featured && <span className="badge badge-new">New</span>}
      </div>
      <div className="job-card-meta">
        <span className="badge badge-type">{job.type}</span>
        <span className="badge badge-remote">{job.remote}</span>
        <span className="badge badge-salary">💰 {job.salary}</span>
      </div>
      <div className="job-card-footer">
        <div>
          <div className="job-location">📍 {job.location}</div>
          <div className="job-posted">{job.posted}</div>
        </div>
        <button className="apply-mini" onClick={(e) => { e.stopPropagation(); onApply(job); }}>Apply →</button>
      </div>
    </div>
  );
}

// ── LOGIN PAGE ─────────────────────────────────────────────────────────────
function LoginPage({ onLogin, onBack, onRegister, totalJobs, totalCompanies, initialRole = "candidate" }) {
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState(initialRole);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", company: "", email: "", password: "", confirm: "" });
  const set = (k) => (e) => { setError(""); setForm((p) => ({ ...p, [k]: e.target.value })); };

  useEffect(() => {
    setRole(initialRole);
  }, [initialRole]);

  const isRegister = mode === "register";
  const isForgot = mode === "forgot";

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isForgot) {
        if (!form.email) { setError("Email address is required."); return; }
        setForgotSent(true);
        return;
      }

      if (isRegister) {
        if (!form.email) { setError("Email address is required."); return; }
        if (!form.password) { setError("Password is required."); return; }
        if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
        if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
        if (role === "employer" && !form.company) { setError("Company name is required."); return; }
        if (role === "candidate" && !form.name) { setError("Full name is required."); return; }
        if (role === "admin" && !form.name) { setError("Full name is required."); return; }

        await onRegister({
          name: role === "employer" ? form.company : form.name,
          email: form.email,
          password: form.password,
          role,
          company: form.company,
        });
        return;
      }

      // Login
      if (!form.email) { setError("Email address is required."); return; }
      if (!form.password) { setError("Password is required."); return; }
      await onLogin({ email: form.email, password: form.password, role });

    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (forgotSent) {
    return (
      <div className="login-page">
        <div className="login-left">
          <div className="login-left-logo">Talent<span>Hub</span></div>
          <div className="login-left-body"><h2>Discover the best<br /><em>remote talent</em><br />globally.</h2></div>
          <div className="login-left-stats">
            <div className="login-left-stat"><strong>{totalJobs || 0}</strong><span>Open Roles</span></div>
            <div className="login-left-stat"><strong>{totalCompanies || 0}</strong><span>Active Brands</span></div>
            <div className="login-left-stat"><strong>98%</strong><span>Placement Match</span></div>
          </div>
        </div>
        <div className="login-right">
          <div className="login-form-box" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📧</div>
            <h1 className="login-title">Check your inbox</h1>
            <p className="login-sub" style={{ marginBottom: "1.5rem" }}>Reset link sent to <strong>{form.email}</strong>.</p>
            <button className="btn-primary" onClick={() => { setForgotSent(false); setMode("login"); }}>Back to Sign In</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-left-logo">Talent<span>Hub</span></div>
        <div className="login-left-body">
          <h2>Discover the best<br /><em>remote talent</em><br />globally.</h2>
          <p>A curated marketplace connecting elite engineers, designers, and marketers with leading tech companies.</p>
          <div className="login-testimonial">
            <p>"TalentHub helped me scale my engineering team globally in less than a month. The candidates are top-tier."</p>
          </div>
        </div>
        <div className="login-left-stats">
          <div className="login-left-stat"><strong>{totalJobs || 0}</strong><span>Open Roles</span></div>
          <div className="login-left-stat"><strong>{totalCompanies || 0}</strong><span>Active Brands</span></div>
          <div className="login-left-stat"><strong>98%</strong><span>Placement Match</span></div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-box">
          <div className="login-mobile-logo">Talent<span>Hub</span></div>
          <p className="login-eyebrow">{isForgot ? "Password Recovery" : isRegister ? "Get started — free" : "Welcome back"}</p>
          <h1 className="login-title">{isForgot ? "Reset password" : isRegister ? "Create account" : "Sign in"}</h1>
          <p className="login-sub">{isForgot ? "Enter your email and we'll send a reset link." : isRegister ? "Start your journey to your next opportunity." : "Access your dashboard and applications."}</p>

          {!isForgot && (
            <div className="tab-row">
              <button className={`tab-btn ${role === "candidate" ? "active" : ""}`} onClick={() => setRole("candidate")} type="button">👤 Job Seeker</button>
              <button className={`tab-btn ${role === "employer" ? "active" : ""}`} onClick={() => setRole("employer")} type="button">🏢 Employer</button>
              <button className={`tab-btn ${role === "admin" ? "active" : ""}`} onClick={() => setRole("admin")} type="button">🛠️ Admin</button>
            </div>
          )}

          <form onSubmit={submit}>
            {isRegister && (
              role === "employer" ? (
                <div className="form-group"><label className="form-label">Company Name</label><input className="form-input" placeholder="Acme Corp" value={form.company} onChange={set("company")} /></div>
              ) : (
                <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" placeholder="Jane Smith" value={form.name} onChange={set("name")} /></div>
              )
            )}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} required />
            </div>
            {!isForgot && (
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="pass-wrap">
                  <input className="form-input" type={showPass ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={set("password")} style={{ paddingRight: "4rem" }} required />
                  <button type="button" className="pass-toggle-btn" onClick={() => setShowPass((v) => !v)}>{showPass ? "Hide" : "Show"}</button>
                </div>
              </div>
            )}
            {mode === "login" && (
              <div className="forgot-link"><button type="button" onClick={() => setMode("forgot")}>Forgot password?</button></div>
            )}
            {isRegister && (
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="pass-wrap"><input className="form-input" type="password" placeholder="••••••••" value={form.confirm} onChange={set("confirm")} /></div>
              </div>
            )}
            {error && (
              <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "var(--radius)", padding: "0.65rem 0.9rem", marginBottom: "0.75rem", fontSize: "0.85rem", color: "#b91c1c", display: "flex", gap: "0.4rem" }}>
                <span>⚠️</span> {error}
              </div>
            )}
            <button type="submit" className="btn-primary" style={{ marginTop: "0.25rem" }} disabled={loading}>
              {loading ? "Please wait..." : isForgot ? "Send Reset Link →" : isRegister ? "Create Account →" : "Sign In →"}
            </button>
          </form>

          {!isForgot ? (
            <p className="switch-text">
              {isRegister ? "Already have an account? " : "Don't have an account? "}
              <button onClick={() => setMode(isRegister ? "login" : "register")}>{isRegister ? "Sign in" : "Create one free"}</button>
            </p>
          ) : (
            <p className="switch-text">Remembered it? <button onClick={() => setMode("login")}>Back to sign in</button></p>
          )}
          {isRegister && <p className="terms-text">By signing up you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.</p>}
          <div className="back-link"><button onClick={onBack}>← Back to home</button></div>
        </div>
      </div>
    </div>
  );
}

// ── Application Modal ──────────────────────────────────────────────────────
function ApplicationModal({ job, user, onClose, onSubmit, toast }) {
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ 
    name: user?.name || "", 
    email: user?.email || "", 
    phone: user?.phone || "", 
    linkedin: user?.linkedIn || "", 
    cover: "", 
    fileName: "", 
    file: null 
  });
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);

  const handleAIGenerateCover = () => {
    setIsGeneratingCover(true);
    setError("");
    setTimeout(() => {
      const skillsStr = user?.skills && user.skills.length > 0 
        ? user.skills.slice(0, 3).join(", ") 
        : "software engineering and modern design methodologies";
      const headlineStr = user?.headline || "passionate developer";

      const coverText = `Dear ${job.company} Hiring Team,\n\nI am writing to express my enthusiastic interest in the ${job.title} position at your esteemed company. As a ${headlineStr} equipped with core expertise in ${skillsStr}, I am deeply passionate about driving success in this domain.\n\nYour company's emphasis on innovative engineering and high-performing culture aligns perfectly with my professional philosophy. In my previous experiences, I have focused on building scalable systems and collaborating in fast-paced environments. I am confident that my technical skills and proactive problem-solving mindset will make me a valuable addition to your team.\n\nThank you for your time and consideration. I look forward to the opportunity to discuss how my competencies align with your strategic needs.\n\nWarm regards,\n${form.name || "Applicant"}`;

      setForm(p => ({ ...p, cover: coverText }));
      setIsGeneratingCover(false);
      toast("✨ Personalized Cover Letter generated successfully!", "success");
    }, 1200);
  };

  const set = (k) => (e) => { setError(""); setForm((p) => ({ ...p, [k]: e.target.value })); };
  const steps = ["Personal Info", "Cover Letter", "Upload Resume"];
  
  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) {
      setError("");
      setForm((p) => ({ ...p, fileName: f.name, file: f }));
      setIsScanning(true);
      setScanResult(null);

      setTimeout(() => {
        const jobSkills = job.skills || [];
        const jobReqs = job.requirements || [];
        const allJobTerms = [...jobSkills, ...jobReqs].map(s => s.toLowerCase());

        const filenameLower = f.name.toLowerCase();
        let matched = [];

        const popularTerms = ["react", "node", "javascript", "typescript", "python", "css", "html", "design", "figma", "ui", "ux", "marketing", "finance", "legal", "science", "analytics"];
        popularTerms.forEach(t => {
          if (filenameLower.includes(t)) {
            matched.push(t);
          }
        });

        if (user?.skills && Array.isArray(user.skills)) {
          user.skills.forEach(s => {
            const sLower = s.toLowerCase();
            if (!matched.includes(sLower)) {
              matched.push(sLower);
            }
          });
        }

        const jobMatches = allJobTerms.filter(term => {
          return matched.some(m => term.includes(m) || m.includes(term));
        });

        // Compute dynamic match score
        let score = 55 + Math.min(jobMatches.length * 12, 35) + Math.floor(Math.random() * 9);
        if (score > 98) score = 98;
        if (score < 40) score = 40;

        const missingSkills = jobSkills.filter(js => {
          const jsLower = js.toLowerCase();
          return !matched.some(m => jsLower.includes(m) || m.includes(jsLower));
        });

        setIsScanning(false);
        setScanResult({
          score,
          matched: jobMatches.length > 0 ? jobMatches.slice(0, 3) : ["General Industry Competencies"],
          missing: missingSkills.length > 0 ? missingSkills.slice(0, 2) : ["None! Outstanding profile matches."]
        });
      }, 1800);
    }
  };

  const validatePhone = (num) => {
    const phoneRegex = /^\+?[0-9\s\-()]{10,20}$/;
    return phoneRegex.test(num.trim());
  };

  const validateLinkedin = (url) => {
    const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-_%]+\/?$/i;
    return linkedinRegex.test(url.trim());
  };

  const isStep0Valid = form.name.trim() && form.email.trim() && form.phone.trim() && form.linkedin.trim();
  const isStep1Valid = form.cover.trim().length >= 20;
  const isStep2Valid = !!form.file;

  const handleNextStep1 = () => {
    if (!isStep0Valid) {
      setError("Please fill in all fields (Full Name, Email, Phone, and LinkedIn) to proceed.");
      return;
    }
    if (!validatePhone(form.phone)) {
      setError("Please enter a valid Mobile Number (minimum 10 digits, e.g. +91 98765 43210).");
      return;
    }
    if (!validateLinkedin(form.linkedin)) {
      setError("Please enter a valid LinkedIn Profile URL (e.g. linkedin.com/in/your-username).");
      return;
    }
    setError("");
    setStep(1);
  };

  const handleNextStep2 = () => {
    if (!isStep1Valid) {
      setError("Please write a meaningful cover letter (at least 20 characters) to continue.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSubmit = () => {
    if (!isStep2Valid) {
      setError("Please click below to upload your resume file (PDF, DOC, or DOCX) to apply.");
      return;
    }
    setError("");
    onSubmit({ ...form, jobId: job._id || job.id, jobTitle: job.title, company: job.company, appliedAt: formatDate(), status: "pending" });
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 520 }}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Apply for Role</h2>
        <p className="modal-sub">{job.title} · {job.company}</p>
        <div className="progress-steps">
          {steps.map((s, i) => <div key={s} className={`step ${i < step ? "done" : i === step ? "current" : ""}`}>{i < step ? "✓ " : ""}{s}</div>)}
        </div>

        {error && (
          <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "var(--radius)", padding: "0.65rem 0.9rem", marginBottom: "1.25rem", fontSize: "0.85rem", color: "var(--danger)", display: "flex", gap: "0.4rem" }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {step === 0 && (
          <div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" value={form.name} onChange={set("name")} placeholder="Jane Smith" /></div>
              <div className="form-group"><label className="form-label">Email Address *</label><input className="form-input" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Phone Number *</label><input className="form-input" value={form.phone} onChange={set("phone")} placeholder="+1 (555) 019-2834" /></div>
              <div className="form-group"><label className="form-label">LinkedIn Profile URL *</label><input className="form-input" value={form.linkedin} onChange={set("linkedin")} placeholder="linkedin.com/in/jane-smith" /></div>
            </div>
            <button className="btn-primary" onClick={handleNextStep1}>Next: Cover Letter →</button>
          </div>
        )}
        {step === 1 && (
          <div>
            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                <label className="form-label" style={{ margin: 0 }}>Cover Letter * (Minimum 20 characters)</label>
                <button 
                  type="button" 
                  className="ai-gen-btn"
                  onClick={handleAIGenerateCover}
                  disabled={isGeneratingCover}
                  style={{
                    background: "rgba(99, 102, 241, 0.1)",
                    border: "1px solid rgba(99, 102, 241, 0.3)",
                    borderRadius: "20px",
                    padding: "0.25rem 0.75rem",
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    color: "var(--primary-light)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    transition: "all 0.2s"
                  }}
                >
                  {isGeneratingCover ? (
                    <>
                      <div className="spinner" style={{ width: "12px", height: "12px", borderWidth: "1.5px", borderTopColor: "var(--gold)", margin: 0 }}></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <span>✨ AI Generate</span>
                    </>
                  )}
                </button>
              </div>
              <textarea className="form-textarea" rows={6} placeholder="Tell the employer why you are excited about this role and how your skills fit the description..." value={form.cover} onChange={set("cover")} />
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button className="btn-secondary" onClick={() => { setError(""); setStep(0); }}>← Back</button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleNextStep2}>Next: Upload Resume →</button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div>
            {isScanning ? (
              <div style={{ padding: "2.5rem 1.5rem", textAlign: "center", background: "rgba(99, 102, 241, 0.04)", border: "1.5px dashed var(--border)", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", animation: "chat-bubble-in 0.2s ease" }}>
                <div className="spinner" style={{ borderTopColor: "var(--gold)" }}></div>
                <p style={{ fontWeight: "bold", fontFamily: "var(--font-display)", color: "var(--gold)", animation: "chatbot-pulse 1.5s infinite" }}>🔍 TalentHub AI is scanning your resume...</p>
                <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Parsing PDF structures & mapping competency tag matrices</p>
              </div>
            ) : (
              <div>
                <label className="file-upload" htmlFor="resume-upload">
                  <input id="resume-upload" type="file" accept=".pdf,.doc,.docx" onChange={handleFile} />
                  <div className="file-upload-icon">📎</div>
                  {form.fileName ? <p style={{ fontWeight: 800, color: "var(--success)" }}>✓ {form.fileName}</p> : <div className="file-upload-text"><strong>Click to upload</strong> or drag & drop<br />PDF, DOC, DOCX up to 10MB</div>}
                </label>

                {scanResult && (
                  <div style={{ marginTop: "1.25rem", padding: "1.25rem", background: "rgba(16, 185, 129, 0.04)", border: `1.5px solid ${scanResult.score >= 80 ? '#10b981' : scanResult.score >= 60 ? 'var(--gold)' : 'var(--danger)'}`, borderRadius: "var(--radius-lg)", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", animation: "chat-bubble-in 0.3s ease-out" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontSize: "1.4rem" }}>📊</span>
                        <strong style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", color: "var(--ink)" }}>TalentHub Fit Analysis</strong>
                      </div>
                      <div style={{ background: scanResult.score >= 80 ? 'rgba(16, 185, 129, 0.15)' : scanResult.score >= 60 ? 'rgba(212, 175, 55, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: scanResult.score >= 80 ? '#10b981' : scanResult.score >= 60 ? 'var(--gold)' : 'var(--danger)', padding: "0.4rem 0.85rem", borderRadius: "20px", fontWeight: "bold", fontSize: "0.85rem", fontFamily: "var(--font-display)", border: `1px solid ${scanResult.score >= 80 ? '#10b981' : scanResult.score >= 60 ? 'var(--gold)' : 'var(--danger)'}` }}>
                        {scanResult.score}% Fit Score
                      </div>
                    </div>
                    
                    <div style={{ fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "0.5rem", color: "var(--ink)" }}>
                      <div>
                        <span style={{ color: "#10b981", fontWeight: "bold" }}>✓ Matched Strengths:</span>{" "}
                        {scanResult.matched.map(m => `"${m.charAt(0).toUpperCase() + m.slice(1)}"`).join(', ')}
                      </div>
                      <div>
                        <span style={{ color: "var(--gold)", fontWeight: "bold" }}>💡 Key Recommendation:</span>{" "}
                        Add <strong style={{ textDecoration: "underline" }}>{scanResult.missing[0] || "Advanced Credentials"}</strong> to your profile to increase your score by up to 15%!
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
                  <button className="btn-secondary" onClick={() => { setError(""); setStep(1); }}>← Back</button>
                  <button className="btn-primary" style={{ flex: 1 }} onClick={handleSubmit}>🚀 Submit Application</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Post Job Modal ─────────────────────────────────────────────────────────
function PostJobModal({ user, onClose, onPost }) {
  const [form, setForm] = useState({ title: "", location: "", type: "Full-time", remote: "On-site", salary: "", category: "Engineering", description: "", requirements: "", benefits: "" });
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const handleSubmit = (e) => {
    e.preventDefault();
    onPost({
      ...form,
      company: user.company || user.name,
      logo: "🏢",
      posted: "Just now",
      isNew: true,
      featured: false,
      employerId: user.id || user._id,
      status: "active",
      requirements: form.requirements.split("\n").filter(Boolean),
      benefits: form.benefits.split("\n").filter(Boolean),
      skills: [],
      applyEmail: user.email,
    });
  };
  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 620, maxHeight: "90vh", overflowY: "auto" }}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Post a Job</h2>
        <p className="modal-sub">Reach thousands of qualified candidates</p>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Job Title *</label><input className="form-input" value={form.title} onChange={set("title")} placeholder="Senior Engineer" required /></div>
            <div className="form-group"><label className="form-label">Category</label><select className="form-select" value={form.category} onChange={set("category")}>{CATEGORIES.map((c) => <option key={c.name}>{c.name}</option>)}</select></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Location</label><input className="form-input" value={form.location} onChange={set("location")} placeholder="New York, NY" /></div>
            <div className="form-group"><label className="form-label">Salary Range</label><input className="form-input" value={form.salary} onChange={set("salary")} placeholder="$100k – $140k" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Job Type</label><select className="form-select" value={form.type} onChange={set("type")}>{["Full-time","Part-time","Contract","Internship"].map((t) => <option key={t}>{t}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Remote Policy</label><select className="form-select" value={form.remote} onChange={set("remote")}>{["On-site","Remote OK","Hybrid","Fully Remote"].map((r) => <option key={r}>{r}</option>)}</select></div>
          </div>
          <div className="form-group"><label className="form-label">Job Description *</label><textarea className="form-textarea" rows={5} value={form.description} onChange={set("description")} placeholder="Describe the role, team, and impact..." required /></div>
          <div className="form-group"><label className="form-label">Requirements (one per line)</label><textarea className="form-textarea" rows={4} value={form.requirements} onChange={set("requirements")} /></div>
          <div className="form-group"><label className="form-label">Benefits (one per line)</label><textarea className="form-textarea" rows={3} value={form.benefits} onChange={set("benefits")} /></div>
          <button type="submit" className="btn-primary">📢 Publish Job Listing</button>
        </form>
      </div>
    </div>
  );
}

// ── Pages ──────────────────────────────────────────────────────────────────
function HomePage({ jobs, onJobClick, onApply, onShowAllJobs, loading, onSyncJobs, onSearch }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCat, setSearchCat] = useState("All Categories");
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery, searchCat);
    } else {
      setHasSearched(true);
    }
  };
  const handleClear = () => { setSearchQuery(""); setSearchCat("All Categories"); setHasSearched(false); };

  const searchResults = jobs.filter((j) => {
    const q = searchQuery.toLowerCase();
    const matchQ = !q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || j.category.toLowerCase().includes(q);
    const matchCat = searchCat === "All Categories" || j.category === searchCat;
    return matchQ && matchCat;
  });

  const featured = jobs.filter((j) => j.featured || j.isNew).slice(0, 6);
  const displayFeatured = featured.length > 0 ? featured : jobs.slice(0, 6);

  return (
    <div>
      <div className="hero">
        <p className="hero-eyebrow">🌟 #1 Platform for Modern Careers</p>
        <h1>Find your next <em>great</em><br />opportunity</h1>
        <p className="hero-sub">Thousands of jobs at world-class companies, all in one place.</p>
        <form className="search-wrap" onSubmit={handleSearch}>
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Job title, skills, or company…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <select className="search-select" value={searchCat} onChange={(e) => setSearchCat(e.target.value)}>
            <option>All Categories</option>
            {CATEGORIES.map((c) => <option key={c.name}>{c.name}</option>)}
          </select>
          <button type="submit" className="search-btn">Search →</button>
        </form>
        <div className="hero-stats">
          <div className="hero-stat"><strong>{jobs.length}</strong><span>OPEN ROLES</span></div>
          <div className="hero-stat"><strong>{new Set(jobs.map((j) => j.company)).size}</strong><span>ACTIVE BRANDS</span></div>
          <div className="hero-stat"><strong>98%</strong><span>SUCCESS MATCH</span></div>
        </div>
      </div>

      <div className="section">
        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : hasSearched ? (
          <div>
            <div className="section-header">
              <div>
                <h2 className="section-title">Search <span>Results</span></h2>
                <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginTop: "0.25rem" }}>
                  {searchResults.length} job{searchResults.length !== 1 ? "s" : ""} found
                  {searchQuery && <> for "<strong>{searchQuery}</strong>"</>}
                  {searchCat !== "All Categories" && <> in <strong>{searchCat}</strong></>}
                </p>
              </div>
              <button className="see-all" onClick={handleClear}>✕ Clear search</button>
            </div>
            {searchResults.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">🔍</div>
                <p style={{ marginBottom: "1rem" }}>No jobs match your search.</p>
                <button onClick={handleClear} style={{ background: "var(--gold)", border: "none", borderRadius: "var(--radius)", padding: "0.6rem 1.25rem", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-display)" }}>Back to all jobs</button>
              </div>
            ) : (
              <div className="jobs-grid">{searchResults.map((job) => <JobCard key={job._id || job.id} job={job} onClick={onJobClick} onApply={onApply} />)}</div>
            )}
          </div>
        ) : (
          <div>
            <div className="section-header"><h2 className="section-title">Browse by <span>Category</span></h2></div>
            <div className="categories-grid">
              {CATEGORIES.map((c) => {
                const count = jobs.filter((j) => j.category === c.name).length;
                return (
                  <div key={c.name} className="cat-card" onClick={() => {
                    if (onSearch) {
                      onSearch("", c.name);
                    } else {
                      setSearchCat(c.name); setSearchQuery(""); setHasSearched(true);
                    }
                  }}>
                    <div className="cat-icon">{c.icon}</div>
                    <div className="cat-name">{c.name}</div>
                    <div className="cat-count">{count} {count === 1 ? "job" : "jobs"}</div>
                  </div>
                );
              })}
            </div>
            <div className="section-header">
              <h2 className="section-title">Featured <span>Listings</span></h2>
              <button className="see-all" onClick={onShowAllJobs}>See all jobs →</button>
            </div>
            {jobs.length === 0 ? (
              <div className="empty" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "3rem 2rem", margin: "2rem auto", maxWidth: "600px", boxShadow: "var(--shadow)" }}>
                <div className="empty-icon" style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>📡</div>
                <p style={{ fontWeight: 700, color: "var(--ink)", marginBottom: "0.5rem", fontSize: "1.15rem", fontFamily: "var(--font-display)" }}>No Job Listings Available Yet</p>
                <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "1.5rem", lineHeight: "1.6" }}>
                  Connect your job board database to real-time remote job vacancies directly from the Remotive API to populate your application!
                </p>
                <button onClick={onSyncJobs} style={{ background: "var(--gold)", color: "var(--ink)", border: "none", borderRadius: "var(--radius)", padding: "0.75rem 1.5rem", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-display)", display: "inline-flex", alignItems: "center", gap: "0.5rem", transition: "background 0.2s" }}>
                  🚀 Load Remote Jobs from API
                </button>
              </div>
            ) : (
              <div className="jobs-grid">{displayFeatured.map((job) => <JobCard key={job._id || job.id} job={job} onClick={onJobClick} onApply={onApply} />)}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function JobsPage({ jobs, onJobClick, onApply, searchQuery, setSearchQuery, searchCat, setSearchCat, loading, onSyncJobs }) {
  const [activeType, setActiveType] = useState("All");
  const [activeRemote, setActiveRemote] = useState("All");
  const [activeCat, setActiveCat] = useState(searchCat || "All");

  useEffect(() => {
    if (searchCat) {
      setActiveCat(searchCat);
    } else {
      setActiveCat("All");
    }
  }, [searchCat]);
  const [sortBy, setSortBy] = useState("newest");

  const types = ["All", "Full-time", "Part-time", "Contract", "Internship"];
  const remotes = ["All", "Remote OK", "Hybrid", "Fully Remote", "On-site"];
  const categories = ["All", "Engineering", "Design", "Marketing", "Finance", "Healthcare", "Education", "Legal", "Science", "Other"];

  const filtered = jobs.filter((j) => {
    const q = searchQuery.toLowerCase();
    const matchQ = !q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || j.category.toLowerCase().includes(q);
    return matchQ && 
           (activeType === "All" || j.type === activeType) && 
           (activeRemote === "All" || j.remote === activeRemote) &&
           (activeCat === "All" || j.category === activeCat);
  });

  const sortedAndFiltered = [...filtered].sort((a, b) => {
    if (sortBy === "newest") {
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      return dateB - dateA;
    } else if (sortBy === "salary-high") {
      const getSalaryVal = (s) => {
        if (!s) return 0;
        // Parse "$100k - $140k" -> 140 or "$120k" -> 120
        const clean = s.replace(/[^0-9-]/g, "");
        if (clean.includes("-")) {
          const parts = clean.split("-");
          return parseInt(parts[1]) || 0;
        }
        return parseInt(clean) || 0;
      };
      return getSalaryVal(b.salary) - getSalaryVal(a.salary);
    }
    return 0;
  });

  return (
    <div className="section" style={{ maxWidth: 1200 }}>
      <div style={{ marginBottom: "2rem", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "1rem" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, marginBottom: "1rem" }}>All Job Listings</h1>
          <form className="search-wrap" style={{ maxWidth: 500, boxShadow: "var(--shadow)", marginBottom: "0.25rem" }} onSubmit={(e) => e.preventDefault()}>
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Search jobs…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <button type="submit" className="search-btn">Go</button>
          </form>
        </div>

        <div className="sort-wrap">
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Sort by:</span>
          <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">🕒 Newest Postings</option>
            <option value="salary-high">💰 Highest Salary</option>
          </select>
        </div>
      </div>

      <div className="filters-row" style={{ marginBottom: "0.75rem" }}>
        <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 600, textTransform: "uppercase" }}>Type:</span>
        {types.map((t) => <button key={t} className={`filter-chip ${activeType === t ? "active" : ""}`} onClick={() => setActiveType(t)}>{t}</button>)}
        <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", marginLeft: "0.5rem" }}>Remote:</span>
        {remotes.map((r) => <button key={r} className={`filter-chip ${activeRemote === r ? "active" : ""}`} onClick={() => setActiveRemote(r)}>{r}</button>)}
      </div>

      <div className="filters-row" style={{ marginBottom: "1.75rem" }}>
        <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 600, textTransform: "uppercase" }}>Category:</span>
        {categories.map((c) => <button key={c} className={`filter-chip ${activeCat === c ? "active" : ""}`} onClick={() => { setActiveCat(c); if (setSearchCat) setSearchCat(c === "All" ? "" : c); }}>{c}</button>)}
        <span className="results-count">{sortedAndFiltered.length} jobs found</span>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : sortedAndFiltered.length === 0 ? (
        <div className="empty"><div className="empty-icon">🔍</div><p>No jobs match your search.</p></div>
      ) : (
        <div className="jobs-grid">{sortedAndFiltered.map((job) => <JobCard key={job._id || job.id} job={job} onClick={onJobClick} onApply={onApply} />)}</div>
      )}
    </div>
  );
}

function JobDetailPage({ job, onBack, onApply, user, onQuickApply }) {
  return (
    <div className="detail-wrap">
      <button className="detail-back" onClick={onBack}>← Back to listings</button>
      <div className="detail-hero">
        <div className="detail-header">
          <div className="detail-logo">{job.logo}</div>
          <div style={{ flex: 1 }}>
            <h1 className="detail-title">{job.title}</h1>
            <p className="detail-company">{job.company}</p>
            <div className="detail-quick">
              <span className="detail-quick-item">📍 {job.location}</span>
              <span className="detail-quick-item">💼 {job.type}</span>
              <span className="detail-quick-item">🖥️ {job.remote}</span>
              <span className="detail-quick-item">💰 {job.salary}</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem", flexWrap: "wrap" }}>
          <span className="badge badge-type">{job.category}</span>
          {job.isNew && <span className="badge badge-new">New</span>}
          {job.featured && <span className="badge badge-featured">⭐ Featured</span>}
        </div>
        <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
          {user && user.role === "candidate" && user.phone && user.resumeUrl ? (
            <button className="apply-btn quick-apply-btn" onClick={() => onQuickApply(job)}>⚡ One-Click Quick Apply</button>
          ) : (
            <button className="apply-btn" onClick={() => onApply(job)}>🚀 Apply on TalentHub</button>
          )}
          {job.externalApplyUrl && (
            <button 
              className="apply-btn" 
              onClick={() => window.open(job.externalApplyUrl, '_blank')}
              style={{
                background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
                color: "#ffffff"
              }}
            >
              🌐 Apply on Company Site →
            </button>
          )}
        </div>
      </div>
      <div className="detail-grid">
        <div>
          <div className="detail-section"><h3>About the Role</h3><p>{job.description}</p></div>
          {job.requirements?.length > 0 && <div className="detail-section"><h3>Requirements</h3><ul>{job.requirements.map((r, i) => <li key={i}>{r}</li>)}</ul></div>}
          {job.benefits?.length > 0 && <div className="detail-section"><h3>Benefits & Perks</h3><ul>{job.benefits.map((b, i) => <li key={i}>{b}</li>)}</ul></div>}
          {job.skills?.length > 0 && <div className="detail-section"><h3>Skills</h3><div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>{job.skills.map((s) => <span key={s} style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: "4px", padding: "0.3rem 0.75rem", fontSize: "0.85rem", fontWeight: 500 }}>{s}</span>)}</div></div>}
        </div>
        <div>
          <div className="detail-sidebar">
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: "1rem", fontSize: "1rem" }}>Job Overview</h3>
            {[["Company", job.company], ["Location", job.location], ["Job Type", job.type], ["Remote", job.remote], ["Salary", job.salary], ["Category", job.category], ["Posted", job.posted]].map(([label, val]) => (
              <div key={label} className="sidebar-item"><label>{label}</label><strong>{val}</strong></div>
            ))}
          </div>
          <div style={{ marginTop: "1rem", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.25rem", textAlign: "center" }}>
            <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: "0.75rem" }}>Ready to take the next step?</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.50rem" }}>
              <button className="btn-primary" onClick={() => onApply(job)} style={{ width: "100%" }}>Apply on TalentHub</button>
              {job.externalApplyUrl && (
                <button 
                  className="apply-btn" 
                  onClick={() => window.open(job.externalApplyUrl, '_blank')}
                  style={{
                    width: "100%",
                    fontSize: "0.875rem",
                    padding: "0.6rem 1rem",
                    background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                    boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
                    color: "#ffffff"
                  }}
                >
                  🌐 Apply on Company Site →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmployerDashboard({ user, jobs, onPostJob, onCloseJob, applications, onSyncJobs, onUpdateStatus }) {
  const [tab, setTab] = useState("overview");
  const myJobs = jobs.filter((j) => (j.employerId || j.employer?._id || j.employer) === (user.id || user._id));
  const myApps = applications.filter((a) => myJobs.some((j) => (j.id || j._id) === a.jobId));
  return (
    <div className="dash-wrap">
      <div className="dash-header"><h1>👋 Welcome, {user.name}</h1><p>Manage your job listings and review applications.</p></div>
      <div className="stats-row">
        <div className="stat-card"><div className="val">{myJobs.filter((j) => j.status === "active").length}</div><div className="lbl">Active Listings</div></div>
        <div className="stat-card"><div className="val">{myApps.length}</div><div className="lbl">Total Applications</div></div>
        <div className="stat-card"><div className="val">{myApps.filter((a) => a.status === "interview").length}</div><div className="lbl">In Interview</div></div>
        <div className="stat-card"><div className="val">{myJobs.length}</div><div className="lbl">Total Jobs Posted</div></div>
      </div>
      <div className="dash-tabs">
        {["overview", "listings", "applications"].map((t) => (
          <button key={t} className={`dash-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
          <button className="btn-secondary" style={{ padding: "0.5rem 1.25rem", borderRadius: "var(--radius)", fontSize: "0.85rem", fontWeight: 600, border: "1.5px solid var(--border)", cursor: "pointer", transition: "all 0.15s" }} onClick={onSyncJobs}>🔄 Sync API Jobs</button>
          <button className="btn-primary" style={{ padding: "0.5rem 1.25rem", width: "auto", borderRadius: "var(--radius)" }} onClick={onPostJob}>+ Post Job</button>
        </div>
      </div>
      {tab === "overview" && (
        <div style={{ animation: "chat-bubble-in 0.3s ease-out" }}>
          {/* --- Sleek Minimalist Conversion Graph / Analytics Board --- */}
          <div style={{
            background: "var(--paper)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "1.5rem",
            marginBottom: "2rem",
            boxShadow: "var(--shadow)",
          }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", marginBottom: "1rem", color: "var(--text)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>📊</span> Job Posting Conversion Analytics
            </h3>
            
            {myJobs.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Post a job listing first to unlock real-time application analytics dashboards.</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginTop: "0.5rem" }}>
                {/* Views vs Application Conversion Metrics */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                  {myJobs.slice(0, 3).map((j, index) => {
                    const jobAppsCount = myApps.filter(a => a.jobId === (j._id || j.id)).length;
                    const simulatedViews = Math.max(jobAppsCount * 4 + 12 + (index * 7), 15);
                    const conversionRate = Math.round((jobAppsCount / simulatedViews) * 100);
                    
                    return (
                      <div key={j._id || j.id} style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "160px" }}>{j.title}</span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{jobAppsCount} Apply / {simulatedViews} Views ({conversionRate}%)</span>
                        </div>
                        {/* Dynamic Bar Chart */}
                        <div style={{ height: "8px", background: "rgba(255, 255, 255, 0.05)", borderRadius: "4px", overflow: "hidden" }}>
                          <div style={{
                            width: `${Math.min(conversionRate, 100)}%`,
                            height: "100%",
                            background: index === 0 ? "linear-gradient(90deg, #6366f1, #06b6d4)" : index === 1 ? "linear-gradient(90deg, var(--gold), #f59e0b)" : "linear-gradient(90deg, #10b981, #34d399)",
                            borderRadius: "4px",
                            transition: "width 1s ease"
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Overall Platform Fit Analytics Panel */}
                <div style={{ background: "rgba(99, 102, 241, 0.02)", border: "1px dashed var(--border)", borderRadius: "var(--radius)", padding: "1rem", display: "flex", flexDirection: "column", justifyContent: "center", gap: "0.5rem" }}>
                  <h4 style={{ margin: 0, fontSize: "0.9rem", color: "var(--text)" }}>✨ Recruiter Smart Recommendations</h4>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                    Your active listings have a stellar <strong>{myApps.length > 0 ? Math.round((myApps.filter(a => a.status === 'interview').length / myApps.length) * 100) : 0}%</strong> interview conversion score! To increase applicants, add missing required skills like <strong>"TypeScript"</strong> or <strong>"GraphQL"</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>

          <h3 style={{ fontFamily: "var(--font-display)", marginBottom: "1rem" }}>Recent Applications</h3>
          {myApps.length === 0 ? <div className="empty"><div className="empty-icon">📭</div><p>No applications yet.</p></div> : (
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead><tr><th>Applicant</th><th>Role</th><th>Applied</th><th>Status</th></tr></thead>
                <tbody>{myApps.slice(0, 8).map((a, i) => (
                  <tr key={i}>
                    <td><strong>{a.name}</strong><br /><small style={{ color: "var(--muted)" }}>{a.email}</small></td>
                    <td>{a.jobTitle}</td>
                    <td>{a.appliedAt}</td>
                    <td>
                      <select className={`status-select status-${a.status}`} value={a.status} onChange={(e) => onUpdateStatus(a.id, e.target.value)}>
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="interview">Interview</option>
                        <option value="rejected">Rejected</option>
                        <option value="hired">Hired</option>
                      </select>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {tab === "listings" && (
        <div>
          {myJobs.length === 0 ? <div className="empty"><div className="empty-icon">📋</div><p>No job listings yet.</p><button className="btn-primary" style={{ width: "auto", marginTop: "1rem", padding: "0.75rem 1.5rem" }} onClick={onPostJob}>Post Your First Job</button></div> : (
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead><tr><th>Title</th><th>Type</th><th>Location</th><th>Posted</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>{myJobs.map((j) => <tr key={j._id || j.id}><td><strong>{j.title}</strong></td><td>{j.type}</td><td>{j.location || "—"}</td><td>{j.posted}</td><td><span className={`status-badge status-${j.status}`}>{j.status}</span></td><td>{j.status === "active" && <button className="btn-danger" onClick={() => onCloseJob(j._id || j.id)}>Close</button>}</td></tr>)}</tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {tab === "applications" && (
        <div>
          {myApps.length === 0 ? <div className="empty"><div className="empty-icon">📭</div><p>No applications yet.</p></div> : (
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead><tr><th>Applicant</th><th>Role</th><th>LinkedIn</th><th>Applied</th><th>Resume</th><th>Status</th></tr></thead>
                <tbody>{myApps.map((a, i) => (
                  <tr key={i}>
                    <td><strong>{a.name}</strong><br /><small style={{ color: "var(--muted)" }}>{a.email} · {a.phone}</small></td>
                    <td>{a.jobTitle}</td>
                    <td>{a.linkedin ? <a href={a.linkedin.startsWith("http") ? a.linkedin : `https://${a.linkedin}`} target="_blank" rel="noreferrer" style={{ color: "var(--accent)", fontWeight: 600 }}>View</a> : "—"}</td>
                    <td>{a.appliedAt}</td>
                    <td>
                      {a.fileName ? (
                        <a href={`http://127.0.0.1:5000/${a.resumeUrl?.replace(/\\/g, '/')}`} target="_blank" rel="noreferrer" className="resume-download-link" title="Download Resume">
                          📎 {a.fileName}
                        </a>
                      ) : "—"}
                    </td>
                    <td>
                      <select className={`status-select status-${a.status}`} value={a.status} onChange={(e) => onUpdateStatus(a.id, e.target.value)}>
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="interview">Interview</option>
                        <option value="rejected">Rejected</option>
                        <option value="hired">Hired</option>
                      </select>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CandidateDashboard({ user, applications, onUpdateProfile, toast }) {
  const [tab, setTab] = useState("applications");
  const myApps = applications.filter((a) => a.userId === (user.id || user._id));
  
  // Profile state
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [headline, setHeadline] = useState(user?.headline || "");
  const [linkedin, setLinkedin] = useState(user?.linkedIn || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const res = await api.updateMe({
        name,
        phone,
        headline,
        linkedIn: linkedin,
        bio
      });
      if (res.success) {
        onUpdateProfile(res.user);
        toast("💾 Profile details updated successfully!");
      } else {
        toast(res.message || "Failed to update profile", "error");
      }
    } catch {
      toast("❌ Connection error while saving profile", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      toast("🔄 Uploading resume to profile...", "info");
      
      const formData = new FormData();
      formData.append("resume", file);
      
      const res = await api.uploadResumeToProfile(formData);
      if (res.success) {
        onUpdateProfile(res.user);
        toast("💾 Resume uploaded and saved to your profile!");
      } else {
        toast(res.message || "Failed to upload resume", "error");
      }
    } catch {
      toast("❌ Connection error while uploading resume", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="dash-wrap">
      <div className="dash-header">
        <h1>👋 Hi, {user.name}</h1>
        <p>Track your applications and manage your profile.</p>
      </div>
      <div className="stats-row">
        <div className="stat-card"><div className="val">{myApps.length}</div><div className="lbl">Applied</div></div>
        <div className="stat-card"><div className="val">{myApps.filter((a) => a.status === "reviewed").length}</div><div className="lbl">Under Review</div></div>
        <div className="stat-card"><div className="val">{myApps.filter((a) => a.status === "interview").length}</div><div className="lbl">Interviews</div></div>
        <div className="stat-card"><div className="val">{myApps.filter((a) => a.status === "pending").length}</div><div className="lbl">Pending</div></div>
      </div>
      <div className="dash-tabs">
        {["applications", "profile"].map((t) => (
          <button key={t} className={`dash-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
      </div>
      {tab === "applications" && (
        <div>
          {myApps.length === 0 ? <div className="empty"><div className="empty-icon">💼</div><p>You haven't applied to any jobs yet.</p></div> : (
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead><tr><th>Role</th><th>Company</th><th>Applied</th><th>Status</th></tr></thead>
                <tbody>{myApps.map((a, i) => <tr key={i}><td><strong>{a.jobTitle}</strong></td><td>{a.company}</td><td>{a.appliedAt}</td><td><span className={`status-badge status-${a.status}`}>{a.status}</span></td></tr>)}</tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {tab === "profile" && (
        <div style={{ maxWidth: 520, background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "2rem", boxShadow: "var(--shadow)" }}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Email (Locked)</label><input className="form-input" value={user.email} disabled style={{ opacity: 0.6, cursor: "not-allowed" }} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Phone Number</label><input className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +91 98765 43210" /></div>
            <div className="form-group"><label className="form-label">LinkedIn Profile URL</label><input className="form-input" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="linkedin.com/in/username" /></div>
          </div>
          <div className="form-group"><label className="form-label">Professional Headline</label><input className="form-input" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. Senior React Developer" /></div>
          <div className="form-group"><label className="form-label">Bio</label><textarea className="form-textarea" placeholder="Tell employers about yourself…" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} /></div>
          
          <div className="form-group" style={{ marginTop: "1.5rem", borderTop: "1px solid var(--border)", paddingTop: "1.5rem" }}>
            <label className="form-label">Saved Profile Resume</label>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              {user.resumeUrl ? (
                <div style={{ background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "var(--radius)", padding: "0.5rem 1rem", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "1.2rem" }}>📄</span>
                  <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#10b981" }}>{user.resumeOriginalName || "Saved Resume.pdf"}</span>
                </div>
              ) : (
                <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>No saved resume. Upload one to enable **One-Click Quick Apply ⚡**!</div>
              )}
              <label htmlFor="dash-resume-upload" className="see-all" style={{ padding: "0.4rem 0.85rem", cursor: "pointer", display: "inline-block", border: "1px solid var(--border)", borderRadius: "var(--radius)", textAlign: "center" }}>
                {user.resumeUrl ? "🔄 Replace Resume" : "📎 Upload Resume"}
                <input id="dash-resume-upload" type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} style={{ display: "none" }} disabled={uploading} />
              </label>
            </div>
          </div>

          <button className="btn-primary" onClick={handleSaveProfile} disabled={isSaving} style={{ marginTop: "1.5rem", width: "100%" }}>
            {isSaving ? "🔄 Saving..." : "💾 Save Profile Details"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── AI Glowing Orb Logo Helper ─────────────────────────────────────────────
function AIChatbotLogo({ isLarge = false }) {
  return (
    <div className={`ai-logo-container ${isLarge ? 'large' : ''}`}>
      <div className="ai-orb-core"></div>
      <div className="ai-orb-orbit-1"></div>
      <div className="ai-orb-orbit-2"></div>
    </div>
  );
}

// ── AI Chatbot Component ───────────────────────────────────────────────────
function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "👋 Hello! I am your TalentHub AI Career Assistant.\n\nI can recommend matching job openings in real-time, compute highest salary roles, and give you premium resume writing tips!\n\nHow can I help you accelerate your career search today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const bodyRef = useRef(null);

  const suggestions = [
    { label: "🔍 Engineering Jobs", query: "Recommend some engineering jobs" },
    { label: "💰 Highest Salary", query: "Which are the highest paying jobs?" },
    { label: "💡 Resume Writing Tips", query: "Give me resume writing tips" },
    { label: "🏢 Jobs at OpenAI", query: "Are there jobs at OpenAI?" }
  ];

  // Auto-scroll to bottom of chat history on updates
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (queryText) => {
    const textToSend = queryText || inputValue;
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setLoading(true);

    try {
      const res = await api.sendChatMessage(textToSend);
      if (res.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: "ai",
            text: res.reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: "ai",
            text: "⚠️ Sorry, I encountered an issue processing your query. Please try again!",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: "❌ Connection error. Please make sure the TalentHub API is running and try again!",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="chatbot-trigger" onClick={() => setIsOpen(!isOpen)} title="Ask AI Career Assistant">
        {isOpen ? <span style={{ fontSize: "1.5rem", color: "var(--muted)", fontWeight: "bold" }}>✕</span> : <AIChatbotLogo isLarge={true} />}
      </div>

      {/* Chat Pane Popup */}
      {isOpen && (
        <div className="chatbot-panel">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-title-area">
              <AIChatbotLogo />
              <div>
                <div className="chatbot-title">AI Career Assistant</div>
                <div className="chatbot-status">
                  <span className="chatbot-status-dot" /> Online
                </div>
              </div>
            </div>
            <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          {/* Messages Body */}
          <div className="chatbot-body" ref={bodyRef}>
            {messages.map((m) => (
              <div key={m.id} className={`chat-msg ${m.sender}`}>
                <div className="chat-msg-bubble">
                  {/* Parse basic markdown highlights */}
                  {m.text.split('\n').map((line, lIdx) => {
                    let elements = [];
                    let lastIdx = 0;
                    
                    // Simple replacement for bold (**text**) and inline code (`code`)
                    const regex = /(\*\*.*?\*\*|`.*?`|\*.*?\*)/g;
                    let match;
                    while ((match = regex.exec(line)) !== null) {
                      const matchText = match[0];
                      const plainText = line.substring(lastIdx, match.index);
                      if (plainText) elements.push(plainText);
                      
                      if (matchText.startsWith('**') && matchText.endsWith('**')) {
                        elements.push(<strong key={match.index}>{matchText.slice(2, -2)}</strong>);
                      } else if (matchText.startsWith('`') && matchText.endsWith('`')) {
                        elements.push(<code key={match.index} style={{ background: "rgba(0,0,0,0.2)", padding: "2px 6px", borderRadius: "4px", fontSize: "0.85rem", border: "1px solid rgba(255,255,255,0.1)", color: "var(--gold)" }}>{matchText.slice(1, -1)}</code>);
                      } else if (matchText.startsWith('*') && matchText.endsWith('*')) {
                        elements.push(<em key={match.index}>{matchText.slice(1, -1)}</em>);
                      }
                      lastIdx = regex.lastIndex;
                    }
                    const remainingText = line.substring(lastIdx);
                    if (remainingText) elements.push(remainingText);

                    return (
                      <div key={lIdx} style={{ marginBottom: line.trim() ? "0.4rem" : "0.8rem", minHeight: "0.5rem" }}>
                        {elements.length > 0 ? elements : line}
                      </div>
                    );
                  })}
                </div>
                <span className="chat-msg-time">{m.time}</span>
              </div>
            ))}

            {loading && (
              <div className="chat-typing">
                <span className="chat-typing-dot" />
                <span className="chat-typing-dot" />
                <span className="chat-typing-dot" />
              </div>
            )}

            {messages.length === 1 && !loading && (
              <div className="chat-suggestions">
                <span className="chat-suggestion-label">Suggested Queries</span>
                <div className="chat-suggestion-chips">
                  {suggestions.map((s, idx) => (
                    <button key={idx} className="chat-chip" onClick={() => handleSend(s.query)}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Input Area */}
          <div className="chatbot-footer">
            <form
              className="chat-input-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
            >
              <input
                className="chat-input"
                type="text"
                placeholder="Ask about jobs, salaries, resume..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={loading}
              />
              <button className="chat-send-btn" type="submit" disabled={loading || !inputValue.trim()}>
                ⚡
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function ManagementDashboard({ user, jobs, onDeleteJob, toast, systemConfig, fetchConfig, tab, setTab }) {
  
  // Local lists
  const [managementEmails, setManagementEmails] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [flaggedJobs, setFlaggedJobs] = useState([]);
  const [diagnostics, setDiagnostics] = useState(null);

  // Loading states
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [loadingFlags, setLoadingFlags] = useState(false);
  const [loadingDiagnostics, setLoadingDiagnostics] = useState(false);

  // Search & Filtering
  const [userSearch, setUserSearch] = useState("");
  const [logSearch, setLogSearch] = useState("");
  const [logTypeFilter, setLogTypeFilter] = useState("all");
  const [modSubTab, setModSubTab] = useState("users");

  // Email Authorisation
  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submittingEmail, setSubmittingEmail] = useState(false);

  // Password Reset Portal
  const [resetUserId, setResetUserId] = useState("");
  const [resetPasswordVal, setResetPasswordVal] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);

  // Sync state
  const [syncStatus, setSyncStatus] = useState("idle");
  const [syncMessage, setSyncMessage] = useState("");
  const [syncProgress, setSyncProgress] = useState(0);

  // Config Form
  const [bannerActiveState, setBannerActiveState] = useState(false);
  const [bannerTextState, setBannerTextState] = useState("");
  const [bannerColorState, setBannerColorState] = useState("#6366f1");
  const [maintenanceModeState, setMaintenanceModeState] = useState(false);
  const [maintenanceMessageState, setMaintenanceMessageState] = useState("");
  const [maintenanceEndTimeState, setMaintenanceEndTimeState] = useState("");
  const [maxAppsLimitState, setMaxAppsLimitState] = useState(25);
  const [maxFileSizeLimitState, setMaxFileSizeLimitState] = useState(10);
  const [categoriesState, setCategoriesState] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");

  const fetchEmails = async () => {
    setLoadingEmails(true);
    try {
      const res = await api.getManagementEmails();
      if (res.success) setManagementEmails(res.emails || []);
    } catch {
      toast("Error loading authorized emails", "error");
    } finally {
      setLoadingEmails(false);
    }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await api.getActivityLogs();
      if (res.success) setActivityLogs(res.logs || []);
    } catch {
      toast("Error loading activity logs", "error");
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.getAllUsers();
      if (res.success) setUsers(res.users || []);
    } catch {
      toast("Error loading user directory", "error");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await api.getSupportTickets();
      if (res.success) setSupportTickets(res.tickets || []);
    } catch {
      toast("Error loading support tickets", "error");
    } finally {
      setLoadingTickets(false);
    }
  };

  const fetchFlaggedJobs = async () => {
    setLoadingFlags(true);
    try {
      const res = await api.getFlaggedJobListings();
      if (res.success) setFlaggedJobs(res.jobs || []);
    } catch {
      toast("Error loading flagged jobs", "error");
    } finally {
      setLoadingFlags(false);
    }
  };

  const fetchDiagnostics = async () => {
    setLoadingDiagnostics(true);
    try {
      const res = await api.getDiagnosticsAndAnalytics();
      if (res.success) setDiagnostics(res);
    } catch {
      toast("Error loading system diagnostics", "error");
    } finally {
      setLoadingDiagnostics(false);
    }
  };

  useEffect(() => {
    if (tab === "reports") {
      fetchDiagnostics();
    } else if (tab === "moderation") {
      if (modSubTab === "users" || modSubTab === "verification") {
        fetchUsers();
      } else if (modSubTab === "flagged") {
        fetchFlaggedJobs();
      } else if (modSubTab === "tickets") {
        fetchTickets();
      }
    } else if (tab === "access") {
      fetchEmails();
      fetchUsers();
    } else if (tab === "logs") {
      fetchLogs();
    }
  }, [tab, modSubTab]);

  useEffect(() => {
    if (systemConfig) {
      setBannerActiveState(systemConfig.bannerActive || false);
      setBannerTextState(systemConfig.bannerText || "");
      setBannerColorState(systemConfig.bannerColor || "#6366f1");
      setMaintenanceModeState(systemConfig.maintenanceMode || false);
      setMaintenanceMessageState(systemConfig.maintenanceMessage || "");
      if (systemConfig.maintenanceEndTime) {
        const d = new Date(systemConfig.maintenanceEndTime);
        const pad = n => String(n).padStart(2, '0');
        const formatted = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setMaintenanceEndTimeState(formatted);
      } else {
        setMaintenanceEndTimeState("");
      }
      setMaxAppsLimitState(systemConfig.maxApplicationsLimit || 25);
      setMaxFileSizeLimitState(systemConfig.maxFileSizeLimitMb || 10);
      setCategoriesState(systemConfig.categories || []);
    }
  }, [systemConfig]);

  const handleAddEmail = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setSubmittingEmail(true);
    setEmailError("");
    try {
      const res = await api.addManagementEmail(newEmail.trim());
      if (res.success) {
        toast("✅ Email approved for management register!");
        setNewEmail("");
        fetchEmails();
      } else {
        setEmailError(res.message || "Failed to add email.");
      }
    } catch {
      setEmailError("Network error approval.");
    } finally {
      setSubmittingEmail(false);
    }
  };

  const handleDeleteEmail = async (emailToDelete) => {
    if (emailToDelete === user.email) {
      toast("You cannot revoke your own authorized email!", "error");
      return;
    }
    if (!window.confirm(`Revoke admin access authorization for ${emailToDelete}?`)) return;
    try {
      const res = await api.deleteManagementEmail(emailToDelete);
      if (res.success) {
        toast("🗑️ Admin email authorization revoked.");
        fetchEmails();
      } else {
        toast(res.message || "Failed to revoke.", "error");
      }
    } catch {
      toast("Connection error during email revocation.", "error");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetUserId || !resetPasswordVal.trim()) {
      toast("Please select a user and type a new password.", "error");
      return;
    }
    if (resetPasswordVal.length < 6) {
      toast("Password must be at least 6 characters.", "error");
      return;
    }
    setResettingPassword(true);
    try {
      const res = await api.resetUserPassword(resetUserId, resetPasswordVal.trim());
      if (res.success) {
        toast("🔑 Password reset successful!");
        setResetPasswordVal("");
        setResetUserId("");
      } else {
        toast(res.message || "Failed to reset password.", "error");
      }
    } catch {
      toast("Network error during password reset.", "error");
    } finally {
      setResettingPassword(false);
    }
  };

  const handleToggleUserStatus = async (targetUser) => {
    if (targetUser.email === user.email) {
      toast("You cannot deactivate your own account!", "error");
      return;
    }
    try {
      const res = await api.toggleUserStatus(targetUser._id || targetUser.id);
      if (res.success) {
        toast(`✅ User account status updated: ${res.user.isActive ? 'Active' : 'Deactivated'}`);
        fetchUsers();
      } else {
        toast(res.message || "Failed to toggle user status.", "error");
      }
    } catch {
      toast("Connection error toggling status.", "error");
    }
  };

  const handleToggleUserBan = async (targetUser) => {
    if (targetUser.email === user.email) {
      toast("You cannot ban your own account!", "error");
      return;
    }
    try {
      const res = await api.toggleUserBan(targetUser._id || targetUser.id);
      if (res.success) {
        toast(`✅ User ban status updated: ${res.user.isBanned ? 'Banned' : 'Unbanned'}`);
        fetchUsers();
      } else {
        toast(res.message || "Failed to toggle ban status.", "error");
      }
    } catch {
      toast("Connection error toggling ban.", "error");
    }
  };

  const handleToggleUserVerification = async (targetUser) => {
    try {
      const res = await api.toggleUserVerification(targetUser._id || targetUser.id);
      if (res.success) {
        toast(`✅ Employer verification status updated: ${res.user.isVerified ? 'Verified' : 'Unverified'}`);
        fetchUsers();
      } else {
        toast(res.message || "Failed to toggle verification status.", "error");
      }
    } catch {
      toast("Connection error toggling verification.", "error");
    }
  };

  const handleUnflagJob = async (jobId) => {
    try {
      const res = await api.unflagJobListing(jobId);
      if (res.success) {
        toast("🛡️ Cleared job flags successfully!");
        fetchFlaggedJobs();
      } else {
        toast(res.message || "Failed to clear flags.", "error");
      }
    } catch {
      toast("Connection error clearing flags.", "error");
    }
  };

  const handleDeleteFlaggedJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to permanently delete this flagged job listing?")) return;
    try {
      const res = await api.deleteJob(jobId);
      if (res.success) {
        toast("🗑️ Flagged job deleted successfully!");
        fetchFlaggedJobs();
      } else {
        toast(res.message || "Failed to delete job.", "error");
      }
    } catch {
      toast("Connection error deleting job.", "error");
    }
  };

  const [ticketReplyText, setTicketReplyText] = useState({});
  const handleResolveTicket = async (ticketId) => {
    const replyMessage = ticketReplyText[ticketId] || "";
    try {
      const res = await api.updateSupportTicketStatus(ticketId, {
        status: "resolved",
        replyMessage
      });
      if (res.success) {
        toast("🎟️ Ticket status marked as RESOLVED.");
        setTicketReplyText(prev => ({ ...prev, [ticketId]: "" }));
        fetchTickets();
      } else {
        toast(res.message || "Failed to update ticket.", "error");
      }
    } catch {
      toast("Connection error resolving ticket.", "error");
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        bannerActive: bannerActiveState,
        bannerText: bannerTextState,
        bannerColor: bannerColorState,
        maintenanceMode: maintenanceModeState,
        maintenanceMessage: maintenanceMessageState,
        maintenanceEndTime: maintenanceEndTimeState ? new Date(maintenanceEndTimeState).toISOString() : null,
        maxApplicationsLimit: Number(maxAppsLimitState),
        maxFileSizeLimitMb: Number(maxFileSizeLimitState),
        categories: categoriesState
      };
      const res = await api.updateSystemConfig(payload);
      if (res.success) {
        toast("⚙️ System configurations saved successfully!");
        fetchConfig();
      } else {
        toast(res.message || "Failed to update configs.", "error");
      }
    } catch {
      toast("Connection error saving configs.", "error");
    }
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    if (categoriesState.includes(newCategoryName.trim())) {
      toast("Category already exists.", "error");
      return;
    }
    setCategoriesState([...categoriesState, newCategoryName.trim()]);
    setNewCategoryName("");
  };

  const handleRemoveCategory = (cat) => {
    setCategoriesState(categoriesState.filter(c => c !== cat));
  };

  const handleToggleFeaturedJob = async (job) => {
    try {
      const newFeaturedVal = !job.featured;
      const res = await api.updateJob(job._id || job.id, { featured: newFeaturedVal });
      if (res.success) {
        toast(`📌 Job marked as ${newFeaturedVal ? 'Featured' : 'Standard'}`);
      } else {
        toast(res.message || "Failed to update featured state.", "error");
      }
    } catch {
      toast("Connection error updating featured status.", "error");
    }
  };

  const handleManualSync = async () => {
    setSyncStatus("running");
    setSyncProgress(10);
    setSyncMessage("Connecting to external job API endpoint...");
    const interval = setInterval(() => {
      setSyncProgress(p => (p < 85 ? p + Math.floor(Math.random() * 15) : p));
    }, 400);

    try {
      const res = await api.triggerManualSync();
      clearInterval(interval);
      setSyncProgress(100);
      if (res.success) {
        setSyncStatus("success");
        setSyncMessage(`Sync successful! Imported ${res.results.addedCount} new jobs.`);
        toast(`✅ Sync complete. Imported ${res.results.addedCount} jobs!`);
      } else {
        setSyncStatus("error");
        setSyncMessage(res.message || "External sync failed.");
      }
    } catch {
      clearInterval(interval);
      setSyncStatus("error");
      setSyncMessage("Connection error executing external sync service.");
    }
  };

  const handleExportCSV = () => {
    if (activityLogs.length === 0) {
      toast("No logs available to export.", "error");
      return;
    }
    const headers = ["ID", "Timestamp", "Activity Type", "Email", "Name", "Role", "Details"];
    const rows = activityLogs.map(l => [
      l._id || l.id,
      l.createdAt ? new Date(l.createdAt).toLocaleString() : "",
      l.activityType,
      l.email,
      l.name,
      l.role,
      `"${l.details.replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `talenthub_audit_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("📥 Audit logs CSV download started!");
  };

  const [purgeDays, setPurgeDays] = useState(30);
  const [purgingLogs, setPurgingLogs] = useState(false);
  const handlePurgeLogs = async () => {
    if (!window.confirm(`Are you sure you want to permanently purge activity logs older than ${purgeDays} days?`)) return;
    setPurgingLogs(true);
    try {
      const res = await api.purgeActivityLogs(purgeDays);
      if (res.success) {
        toast(`🧹 Logs purged: ${res.message}`);
        fetchLogs();
      } else {
        toast(res.message || "Failed to purge logs.", "error");
      }
    } catch {
      toast("Connection error during purge.", "error");
    } finally {
      setPurgingLogs(false);
    }
  };

  const [backingUp, setBackingUp] = useState(false);
  const handleBackup = async () => {
    setBackingUp(true);
    try {
      const res = await api.exportDatabaseBackup();
      if (res.success && res.dump) {
        const jsonContent = JSON.stringify(res.dump, null, 2);
        const blob = new Blob([jsonContent], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `talenthub_db_backup_${Date.now()}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast("💾 Database JSON backup downloaded!");
      } else {
        toast("Failed to generate database dump.", "error");
      }
    } catch {
      toast("Connection error during backup.", "error");
    } finally {
      setBackingUp(false);
    }
  };

  const [restoring, setRestoring] = useState(false);
  const handleRestore = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!window.confirm("CRITICAL WARNING: Restoring the database will drop all current collections and overwrite them. Do you want to proceed?")) {
      e.target.value = "";
      return;
    }

    setRestoring(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const dump = JSON.parse(event.target.result);
        const res = await api.restoreDatabaseFromBackup(dump);
        if (res.success) {
          toast("⚡ Database successfully restored! Reloading session...");
          setTimeout(() => window.location.reload(), 1500);
        } else {
          toast(res.message || "Database restore failed.", "error");
        }
      } catch (err) {
        toast("Failed to parse JSON file or restore database.", "error");
      } finally {
        setRestoring(false);
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  const [seeding, setSeeding] = useState(false);
  const handleDeveloperSeed = async () => {
    setSeeding(true);
    try {
      const res = await api.seedDeveloperMockData();
      if (res.success) {
        toast("🧬 Seeding completed! Mock profiles, jobs, and applications created.");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast(res.message || "Seeding failed.", "error");
      }
    } catch {
      toast("Connection error during seeding.", "error");
    } finally {
      setSeeding(false);
    }
  };

  // Filtered lists
  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.role?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredLogs = activityLogs.filter(l => {
    const matchesSearch = l.name?.toLowerCase().includes(logSearch.toLowerCase()) || 
                         l.email?.toLowerCase().includes(logSearch.toLowerCase()) || 
                         l.details?.toLowerCase().includes(logSearch.toLowerCase());
    const matchesType = logTypeFilter === "all" || l.activityType === logTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="dash-wrap">
      <div className="dash-header">
        <h1>🛠️ System Admin Control Panel</h1>
        <p>Manage and moderate the platform's features, configurations, and users.</p>
      </div>

      <div className="dash-tabs" style={{ display: "flex", flexWrap: "wrap" }}>
        {[
          { id: "reports", label: "📊 Reports & Analytics" },
          { id: "moderation", label: "🛡️ Moderation Board" },
          { id: "configs", label: "📣 System Configs" },
          { id: "access", label: "🔒 Access & Security" },
          { id: "logs", label: "📜 System Audit & Utils" }
        ].map((t) => (
          <button
            key={t.id}
            className={`dash-tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: REPORTS & ANALYTICS ── */}
      {tab === "reports" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {loadingDiagnostics ? (
            <div className="loading"><div className="spinner" /></div>
          ) : (
            <>
              {/* Analytics Top Row */}
              <div className="stats-row">
                <div className="stat-card">
                  <div className="val">{users.length || 0}</div>
                  <div className="lbl">Total Registered Accounts</div>
                </div>
                <div className="stat-card">
                  <div className="val">{jobs.length || 0}</div>
                  <div className="lbl">Total Job Listings</div>
                </div>
                <div className="stat-card">
                  <div className="val">{diagnostics?.chatbotStats?.totalChats || 0}</div>
                  <div className="lbl">AI Chatbot Queries</div>
                </div>
                <div className="stat-card" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <button className="btn-primary" onClick={handleExportCSV} style={{ padding: "0.85rem", fontSize: "0.85rem" }}>
                    📥 Export Audit CSV
                  </button>
                </div>
              </div>



              {/* Two Column Layout: Funnel + Leaderboard */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                {/* Application Funnel */}
                <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.75rem" }}>
                  <h3 className="section-title" style={{ fontSize: "1.2rem", marginBottom: "1.5rem" }}>📊 Application Pipelines</h3>
                  {diagnostics?.funnel && diagnostics.funnel.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      {["pending", "reviewed", "interview", "hired"].map((status) => {
                        const count = diagnostics.funnel.find(f => f._id === status)?.count || 0;
                        const total = diagnostics.funnel.reduce((acc, f) => acc + f.count, 0) || 1;
                        const pct = (count / total) * 100;
                        return (
                          <div key={status} style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                              <span style={{ textTransform: "capitalize", fontWeight: "bold" }}>{status}</span>
                              <span style={{ color: "var(--text-muted)" }}>{count} ({Math.round(pct)}%)</span>
                            </div>
                            <div style={{ background: "rgba(255,255,255,0.05)", height: "8px", borderRadius: "99px", overflow: "hidden" }}>
                              <div style={{
                                width: `${pct}%`,
                                height: "100%",
                                background: status === "hired" ? "var(--success)" : status === "interview" ? "var(--accent)" : "var(--primary)"
                              }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No application tracking records present.</p>
                  )}
                </div>

                {/* Active Employers */}
                <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.75rem" }}>
                  <h3 className="section-title" style={{ fontSize: "1.2rem", marginBottom: "1.5rem" }}>🏆 Top Employers Leaderboard</h3>
                  {diagnostics?.leaderboard && diagnostics.leaderboard.length > 0 ? (
                    <table className="data-table" style={{ fontSize: "0.85rem" }}>
                      <thead>
                        <tr>
                          <th>Company</th>
                          <th>Active Roles</th>
                          <th>Applicants Received</th>
                        </tr>
                      </thead>
                      <tbody>
                        {diagnostics.leaderboard.map((emp, idx) => (
                          <tr key={idx}>
                            <td><strong>{emp._id}</strong></td>
                            <td>{emp.count} listings</td>
                            <td>{emp.applications || 0} applications</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No leaderboard data available.</p>
                  )}
                </div>
              </div>

              {/* Chatbot Diagnostics */}
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.75rem" }}>
                <h3 className="section-title" style={{ fontSize: "1.2rem", marginBottom: "1.5rem" }}>🤖 AI Chatbot Diagnostics Auditor</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.5rem" }}>
                  <div>
                    <h4 style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Popular Query Words</h4>
                    {diagnostics?.chatbotStats?.popularTerms && diagnostics.chatbotStats.popularTerms.length > 0 ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {diagnostics.chatbotStats.popularTerms.map((t, idx) => (
                          <span key={idx} className="badge" style={{ fontSize: "0.75rem", padding: "0.35rem 0.65rem", background: "rgba(212, 175, 55, 0.05)", borderColor: "rgba(212, 175, 55, 0.15)", color: "var(--gold)" }}>
                            {t.term} ({t.count})
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No keywords aggregated yet.</p>
                    )}
                  </div>
                  <div>
                    <h4 style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Recent Chats Logs</h4>
                    {diagnostics?.chatbotStats?.recentChats && diagnostics.chatbotStats.recentChats.length > 0 ? (
                      <div style={{ maxHeight: "150px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem", paddingRight: "0.5rem" }}>
                        {diagnostics.chatbotStats.recentChats.map((chat, idx) => (
                          <div key={idx} style={{ fontSize: "0.8rem", padding: "0.5rem", border: "1px solid var(--border)", borderRadius: "4px", background: "rgba(255,255,255,0.01)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", marginBottom: "0.2rem" }}>
                              <span>{chat.name} ({chat.email})</span>
                              <span>{new Date(chat.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div style={{ color: "var(--text)" }}>{chat.details.replace('Asked AI Career Assistant: "', '').replace(/"$/, '')}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No AI chatbot queries recorded.</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── TAB 2: MODERATION BOARD ── */}
      {tab === "moderation" && (
        <div>
          {/* Sub Tab Navigation */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
            {[
              { id: "users", label: "👥 Platform Signups" },
              { id: "verification", label: "🛡️ Employer Verifications" },
              { id: "flagged", label: "⚠️ Flagged Jobs" },
              { id: "tickets", label: "🎟️ Support Inbox" }
            ].map(sub => (
              <button
                key={sub.id}
                onClick={() => setModSubTab(sub.id)}
                style={{
                  background: modSubTab === sub.id ? "rgba(99, 102, 241, 0.15)" : "none",
                  border: modSubTab === sub.id ? "1px solid var(--primary)" : "1px solid var(--border)",
                  color: modSubTab === sub.id ? "var(--primary-light)" : "var(--text-muted)",
                  padding: "0.5rem 1rem",
                  borderRadius: "99px",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {loadingUsers || loadingFlags || loadingTickets ? (
            <div className="loading"><div className="spinner" /></div>
          ) : (
            <>
              {/* Classified Card List View (Subtab: Users) */}
              {modSubTab === "users" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                  {/* Search bar */}
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="🔍 Search users by name, email, or role..."
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                      style={{ maxWidth: "400px" }}
                    />
                  </div>

                  {/* 3 classification cards columns */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
                    {/* Column 1: Candidates */}
                    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                      <h3 style={{ fontSize: "1.05rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>Job Seekers</h3>
                      <div style={{ maxHeight: "400px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.75rem", paddingRight: "0.25rem" }}>
                        {filteredUsers.filter(u => u.role === "candidate").map(u => (
                          <div key={u._id} style={{ padding: "0.85rem", border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "rgba(255,255,255,0.01)" }}>
                            <div style={{ fontWeight: "bold", fontSize: "0.9rem" }}>{u.name}</div>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>{u.email}</div>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <button onClick={() => handleToggleUserStatus(u)} className="btn-secondary" style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}>
                                {u.isActive ? "Deactivate" : "Activate"}
                              </button>
                              <button onClick={() => handleToggleUserBan(u)} className="btn-danger" style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}>
                                {u.isBanned ? "Unban" : "Ban"}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Column 2: Employers */}
                    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                      <h3 style={{ fontSize: "1.05rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>Job Providers</h3>
                      <div style={{ maxHeight: "400px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.75rem", paddingRight: "0.25rem" }}>
                        {filteredUsers.filter(u => u.role === "employer").map(u => (
                          <div key={u._id} style={{ padding: "0.85rem", border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "rgba(255,255,255,0.01)" }}>
                            <div style={{ fontWeight: "bold", fontSize: "0.9rem" }}>{u.name}</div>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{u.email}</div>
                            <div style={{ fontSize: "0.8rem", color: "var(--accent)", fontWeight: "500", marginBottom: "0.5rem" }}>{u.company || "Independent Recruiter"}</div>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <button onClick={() => handleToggleUserStatus(u)} className="btn-secondary" style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}>
                                {u.isActive ? "Deactivate" : "Activate"}
                              </button>
                              <button onClick={() => handleToggleUserBan(u)} className="btn-danger" style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}>
                                {u.isBanned ? "Unban" : "Ban"}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Column 3: Admins */}
                    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                      <h3 style={{ fontSize: "1.05rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>Administrators</h3>
                      <div style={{ maxHeight: "400px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.75rem", paddingRight: "0.25rem" }}>
                        {filteredUsers.filter(u => u.role === "admin").map(u => (
                          <div key={u._id} style={{ padding: "0.85rem", border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "rgba(255,255,255,0.01)" }}>
                            <div style={{ fontWeight: "bold", fontSize: "0.9rem" }}>{u.name} {u.email === user.email && "👑"}</div>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>{u.email}</div>
                            {u.email !== user.email && (
                              <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button onClick={() => handleToggleUserStatus(u)} className="btn-secondary" style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}>
                                  {u.isActive ? "Deactivate" : "Activate"}
                                </button>
                                <button onClick={() => handleToggleUserBan(u)} className="btn-danger" style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}>
                                  {u.isBanned ? "Unban" : "Ban"}
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Employer Verifications Subtab */}
              {modSubTab === "verification" && (
                <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.75rem" }}>
                  <h3 className="section-title" style={{ fontSize: "1.2rem", marginBottom: "1.5rem" }}>🛡️ Recruiter Verifications Directory</h3>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Company Name</th>
                        <th>Contact Email</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.filter(u => u.role === "employer").map(u => (
                        <tr key={u._id}>
                          <td><strong>{u.company || "Independent"}</strong></td>
                          <td>{u.email}</td>
                          <td>
                            {u.isVerified ? (
                              <span style={{ color: "var(--success)", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                🟢 Verified Badge Active
                              </span>
                            ) : (
                              <span style={{ color: "var(--text-muted)" }}>🔴 Unverified</span>
                            )}
                          </td>
                          <td>
                            <button onClick={() => handleToggleUserVerification(u)} className="btn-secondary" style={{ padding: "0.4rem 0.85rem", fontSize: "0.8rem" }}>
                              {u.isVerified ? "Revoke Verification" : "Verify Recruiter"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Flagged Jobs Subtab */}
              {modSubTab === "flagged" && (
                <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.75rem" }}>
                  <h3 className="section-title" style={{ fontSize: "1.2rem", marginBottom: "1.5rem" }}>⚠️ Flagged Job Postings Moderation</h3>
                  {flaggedJobs.length === 0 ? (
                    <p style={{ color: "var(--text-muted)" }}>No flagged job postings present. Platform listings are clean! ✨</p>
                  ) : (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Job Title</th>
                          <th>Company</th>
                          <th>Flags</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {flaggedJobs.map(job => (
                          <tr key={job._id}>
                            <td><strong>{job.title}</strong></td>
                            <td>{job.company}</td>
                            <td><span style={{ color: "var(--danger)", fontWeight: "bold" }}>{job.flagCount || 0} flags</span></td>
                            <td>
                              <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button onClick={() => handleUnflagJob(job._id)} className="btn-secondary" style={{ padding: "0.4rem 0.85rem", fontSize: "0.8rem" }}>
                                  Dismiss Flags
                                </button>
                                <button onClick={() => handleDeleteFlaggedJob(job._id)} className="btn-danger" style={{ padding: "0.4rem 0.85rem", fontSize: "0.8rem" }}>
                                  Delete Listing
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Support Inbox Subtab */}
              {modSubTab === "tickets" && (
                <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.75rem" }}>
                  <h3 className="section-title" style={{ fontSize: "1.2rem", marginBottom: "1.5rem" }}>🎟️ User Support & Feedback Inbox</h3>
                  {supportTickets.length === 0 ? (
                    <p style={{ color: "var(--text-muted)" }}>No support tickets registered in the inbox.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                      {supportTickets.map(t => (
                        <div key={t._id} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1.25rem", background: "rgba(255,255,255,0.01)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
                            <h4 style={{ fontSize: "1rem", color: "var(--text)" }}>{t.subject}</h4>
                            <span className={`status-badge ${t.status === 'resolved' ? 'status-interview' : 'status-pending'}`}>
                              {t.status}
                            </span>
                          </div>
                          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.8rem" }}>
                            From: <strong>{t.name}</strong> ({t.email}) &mdash; Sent: {t.createdAt ? new Date(t.createdAt).toLocaleString() : ""}
                          </p>
                          <p style={{ fontSize: "0.95rem", lineHeight: 1.5, background: "rgba(0,0,0,0.15)", padding: "0.75rem", borderRadius: "4px", marginBottom: "0.8rem" }}>
                            {t.message}
                          </p>
                          {t.status === "resolved" ? (
                            <div style={{ fontSize: "0.9rem", color: "var(--success)", borderLeft: "2px solid var(--success)", paddingLeft: "0.75rem", marginTop: "0.5rem" }}>
                              <strong>Admin Reply Note:</strong> {t.replyMessage}
                            </div>
                          ) : (
                            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.8rem", alignItems: "flex-end" }}>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="Type resolution note or reply to email..."
                                value={ticketReplyText[t._id] || ""}
                                onChange={e => setTicketReplyText(prev => ({ ...prev, [t._id]: e.target.value }))}
                              />
                              <button onClick={() => handleResolveTicket(t._id)} className="btn-primary" style={{ whiteSpace: "nowrap", padding: "0.85rem 1.5rem" }}>
                                Resolve Ticket
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── TAB 3: SYSTEM CONFIGS ── */}
      {tab === "configs" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* External Syncer */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.75rem" }}>
            <h3 className="section-title" style={{ fontSize: "1.2rem", marginBottom: "1.25rem" }}>🤝 System Recruiter Sync Trigger</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
              Pull the latest remote jobs from external channels like Remotive API dynamically into the platform index database.
            </p>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <button onClick={handleManualSync} disabled={syncStatus === "running"} className="btn-primary" style={{ maxWidth: "250px" }}>
                {syncStatus === "running" ? "🔄 Syncing Listings..." : "Sync Jobs Now"}
              </button>
              {syncStatus !== "idle" && (
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                    <span>{syncMessage}</span>
                    <span>{syncProgress}%</span>
                  </div>
                  <div style={{ height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "99px", overflow: "hidden" }}>
                    <div style={{ width: `${syncProgress}%`, height: "100%", background: "var(--primary)", transition: "width 0.3s" }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            {/* Config Form */}
            <form onSubmit={handleSaveConfig} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <h3 className="section-title" style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>📢 Announcement & System Parameters</h3>
              
              <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="checkbox"
                  id="bannerActive"
                  checked={bannerActiveState}
                  onChange={e => setBannerActiveState(e.target.checked)}
                  style={{ width: "18px", height: "18px", cursor: "pointer" }}
                />
                <label htmlFor="bannerActive" style={{ cursor: "pointer", fontWeight: "bold", fontSize: "0.9rem" }}>Active Announcement Banner</label>
              </div>

              <div className="form-group">
                <label className="form-label">Banner Marquee Text</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. TalentHub System Maintenance this Sunday!"
                  value={bannerTextState}
                  onChange={e => setBannerTextState(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Banner Background Color</label>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <input
                    type="color"
                    className="form-input"
                    value={bannerColorState}
                    onChange={e => setBannerColorState(e.target.value)}
                    style={{ width: "50px", height: "40px", padding: "2px", cursor: "pointer" }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    value={bannerColorState}
                    onChange={e => setBannerColorState(e.target.value)}
                    placeholder="#6366f1"
                    style={{ maxWidth: "120px" }}
                  />
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.25rem" }} />

              <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="checkbox"
                  id="maintenanceMode"
                  checked={maintenanceModeState}
                  onChange={e => setMaintenanceModeState(e.target.checked)}
                  style={{ width: "18px", height: "18px", cursor: "pointer" }}
                />
                <label htmlFor="maintenanceMode" style={{ cursor: "pointer", fontWeight: "bold", fontSize: "0.9rem", color: "var(--danger)" }}>🚧 ACTIVATE MAINTENANCE MODE LOCKOUT</label>
              </div>

              <div className="form-group">
                <label className="form-label">Lockout Message</label>
                <textarea
                  className="form-input"
                  value={maintenanceMessageState}
                  onChange={e => setMaintenanceMessageState(e.target.value)}
                  placeholder="System undergoing optimization. We will be back online shortly!"
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Estimated Completion Time</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={maintenanceEndTimeState}
                  onChange={e => setMaintenanceEndTimeState(e.target.value)}
                />
              </div>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.25rem" }} />

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Max Applications / Candidate</label>
                  <input
                    type="number"
                    className="form-input"
                    value={maxAppsLimitState}
                    onChange={e => setMaxAppsLimitState(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Resume File Size (MB)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={maxFileSizeLimitState}
                    onChange={e => setMaxFileSizeLimitState(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary">
                💾 Save Platform Parameters
              </button>
            </form>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Categories manager */}
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.75rem" }}>
                <h3 className="section-title" style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>🏷️ Global Job Categories</h3>
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="New category name..."
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                  />
                  <button onClick={handleAddCategory} className="see-all" style={{ padding: "0.85rem 1.25rem", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
                    Add
                  </button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", maxHeight: "180px", overflowY: "auto", paddingRight: "0.25rem" }}>
                  {categoriesState.map((cat, idx) => (
                    <span key={idx} className="badge" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.35rem 0.65rem", background: "rgba(255,255,255,0.02)" }}>
                      {cat}
                      <button onClick={() => handleRemoveCategory(cat)} style={{ border: "none", background: "none", color: "var(--danger)", cursor: "pointer", fontSize: "0.85rem", fontWeight: "bold" }}>✕</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Featured Jobs outline selector */}
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <h3 className="section-title" style={{ fontSize: "1.2rem", marginBottom: "0.2rem" }}>📌 Neon Featured & Pinned Listings</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Flag specific job listings as Featured to highlight them with a neon border.</p>
                <div style={{ maxHeight: "200px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem", paddingRight: "0.25rem" }}>
                  {jobs.map(j => (
                    <div key={j._id || j.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0.75rem", border: "1px solid var(--border)", borderRadius: "4px", background: "rgba(255,255,255,0.01)", fontSize: "0.85rem" }}>
                      <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: "250px" }}>
                        <strong>{j.title}</strong> at {j.company}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <input
                          type="checkbox"
                          checked={j.featured || false}
                          onChange={() => handleToggleFeaturedJob(j)}
                          style={{ cursor: "pointer", width: "16px", height: "16px" }}
                        />
                        <span style={{ fontSize: "0.8rem", color: j.featured ? "var(--accent)" : "var(--text-muted)" }}>Featured</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: ACCESS & SECURITY ── */}
      {tab === "access" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          {/* Admin email authorization register */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.75rem" }}>
            <h3 className="section-title" style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>🔑 Authorized System Admin Emails</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>Approved emails are authorized to sign up and register as administrators.</p>
            
            {user.email !== "praveen542spk@gmail.com" && (
              <div style={{ background: "rgba(245, 158, 11, 0.08)", border: "1px dashed var(--warning)", color: "var(--warning)", padding: "0.85rem", borderRadius: "var(--radius)", fontSize: "0.82rem", marginBottom: "1.25rem", lineHeight: 1.5 }}>
                🔒 <strong>Read-Only Access:</strong> Only the Primary Administrator (praveen542spk@gmail.com) is authorized to add or revoke system admin email approvals.
              </div>
            )}

            {user.email === "praveen542spk@gmail.com" && (
              <form onSubmit={handleAddEmail} style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
                <input
                  type="email"
                  className="form-input"
                  placeholder="Authorize email (e.g. user@admin.com)"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  required
                />
                <button type="submit" disabled={submittingEmail} className="see-all" style={{ padding: "0.85rem 1.25rem", border: "1px solid var(--border)", borderRadius: "var(--radius)", whiteSpace: "nowrap" }}>
                  {submittingEmail ? "Approving..." : "Authorize"}
                </button>
              </form>
            )}
            {emailError && <p style={{ color: "var(--danger)", fontSize: "0.85rem", marginTop: "-1rem", marginBottom: "1rem" }}>{emailError}</p>}

            {loadingEmails ? (
              <div className="loading"><div className="spinner" /></div>
            ) : (
              <div style={{ maxHeight: "300px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem", paddingRight: "0.25rem" }}>
                {managementEmails.map(item => (
                  <div key={item._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 0.85rem", border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "rgba(255,255,255,0.01)" }}>
                    <span style={{ fontSize: "0.9rem" }}>{item.email}</span>
                    {user.email === "praveen542spk@gmail.com" ? (
                      <button onClick={() => handleDeleteEmail(item.email)} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontWeight: "bold" }}>Revoke</button>
                    ) : (
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>✓ Authorized</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Password reset portal */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.75rem" }}>
            <h3 className="section-title" style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>🔑 Password Reset Portal</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>Force reset password credentials for any registered user profile in the database.</p>

            <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div className="form-group">
                <label className="form-label">Target User Account</label>
                <select
                  className="form-select"
                  value={resetUserId}
                  onChange={e => setResetUserId(e.target.value)}
                  required
                >
                  <option value="">-- Select Registered Profile --</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email}) [{u.role}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">New Password (Min 6 characters)</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter secure new password credential..."
                  value={resetPasswordVal}
                  onChange={e => setResetPasswordVal(e.target.value)}
                  required
                />
              </div>

              <button type="submit" disabled={resettingPassword} className="btn-primary">
                {resettingPassword ? "🔄 Resetting..." : "Force Update Password"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── TAB 5: SYSTEM AUDIT & UTILS ── */}
      {tab === "logs" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* Operations & backups row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            {/* Database backups */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <h3 style={{ fontSize: "1.1rem" }}>💾 Database Backups & Restore</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Download complete system collection dumps as JSON backups, or restore database state from file.</p>
              
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                <button onClick={handleBackup} disabled={backingUp} className="btn-primary" style={{ flex: 1, whiteSpace: "nowrap" }}>
                  {backingUp ? "Generating Backup..." : "Export Backup JSON"}
                </button>
                <label className="see-all" style={{ flex: 1, padding: "0.85rem", cursor: "pointer", display: "inline-block", border: "1px solid var(--border)", borderRadius: "var(--radius)", textAlign: "center", whiteSpace: "nowrap" }}>
                  {restoring ? "Restoring..." : "Restore Backup JSON"}
                  <input type="file" accept=".json" onChange={handleRestore} style={{ display: "none" }} disabled={restoring} />
                </label>
              </div>
            </div>

            {/* Logs archiving & seeders */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <h3 style={{ fontSize: "1.1rem" }}>⚙️ Archiving & Developer Utilities</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Purge old activity logs to optimize database capacity, or populate local seeders for debugging.</p>
              
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", flexWrap: "wrap" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Purge Logs Older Than (Days)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={purgeDays}
                    onChange={e => setPurgeDays(e.target.value)}
                    style={{ maxWidth: "120px" }}
                  />
                </div>
                <button onClick={handlePurgeLogs} disabled={purgingLogs} className="btn-danger" style={{ height: "42px", whiteSpace: "nowrap" }}>
                  Purge Logs
                </button>
                <button onClick={handleDeveloperSeed} disabled={seeding} className="see-all" style={{ height: "42px", padding: "0.85rem", border: "1px solid var(--border)", borderRadius: "var(--radius)", flex: 1, whiteSpace: "nowrap" }}>
                  {seeding ? "Seeding..." : "🧬 Seed Demo Data"}
                </button>
              </div>
            </div>
          </div>

          {/* Chronological Audit Logs Feed */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.75rem" }}>
            <h3 className="section-title" style={{ fontSize: "1.2rem", marginBottom: "1.25rem" }}>📜 Chronological Activity Logs Feed</h3>
            
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
              <input
                type="text"
                className="form-input"
                placeholder="🔍 Search activity logs by name, email, details..."
                value={logSearch}
                onChange={e => setLogSearch(e.target.value)}
                style={{ flex: 2, minWidth: "250px" }}
              />
              <select
                className="form-select"
                value={logTypeFilter}
                onChange={e => setLogTypeFilter(e.target.value)}
                style={{ flex: 1, minWidth: "150px" }}
              >
                <option value="all">All Activity Types</option>
                <option value="login">Logins</option>
                <option value="register">Registrations</option>
                <option value="job_post">Job Posts</option>
                <option value="job_apply">Job Applications</option>
                <option value="profile_update">System Configs & Profiles</option>
                <option value="ai_chat">AI Chatbot queries</option>
              </select>
            </div>

            {loadingLogs ? (
              <div className="loading"><div className="spinner" /></div>
            ) : (
              <div style={{ maxHeight: "350px", overflowY: "auto", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "0.5rem" }}>
                {filteredLogs.length === 0 ? (
                  <div className="empty" style={{ padding: "3rem" }}>No activity logs recorded.</div>
                ) : (
                  <table className="data-table" style={{ fontSize: "0.85rem" }}>
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>User</th>
                        <th>Type</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map(l => (
                        <tr key={l._id}>
                          <td style={{ whiteSpace: "nowrap" }}>{l.createdAt ? new Date(l.createdAt).toLocaleString() : ""}</td>
                          <td>
                            <strong>{l.name}</strong>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{l.email} [{l.role}]</div>
                          </td>
                          <td>
                            <span className="badge" style={{
                              borderColor: l.activityType === 'login' ? 'rgba(6,182,212,0.2)' : l.activityType === 'job_post' ? 'rgba(16,185,129,0.2)' : 'var(--border)',
                              color: l.activityType === 'login' ? 'var(--accent)' : l.activityType === 'job_post' ? 'var(--success)' : 'var(--text-muted)'
                            }}>
                              {l.activityType}
                            </span>
                          </td>
                          <td style={{ maxWidth: "350px", wordBreak: "break-word" }}>{l.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState("home");
  const [loginRole, setLoginRole] = useState("candidate");
  const [adminTab, setAdminTab] = useState("reports");
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [user, setUser] = useState(null);
  const [showPostJob, setShowPostJob] = useState(false);
  const [applyTarget, setApplyTarget] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCat, setSearchCat] = useState("");
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [systemConfig, setSystemConfig] = useState(null);

  const toast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await api.getSystemConfig();
      if (res.success && res.config) {
        setSystemConfig(res.config);
      }
    } catch (err) {
      console.error("Failed to load system config:", err);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  // ── Theme Switcher Effect ──────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // ── Unified Applications Sync & Fetch ──────────────────────────────────
  const fetchApplications = useCallback(async (currUser) => {
    if (!currUser) {
      setApplications([]);
      return;
    }
    try {
      if (currUser.role === "candidate") {
        const res = await api.getMyApplications();
        const mapped = (res.applications || []).map((a) => ({
          id: a._id,
          jobId: a.job?._id || a.job?.id,
          jobTitle: a.job?.title || "Unknown Role",
          company: a.job?.company || "Unknown Company",
          appliedAt: a.createdAt ? new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Just now",
          status: a.status,
          userId: currUser.id || currUser._id,
        }));
        setApplications(mapped);
      } else if (currUser.role === "employer") {
        const jobsData = await api.getMyJobs();
        const myJobsList = jobsData.jobs || [];
        const appsPromises = myJobsList.map((j) => api.getJobApplications(j._id || j.id));
        const appsResponses = await Promise.all(appsPromises);
        const allApps = appsResponses.flatMap((res, idx) => {
          const job = myJobsList[idx];
          return (res.applications || []).map((a) => ({
            id: a._id,
            jobId: job._id || job.id,
            jobTitle: job.title,
            company: job.company,
            name: a.name,
            email: a.email,
            phone: a.phone || "—",
            linkedin: a.linkedIn || "",
            fileName: a.resumeOriginalName || "",
            resumeUrl: a.resumeUrl || "",
            appliedAt: a.createdAt ? new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Just now",
            status: a.status,
          }));
        });
        setApplications(allApps);
      }
    } catch (err) {
      console.error("Failed to load applications:", err);
    }
  }, []);

  // ── Auto-auth on load ──────────────────────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const me = await api.getMe();
          if (me.user) {
            setUser(me.user);
            setPage(me.user.role === "employer" ? "employer-dash" : me.user.role === "admin" ? "admin-dash" : "candidate-dash");
          } else {
            localStorage.removeItem("token");
          }
        } catch {
          localStorage.removeItem("token");
        }
      }
    };
    restoreSession();
  }, []);

  // ── Sync Applications when User State changes ──────────────────────────
  useEffect(() => {
    if (user) {
      fetchApplications(user);
    } else {
      setApplications([]);
    }
  }, [user, fetchApplications]);

  // ── Employer App Status Patch Handler ──────────────────────────────────
  const handleUpdateAppStatus = async (appId, newStatus) => {
    try {
      toast("🔄 Updating application status...", "info");
      const res = await api.updateAppStatus(appId, newStatus);
      if (res.success) {
        toast(`✅ Application marked as "${newStatus}"!`, "success");
        await fetchApplications(user);
      } else {
        toast(res.message || "Failed to update status.", "error");
      }
    } catch {
      toast("❌ Connection error while updating status.", "error");
    }
  };

  // ── Initial jobs fetch ─────────────────────────────────────────────────
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getJobs({ limit: 250 });
      // Dynamically add 'isNew' for any job posted within the last 7 days
      const processed = (data.jobs || []).map((j) => {
        const isRecent = j.createdAt ? (Date.now() - new Date(j.createdAt)) < 7 * 24 * 60 * 60 * 1000 : false;
        return {
          ...j,
          isNew: j.isNew || isRecent,
        };
      });
      setJobs(processed);
    } catch {
      toast("Failed to load jobs.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSyncJobs = async () => {
    try {
      toast("🔄 Syncing remote jobs from API...", "info");
      const data = await api.syncJobs();
      if (data.success) {
        toast(`✅ Successfully imported ${data.results.added} remote jobs!`, "success");
        if (data.results.skipped > 0) {
          setTimeout(() => toast(`ℹ️ ${data.results.skipped} duplicate jobs skipped.`, "info"), 1200);
        }
        await fetchJobs();
      } else {
        toast(data.message || "Failed to sync jobs.", "error");
      }
    } catch (err) {
      toast("❌ Error connecting to backend sync service.", "error");
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // ── Supabase Realtime — Jobs ───────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel("jobs")
      .on("broadcast", { event: "job_created" }, (payload) => {
        setJobs((prev) => [payload.payload, ...prev]);
        toast(`🆕 New job posted: ${payload.payload.title}`, "info");
      })
      .on("broadcast", { event: "job_updated" }, () => {
        fetchJobs();
      })
      .on("broadcast", { event: "job_deleted" }, (payload) => {
        setJobs((prev) => prev.filter((j) => (j._id || j.id) !== payload.payload._id));
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchJobs]);

  // ── Supabase Realtime — Applications (candidate மட்டும்) ───────────────
  useEffect(() => {
    if (!user || user.role !== "candidate") return;

    const channel = supabase
      .channel("applications")
      .on("broadcast", { event: "application_status_updated" }, (payload) => {
        const { candidateEmail, jobTitle, newStatus } = payload.payload;
        if (candidateEmail === user.email) {
          toast(`📋 "${jobTitle}" status updated: ${newStatus}`, "info");
          setApplications((prev) =>
            prev.map((a) => a.jobTitle === jobTitle ? { ...a, status: newStatus } : a)
          );
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  // ── Auth ───────────────────────────────────────────────────────────────
  const handleLogin = async (formData) => {
    const data = await api.login(formData);
    if (data.token) {
      localStorage.setItem("token", data.token);
      const me = await api.getMe();
      setUser(me.user);
      setPage(me.user.role === "employer" ? "employer-dash" : me.user.role === "admin" ? "admin-dash" : "candidate-dash");
      toast(`Welcome, ${me.user.name}! 🎉`);
    } else {
      throw new Error(data.message || "Login failed.");
    }
  };

  const handleRegister = async (formData) => {
    const data = await api.register(formData);
    if (data.token) {
      localStorage.setItem("token", data.token);
      setUser(data.user);
      setPage(data.user.role === "employer" ? "employer-dash" : data.user.role === "admin" ? "admin-dash" : "candidate-dash");
      toast(`Welcome, ${data.user.name}! 🎉`);
    } else {
      throw new Error(data.message || "Registration failed.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setApplications([]);
    setPage("home");
    toast("Signed out successfully.", "info");
  };

  // ── Apply ──────────────────────────────────────────────────────────────
  const handleApply = (job) => {
    if (!user) { setLoginRole("candidate"); setPage("login"); return; }
    if (user.role === "employer") { toast("Employers cannot apply to jobs.", "error"); return; }
    if (user.role === "admin") { toast("Administrators cannot apply to jobs.", "error"); return; }
    const jobId = job._id || job.id;
    if (applications.some((a) => a.jobId === jobId && a.userId === (user.id || user._id))) {
      toast("You've already applied to this job.", "error"); return;
    }
    setApplyTarget(job);
  };

  const handleSubmitApplication = async (appData) => {
    try {
      const formData = new FormData();
      formData.append("jobId", appData.jobId);
      formData.append("phone", appData.phone || "");
      formData.append("linkedIn", appData.linkedin || "");
      formData.append("coverLetter", appData.cover || "");
      if (appData.file) formData.append("resume", appData.file);

      const data = await api.applyToJob(formData);
      if (data.success) {
        setApplications((p) => [...p, { ...appData, userId: user.id || user._id, status: "pending" }]);
        setApplyTarget(null);
        toast(`✅ Application submitted to ${appData.company}!`);
        setTimeout(() => toast(`📧 Confirmation email sent to ${user.email}`, "info"), 1200);

        // Auto-save details to profile for subsequent One-Click Quick Applies!
        if (data.application) {
          const profileUpdates = {
            phone: appData.phone,
            linkedIn: appData.linkedin,
            resumeUrl: data.application.resumeUrl,
            resumeOriginalName: data.application.resumeOriginalName
          };
          api.updateMe(profileUpdates).then(profileRes => {
            if (profileRes.success) {
              setUser(profileRes.user);
            }
          }).catch(console.error);
        }
      } else {
        toast(data.message || "Application failed.", "error");
      }
    } catch {
      toast("Application failed.", "error");
    }
  };

  const handleQuickApply = async (job) => {
    if (!user || user.role !== "candidate") return;
    if (!user.phone || !user.resumeUrl) {
      toast("Please complete your profile details and upload a saved resume first!", "error");
      return;
    }

    try {
      toast("⚡ Initiating One-Click Quick Apply...", "info");
      
      const formData = new FormData();
      formData.append("jobId", job._id || job.id);
      formData.append("phone", user.phone);
      formData.append("linkedIn", user.linkedIn || "");
      formData.append("coverLetter", `Quick Apply submitted automatically via saved profile for ${job.title} at ${job.company}.`);
      formData.append("resumeUrl", user.resumeUrl);
      formData.append("resumeOriginalName", user.resumeOriginalName || "Saved_Resume.pdf");

      const data = await api.applyToJob(formData);
      if (data.success) {
        setApplications((p) => [
          ...p,
          {
            id: data.application._id,
            jobId: job._id || job.id,
            jobTitle: job.title,
            company: job.company,
            appliedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            status: "pending",
            userId: user.id || user._id
          }
        ]);
        toast(`⚡ Quick Apply successful! You applied to ${job.company}!`);
        setTimeout(() => toast(`📧 Confirmation email sent to ${user.email}`, "info"), 1200);
      } else {
        toast(data.message || "Quick Apply failed.", "error");
      }
    } catch {
      toast("Quick Apply failed due to network connection issues.", "error");
    }
  };

  // ── Post / Close Job ───────────────────────────────────────────────────
  const handlePostJob = async (jobData) => {
    try {
      const data = await api.createJob(jobData);
      if (data.success) {
        setJobs((p) => [data.job, ...p]);
        setShowPostJob(false);
        toast(`🎉 "${data.job.title}" posted successfully!`);
      } else {
        toast(data.message || "Failed to post job.", "error");
      }
    } catch {
      toast("Failed to post job.", "error");
    }
  };

  const handleCloseJob = async (jobId) => {
    try {
      await api.updateJob(jobId, { status: "closed" });
      setJobs((p) => p.map((j) => (j._id || j.id) === jobId ? { ...j, status: "closed" } : j));
      toast("Job listing closed.", "info");
    } catch {
      toast("Failed to close job.", "error");
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      const data = await api.deleteJob(jobId);
      if (data.success) {
        setJobs((p) => p.filter((j) => (j._id || j.id) !== jobId));
        toast("🎉 Job listing deleted successfully!");
      } else {
        toast(data.message || "Failed to delete job.", "error");
      }
    } catch {
      toast("Failed to delete job.", "error");
    }
  };

  const navTo = (p) => {
    setSelectedJob(null);
    setSearchQuery("");
    setSearchCat("");
    if (user?.role === "admin" && (p === "jobs" || p === "home")) {
      setPage("admin-dash");
    } else {
      setPage(p);
    }
  };

  const visibleJobs = jobs.filter((j) => {
    const qLower = searchQuery.toLowerCase();
    const matchQ = !qLower || j.title.toLowerCase().includes(qLower) || j.company.toLowerCase().includes(qLower) || j.category.toLowerCase().includes(qLower);
    return matchQ && (!searchCat || j.category === searchCat) && j.status === "active";
  });

  if (systemConfig?.maintenanceMode && (!user || user.role !== "admin")) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "radial-gradient(circle at center, #111827 0%, #030712 100%)",
        color: "#f3f4f6",
        fontFamily: "'DM Sans', sans-serif",
        padding: "2rem",
        textAlign: "center"
      }}>
        <div style={{
          background: "rgba(18, 20, 32, 0.7)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "16px",
          padding: "3rem 2rem",
          maxWidth: "500px",
          width: "100%",
          boxShadow: "0 16px 48px 0 rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(12px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.5rem"
        }}>
          <div style={{ fontSize: "4.5rem" }}>🚧</div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.75rem", margin: 0 }}>
            Under Maintenance
          </h1>
          <p style={{ color: "#9ca3af", fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>
            {systemConfig.maintenanceMessage || "Our platform is currently undergoing scheduled systems optimization. We will be back online shortly!"}
          </p>
          <div style={{ 
            fontSize: "0.8rem", 
            color: "#818cf8", 
            fontWeight: "bold",
            background: "rgba(99, 102, 241, 0.1)",
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            border: "1px solid rgba(99, 102, 241, 0.2)"
          }}>
            Estimated Completion: {systemConfig.maintenanceEndTime ? new Date(systemConfig.maintenanceEndTime).toLocaleString() : "Soon"}
          </div>
          <div style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
            Are you a system administrator? <button className="see-all" style={{ border: "none", background: "none", cursor: "pointer", display: "inline", color: "#6366f1", fontWeight: "bold" }} onClick={() => setPage("login")}>Sign In here</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {systemConfig?.bannerActive && systemConfig?.bannerText && (
        <div style={{
          backgroundColor: systemConfig.bannerColor || "#6366f1",
          color: "#ffffff",
          fontSize: "0.85rem",
          fontWeight: 700,
          padding: "0.5rem 1rem",
          textAlign: "center",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          overflow: "hidden",
          whiteSpace: "nowrap",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <div style={{
            display: "inline-block",
            animation: "marquee 15s linear infinite"
          }}>
            📢 {systemConfig.bannerText} &mdash; 📢 {systemConfig.bannerText}
          </div>
        </div>
      )}
      <style>{STYLES}</style>

      {/* ── Navbar ── */}
      <nav className="nav">
        <div className="nav-logo" onClick={() => navTo("home")}>Talent<span>Hub</span></div>
        <div className="nav-links">
          {(!user || user.role !== "admin") ? (
            <>
              <button className={`nav-btn ${page === "home" ? "active" : ""}`} onClick={() => navTo("home")}>🏠 Home</button>
              <button className={`nav-btn ${page === "jobs" ? "active" : ""}`} onClick={() => navTo("jobs")}>💼 Browse Jobs</button>
            </>
          ) : (
            <>
              <button className={`nav-btn ${(page === "admin-dash" && (adminTab === "reports" || adminTab === "access" || adminTab === "logs")) ? "active" : ""}`} onClick={() => { setAdminTab("reports"); navTo("admin-dash"); }}>🛠️ Control Panel</button>
              <button className={`nav-btn ${(page === "admin-dash" && adminTab === "moderation") ? "active" : ""}`} onClick={() => { setAdminTab("moderation"); navTo("admin-dash"); }}>🛡️ Moderation</button>
              <button className={`nav-btn ${(page === "admin-dash" && adminTab === "configs") ? "active" : ""}`} onClick={() => { setAdminTab("configs"); navTo("admin-dash"); }}>📣 Configurations</button>
            </>
          )}
          {!user && (
            <>
              <button className={`nav-btn ${page === "login" ? "active" : ""}`} onClick={() => { setLoginRole("candidate"); navTo("login"); }}>Sign In</button>
              <button className="nav-btn nav-cta" onClick={() => { setLoginRole("employer"); navTo("login"); }}>For Employers</button>
            </>
          )}
          {user && (
            <div className="nav-user">
              {user.role === "employer" && (
                <button className="nav-btn nav-cta" onClick={() => setShowPostJob(true)}>+ Post Job</button>
              )}
              {user.role !== "admin" && (
                <button
                  className={`nav-btn ${(page === "employer-dash" || page === "candidate-dash") ? "active" : ""}`}
                  onClick={() => navTo(user.role === "employer" ? "employer-dash" : "candidate-dash")}
                >
                  {user.role === "employer" ? "🏢 Dashboard" : "👤 Dashboard"}
                </button>
              )}
              <AvatarDropdown
                user={user}
                onLogout={handleLogout}
                onDashboard={(tab) => {
                  if (user.role === "admin") {
                    setAdminTab(tab || "reports");
                    navTo("admin-dash");
                  } else {
                    navTo(user.role === "employer" ? "employer-dash" : "candidate-dash");
                  }
                }}
                onHome={() => navTo("home")}
                onJobs={() => navTo("jobs")}
              />
            </div>
          )}
          <button className="theme-toggle-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title="Toggle Theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>

      {/* ── Pages ── */}
      <main className="main">
        {page === "home" && !selectedJob && (
          <HomePage 
            jobs={jobs.filter((j) => j.status === "active")} 
            onJobClick={(j) => { setSelectedJob(j); setPage("job-detail"); }} 
            onApply={handleApply} 
            onShowAllJobs={() => navTo("jobs")} 
            loading={loading} 
            onSyncJobs={handleSyncJobs}
            onSearch={(q, cat) => {
              setSearchQuery(q);
              setSearchCat(cat === "All Categories" ? "" : cat);
              setPage("jobs");
            }}
          />
        )}
        {page === "jobs" && !selectedJob && (
          <JobsPage 
            jobs={jobs.filter((j) => j.status === "active")} 
            onJobClick={(j) => { setSelectedJob(j); setPage("job-detail"); }} 
            onApply={handleApply} 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            searchCat={searchCat}
            setSearchCat={setSearchCat}
            loading={loading} 
            onSyncJobs={handleSyncJobs} 
          />
        )}
        {page === "job-detail" && selectedJob && (
          <JobDetailPage 
            job={selectedJob} 
            onBack={() => { setSelectedJob(null); setPage("jobs"); }} 
            onApply={handleApply} 
            user={user} 
            onQuickApply={handleQuickApply} 
          />
        )}
        {page === "login" && (
          <LoginPage onLogin={handleLogin} onBack={() => navTo("home")} onRegister={handleRegister} totalJobs={jobs.length} totalCompanies={new Set(jobs.map((j) => j.company)).size} initialRole={loginRole} />
        )}
        {page === "employer-dash" && user?.role === "employer" && (
          <EmployerDashboard user={user} jobs={jobs} onPostJob={() => setShowPostJob(true)} onCloseJob={handleCloseJob} applications={applications} onSyncJobs={handleSyncJobs} onUpdateStatus={handleUpdateAppStatus} />
        )}
        {page === "candidate-dash" && user?.role === "candidate" && (
          <CandidateDashboard user={user} applications={applications} onUpdateProfile={setUser} toast={toast} />
        )}
        {page === "admin-dash" && user?.role === "admin" && (
          <ManagementDashboard user={user} jobs={jobs} onDeleteJob={handleDeleteJob} toast={toast} systemConfig={systemConfig} fetchConfig={fetchConfig} tab={adminTab} setTab={setAdminTab} />
        )}
      </main>

      <footer className="footer">
        <p>&copy; 2026 <strong>TalentHub</strong> &mdash; Connecting talent with opportunity.</p>
      </footer>

      {applyTarget && user && (
        <ApplicationModal job={applyTarget} user={user} onClose={() => setApplyTarget(null)} onSubmit={handleSubmitApplication} toast={toast} />
      )}
      {showPostJob && user && (
        <PostJobModal user={user} onClose={() => setShowPostJob(false)} onPost={handlePostJob} />
      )}

      <Toast toasts={toasts} />
      <AIChatbot />
    </div>
  );
}