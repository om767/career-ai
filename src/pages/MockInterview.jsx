import React, { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

/* ─── Design tokens ──────────────────────────────────────────────── */
const C = {
  bg:       "#08090D",
  surface:  "#0F1117",
  card:     "#141720",
  border:   "#1E2436",
  borderLt: "#2A3150",
  ink:      "#E8EAF2",
  mid:      "#7A85A0",
  muted:    "#424D66",
  accent:   "#4F8EF7",
  accentDk: "#2D6FD4",
  green:    "#2DD4A0",
  amber:    "#F5C542",
  red:      "#F47068",
  purple:   "#A78BFA",
  glow:     "rgba(79,142,247,0.08)",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500&family=Outfit:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root { color-scheme: dark; }

  .mi-root {
    min-height: 100vh;
    background: ${C.bg};
    color: ${C.ink};
    font-family: 'Outfit', sans-serif;
    font-weight: 300;
  }

  /* ── LANDING ── */
  .mi-landing {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: clamp(2rem, 6vw, 5rem) clamp(1.25rem, 4vw, 2.5rem);
    position: relative;
    overflow: hidden;
  }

  .mi-landing::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(${C.border} 1px, transparent 1px),
      linear-gradient(90deg, ${C.border} 1px, transparent 1px);
    background-size: 52px 52px;
    opacity: 0.3;
    pointer-events: none;
  }

  .mi-glow-orb {
    position: fixed;
    border-radius: 50%;
    pointer-events: none;
    filter: blur(80px);
  }
  .mi-glow-orb.top {
    top: -15%;
    left: 50%;
    transform: translateX(-50%);
    width: 800px;
    height: 500px;
    background: radial-gradient(ellipse, rgba(79,142,247,0.13) 0%, transparent 70%);
  }
  .mi-glow-orb.bottom-left {
    bottom: -10%;
    left: -10%;
    width: 400px;
    height: 400px;
    background: radial-gradient(ellipse, rgba(45,212,160,0.07) 0%, transparent 70%);
  }

  .mi-landing-inner {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 800px;
    text-align: center;
  }

  .mi-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10.5px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: ${C.accent};
    border: 1px solid ${C.border};
    padding: 6px 16px;
    border-radius: 100px;
    margin-bottom: 2rem;
    background: rgba(79,142,247,0.06);
    backdrop-filter: blur(4px);
  }
  .mi-tag .dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: ${C.green};
    box-shadow: 0 0 8px ${C.green};
    animation: blink 2s ease-in-out infinite;
  }

  .mi-hero-title {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: clamp(2.6rem, 6.5vw, 5rem);
    line-height: 1.04;
    letter-spacing: -0.04em;
    margin-bottom: 1.4rem;
    color: ${C.ink};
  }
  .mi-hero-title .accent { color: ${C.accent}; }
  .mi-hero-title .dim { color: ${C.mid}; }

  .mi-hero-sub {
    font-size: clamp(0.95rem, 2vw, 1.1rem);
    color: ${C.mid};
    line-height: 1.8;
    max-width: 520px;
    margin: 0 auto 3rem;
  }

  .mi-form-row {
    display: flex;
    gap: 0.85rem;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 3.5rem;
  }

  .mi-select-wrap {
    flex: 1 1 260px;
    max-width: 380px;
    position: relative;
  }
  .mi-select-wrap::after {
    content: '▾';
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: ${C.muted};
    pointer-events: none;
    font-size: 12px;
  }
  .mi-select {
    width: 100%;
    padding: 0.85rem 2.5rem 0.85rem 1.1rem;
    background: ${C.surface};
    border: 1px solid ${C.border};
    border-radius: 10px;
    color: ${C.ink};
    font-family: 'Outfit', sans-serif;
    font-size: 0.9rem;
    outline: none;
    cursor: pointer;
    appearance: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .mi-select:focus { border-color: ${C.accent}; box-shadow: 0 0 0 3px rgba(79,142,247,0.12); }
  .mi-select option { background: ${C.surface}; }

  .mi-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 0.85rem 1.8rem;
    background: ${C.accent};
    color: #fff;
    border: none;
    border-radius: 10px;
    font-family: 'Outfit', sans-serif;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
    white-space: nowrap;
    flex-shrink: 0;
    letter-spacing: 0.01em;
  }
  .mi-btn:hover { background: ${C.accentDk}; transform: translateY(-2px); box-shadow: 0 6px 24px rgba(79,142,247,0.3); }
  .mi-btn:active { transform: translateY(0); box-shadow: none; }
  .mi-btn:disabled { background: ${C.muted}; cursor: not-allowed; transform: none; box-shadow: none; }
  .mi-btn.ghost {
    background: transparent;
    border: 1px solid ${C.border};
    color: ${C.mid};
    box-shadow: none;
  }
  .mi-btn.ghost:hover { border-color: ${C.accent}; color: ${C.accent}; background: rgba(79,142,247,0.06); box-shadow: none; transform: translateY(-1px); }

  /* Feature cards */
  .mi-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
    width: 100%;
  }
  .mi-feat-card {
    background: ${C.surface};
    border: 1px solid ${C.border};
    border-radius: 12px;
    padding: 1.4rem 1.25rem;
    text-align: left;
    transition: border-color 0.25s, transform 0.2s, box-shadow 0.2s;
    position: relative;
    overflow: hidden;
  }
  .mi-feat-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(79,142,247,0.5), transparent);
    opacity: 0;
    transition: opacity 0.3s;
  }
  .mi-feat-card:hover { border-color: ${C.borderLt}; transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.4); }
  .mi-feat-card:hover::before { opacity: 1; }
  .mi-feat-icon { font-size: 1.6rem; margin-bottom: 0.75rem; }
  .mi-feat-title {
    font-family: 'Syne', sans-serif;
    font-size: 0.95rem;
    font-weight: 700;
    color: ${C.ink};
    margin-bottom: 0.4rem;
  }
  .mi-feat-desc { font-size: 0.82rem; color: ${C.mid}; line-height: 1.65; }

  /* ── INTERVIEW SCREEN ── */
  .mi-interview {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  .mi-interview-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.9rem 1.5rem;
    background: ${C.surface};
    border-bottom: 1px solid ${C.border};
    flex-wrap: wrap;
    flex-shrink: 0;
  }
  .mi-role-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10.5px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    background: rgba(79,142,247,0.1);
    color: ${C.accent};
    border: 1px solid rgba(79,142,247,0.25);
    padding: 5px 14px;
    border-radius: 100px;
  }
  .mi-q-counter {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    color: ${C.muted};
    letter-spacing: 0.08em;
  }
  .mi-score-wrap {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .mi-score-label {
    font-size: 10.5px;
    color: ${C.muted};
    font-family: 'IBM Plex Mono', monospace;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }
  .mi-score-val {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 1.3rem;
    color: ${C.accent};
  }

  .mi-progress-bar { height: 2px; background: ${C.border}; flex-shrink: 0; }
  .mi-progress-fill { height: 100%; background: linear-gradient(90deg, ${C.accent}, ${C.purple}); transition: width 0.5s ease; }

  .mi-interview-body {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  /* Chat pane */
  .mi-chat-pane {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    border-right: 1px solid ${C.border};
  }

  .mi-chat-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.9rem 1.4rem;
    border-bottom: 1px solid ${C.border};
    background: ${C.surface};
    flex-shrink: 0;
  }
  .mi-avatar {
    width: 38px; height: 38px;
    border-radius: 50%;
    background: rgba(79,142,247,0.12);
    border: 1px solid rgba(79,142,247,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    flex-shrink: 0;
  }
  .mi-avatar.user {
    background: rgba(45,212,160,0.1);
    border-color: rgba(45,212,160,0.3);
  }

  .mi-typing-dots {
    display: flex;
    align-items: center;
    gap: 5px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    color: ${C.muted};
  }
  .mi-typing-dots span {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: ${C.accent};
    animation: blink 1s ease-in-out infinite;
  }
  .mi-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
  .mi-typing-dots span:nth-child(3) { animation-delay: 0.4s; }

  .mi-messages {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem 1.4rem;
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
    scrollbar-width: thin;
    scrollbar-color: ${C.border} transparent;
  }

  .mi-bubble-row {
    display: flex;
    align-items: flex-end;
    gap: 10px;
  }
  .mi-bubble-row.user { flex-direction: row-reverse; }

  .mi-bubble {
    max-width: 76%;
    padding: 0.8rem 1.1rem;
    border-radius: 14px;
    font-size: 0.9rem;
    line-height: 1.7;
    position: relative;
  }
  .mi-bubble.ai {
    background: ${C.card};
    border: 1px solid ${C.border};
    color: ${C.ink};
    border-bottom-left-radius: 4px;
  }
  .mi-bubble.user {
    background: linear-gradient(135deg, ${C.accent}, ${C.accentDk});
    color: #fff;
    border-bottom-right-radius: 4px;
    box-shadow: 0 4px 16px rgba(79,142,247,0.25);
  }
  .mi-bubble-time {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    color: ${C.muted};
    margin-top: 4px;
  }

  .mi-input-bar {
    padding: 0.9rem 1.4rem;
    border-top: 1px solid ${C.border};
    background: ${C.surface};
    display: flex;
    gap: 0.7rem;
    align-items: flex-end;
    flex-shrink: 0;
  }
  .mi-textarea {
    flex: 1;
    padding: 0.75rem 1rem;
    background: ${C.bg};
    border: 1px solid ${C.border};
    border-radius: 10px;
    color: ${C.ink};
    font-family: 'Outfit', sans-serif;
    font-size: 0.875rem;
    resize: none;
    outline: none;
    line-height: 1.5;
    transition: border-color 0.2s, box-shadow 0.2s;
    min-height: 44px;
    max-height: 120px;
  }
  .mi-textarea:focus { border-color: ${C.accent}; box-shadow: 0 0 0 3px rgba(79,142,247,0.1); }
  .mi-textarea::placeholder { color: ${C.muted}; }
  .mi-send-btn {
    width: 44px; height: 44px;
    border-radius: 10px;
    background: ${C.accent};
    border: none;
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  }
  .mi-send-btn:hover { background: ${C.accentDk}; transform: scale(1.06); box-shadow: 0 4px 16px rgba(79,142,247,0.35); }
  .mi-send-btn:disabled { background: ${C.muted}; cursor: not-allowed; transform: none; box-shadow: none; }

  /* Sidebar */
  .mi-sidebar {
    width: 310px;
    flex-shrink: 0;
    overflow-y: auto;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    scrollbar-width: thin;
    scrollbar-color: ${C.border} transparent;
    background: ${C.surface};
  }

  .mi-panel {
    background: ${C.card};
    border: 1px solid ${C.border};
    border-radius: 12px;
    padding: 1.1rem;
  }
  .mi-panel-title {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: ${C.muted};
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .mi-panel-title::before {
    content: '';
    display: block;
    width: 14px; height: 1.5px;
    background: ${C.accent};
    border-radius: 2px;
  }

  .mi-bar-wrap { margin-bottom: 1rem; }
  .mi-bar-header {
    display: flex;
    justify-content: space-between;
    font-size: 0.78rem;
    color: ${C.mid};
    margin-bottom: 6px;
  }
  .mi-bar-track {
    height: 5px;
    background: ${C.border};
    border-radius: 100px;
    overflow: hidden;
  }
  .mi-bar-fill {
    height: 100%;
    border-radius: 100px;
    transition: width 0.6s ease;
  }
  .mi-bar-fill.green  { background: ${C.green}; box-shadow: 0 0 8px ${C.green}40; }
  .mi-bar-fill.amber  { background: ${C.amber}; }
  .mi-bar-fill.accent { background: ${C.accent}; }
  .mi-bar-fill.red    { background: ${C.red}; }

  .mi-kw-row {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-top: 4px;
  }
  .mi-kw {
    font-size: 10.5px;
    font-family: 'IBM Plex Mono', monospace;
    color: ${C.amber};
    background: rgba(245,197,66,0.1);
    border: 1px solid rgba(245,197,66,0.2);
    padding: 3px 9px;
    border-radius: 100px;
  }

  .mi-section-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  .mi-suggestion {
    font-size: 0.82rem;
    color: ${C.mid};
    line-height: 1.65;
    border-left: 2px solid ${C.accent};
    padding-left: 10px;
  }

  .mi-star-box {
    background: ${C.bg};
    border: 1px solid ${C.border};
    border-radius: 8px;
    padding: 0.75rem 0.9rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10.5px;
    color: ${C.mid};
    line-height: 1.75;
    white-space: pre-wrap;
    word-break: break-word;
    margin-top: 5px;
  }

  .mi-tips li {
    font-size: 0.8rem;
    color: ${C.mid};
    padding: 6px 0;
    border-bottom: 1px solid ${C.border};
    list-style: none;
    display: flex;
    gap: 9px;
    align-items: flex-start;
    line-height: 1.6;
  }
  .mi-tips li::before { content: '→'; color: ${C.accent}; flex-shrink: 0; }
  .mi-tips li:last-child { border-bottom: none; }

  .mi-empty {
    text-align: center;
    color: ${C.muted};
    font-size: 0.82rem;
    padding: 2rem 0;
    line-height: 1.8;
  }
  .mi-empty-icon { font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.5; }

  /* ── SUMMARY ── */
  .mi-summary {
    min-height: 100vh;
    padding: clamp(2rem, 5vw, 4rem) clamp(1.25rem, 4vw, 2.5rem);
    position: relative;
    overflow: hidden;
  }
  .mi-summary::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(${C.border} 1px, transparent 1px),
      linear-gradient(90deg, ${C.border} 1px, transparent 1px);
    background-size: 52px 52px;
    opacity: 0.25;
    pointer-events: none;
  }
  .mi-summary-inner { max-width: 1000px; margin: 0 auto; position: relative; z-index: 1; }

  .mi-summary-hero {
    text-align: center;
    margin-bottom: 3rem;
  }
  .mi-summary-title {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: clamp(2.2rem, 5.5vw, 4rem);
    letter-spacing: -0.03em;
    margin: 0.75rem 0 0.4rem;
    color: ${C.ink};
  }
  .mi-summary-sub { font-size: 0.95rem; color: ${C.mid}; }

  .mi-summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
    gap: 1.25rem;
  }

  .mi-sum-card {
    background: ${C.surface};
    border: 1px solid ${C.border};
    border-radius: 14px;
    padding: clamp(1.1rem, 3vw, 1.6rem);
    transition: border-color 0.2s;
  }
  .mi-sum-card:hover { border-color: ${C.borderLt}; }
  .mi-sum-card.wide { grid-column: 1 / -1; }
  .mi-sum-card-title {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 1rem;
    margin-bottom: 1.1rem;
    color: ${C.ink};
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .mi-big-score {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: clamp(3.5rem, 9vw, 5.5rem);
    line-height: 1;
    letter-spacing: -0.05em;
    margin-bottom: 0.6rem;
  }
  .mi-score-track {
    height: 5px;
    background: ${C.border};
    border-radius: 100px;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }
  .mi-score-fill {
    height: 100%;
    border-radius: 100px;
    background: linear-gradient(90deg, ${C.accent}, ${C.green});
    transition: width 1s ease;
  }
  .mi-score-legend {
    display: flex;
    justify-content: space-between;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9.5px;
    color: ${C.muted};
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .mi-readiness-section { margin-bottom: 1.1rem; }
  .mi-readiness-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    margin-bottom: 0.45rem;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .mi-readiness-label.green { color: ${C.green}; }
  .mi-readiness-label.amber { color: ${C.amber}; }
  .mi-readiness-label.blue  { color: ${C.accent}; }

  .mi-readiness-list { list-style: none; padding: 0; }
  .mi-readiness-list li {
    font-size: 0.82rem;
    color: ${C.mid};
    padding: 5px 0;
    border-bottom: 1px solid ${C.border};
    display: flex;
    gap: 9px;
  }
  .mi-readiness-list li:last-child { border-bottom: none; }
  .mi-readiness-list li::before { content: '·'; color: ${C.muted}; flex-shrink: 0; }

  .mi-action-row {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  .mi-action-row .mi-btn { flex: 1 1 140px; justify-content: center; }

  .mi-practice-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    gap: 0.85rem;
  }
  .mi-practice-card {
    background: ${C.card};
    border: 1px solid ${C.border};
    border-radius: 10px;
    padding: 0.95rem 1rem;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s, transform 0.2s, box-shadow 0.2s;
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }
  .mi-practice-card:hover {
    border-color: ${C.accent};
    background: rgba(79,142,247,0.06);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  }
  .mi-practice-icon { font-size: 1.5rem; flex-shrink: 0; margin-top: 1px; }
  .mi-practice-name { font-size: 0.875rem; font-weight: 500; color: ${C.ink}; margin-bottom: 3px; }
  .mi-practice-desc { font-size: 0.76rem; color: ${C.muted}; line-height: 1.5; }
  .mi-practice-cta { font-size: 10.5px; color: ${C.accent}; font-family: 'IBM Plex Mono', monospace; margin-top: 5px; }

  /* Modal */
  .mi-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }
  .mi-modal {
    background: ${C.card};
    border: 1px solid ${C.border};
    border-radius: 16px;
    padding: 2rem;
    max-width: 420px;
    width: 100%;
    text-align: center;
    box-shadow: 0 24px 80px rgba(0,0,0,0.6);
  }
  .mi-modal-icon { font-size: 2.5rem; margin-bottom: 1rem; }
  .mi-modal-title {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 1.2rem;
    color: ${C.ink};
    margin-bottom: 0.6rem;
  }
  .mi-modal-text { font-size: 0.88rem; color: ${C.mid}; line-height: 1.7; margin-bottom: 1.5rem; }
  .mi-modal-actions { display: flex; gap: 0.75rem; justify-content: center; }

  /* Shared */
  @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0.2;} }
  @keyframes spin  { to{transform:rotate(360deg);} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:translateY(0);} }

  .mi-spinner {
    width: 15px; height: 15px;
    border: 2px solid rgba(255,255,255,0.25);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.75s linear infinite;
    flex-shrink: 0;
  }

  .mi-bubble-row { animation: fadeUp 0.25s ease; }

  @media (max-width: 700px) {
    .mi-interview { height: auto; overflow: auto; }
    .mi-interview-body { flex-direction: column; }
    .mi-chat-pane { border-right: none; border-bottom: 1px solid ${C.border}; min-height: 55vh; }
    .mi-sidebar { width: 100%; }
    .mi-messages { max-height: 45vh; }
  }
  @media (max-width: 480px) {
    .mi-form-row { flex-direction: column; align-items: stretch; }
    .mi-select-wrap { max-width: 100%; }
    .mi-btn { justify-content: center; }
    .mi-score-wrap { margin-left: 0; }
    .mi-summary-grid { grid-template-columns: 1fr; }
  }
`;

/* ─── Helpers ───────────────────────────────────────────────── */
const fmt = (d) => d.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:false});

function barColor(v) {
  if (v >= 75) return "green";
  if (v >= 50) return "accent";
  if (v >= 30) return "amber";
  return "red";
}
function scoreColor(v) {
  if (v >= 75) return C.green;
  if (v >= 50) return C.accent;
  if (v >= 30) return C.amber;
  return C.red;
}
function getReadinessData(score) {
  if (score >= 66) return {
    title: "Interview Ready! 🎉",
    strengths: ["Clear and confident communication","Relevant examples and experiences","Good understanding of role requirements"],
    weaknesses: ["Consider practicing salary negotiation","Prepare more technical depth questions"],
    roadmap: "You're well-prepared! Focus on company research and prepare thoughtful questions for the interviewer.",
  };
  if (score >= 33) return {
    title: "Getting There! 💪",
    strengths: ["Shows basic understanding of the role","Demonstrates relevant experience","Positive attitude and enthusiasm"],
    weaknesses: ["Need more specific examples","Improve storytelling structure (STAR method)","Practice technical terminology"],
    roadmap: "Practice more behavioral questions and develop concrete examples using the STAR method.",
  };
  return {
    title: "Keep Practicing! 📚",
    strengths: ["Showing interest in the position","Willing to learn and improve","Good foundation to build upon"],
    weaknesses: ["Need more preparation on role basics","Develop clear examples from experience","Work on confident delivery","Research common interview questions"],
    roadmap: "Focus on fundamental interview skills. Practice common questions and develop your personal story.",
  };
}

const ROLES = {
  hr:        { label: "HR Manager",        icon: "👥" },
  technical: { label: "Technical Lead",     icon: "💻" },
  data:      { label: "Data Analyst",       icon: "📊" },
  developer: { label: "Software Developer", icon: "🚀" },
  marketing: { label: "Marketing Manager",  icon: "📈" },
  sales:     { label: "Sales Executive",    icon: "💼" },
};

const FALLBACK_QUESTIONS = {
  hr:        ["Tell me about yourself and what interests you about this role?","What motivates you in your work?","How do you handle workplace conflicts?","Describe a challenging situation you've overcome.","Where do you see yourself in 5 years?","What are your salary expectations?","Why are you leaving your current job?","Do you have any questions for us?"],
  technical: ["Tell me about yourself and your technical background.","Explain the difference between SQL and NoSQL databases.","How would you optimize a slow-running query?","Describe your experience with cloud platforms.","Walk me through your debugging process.","How do you stay updated with technology trends?","Describe a complex technical problem you solved.","What questions do you have about our tech stack?"],
  data:      ["Tell me about yourself and your data analysis experience.","How do you approach a new dataset?","Explain the difference between correlation and causation.","Describe your experience with data visualization tools.","How do you handle missing or dirty data?","What's your process for validating your analysis?","Tell me about a time when your analysis changed business decisions.","What questions do you have about our data infrastructure?"],
  developer: ["Tell me about yourself and your development experience.","What's your favorite programming language and why?","How do you approach debugging a complex issue?","Describe your experience with version control systems.","How do you ensure code quality in your projects?","Tell me about a challenging project you've worked on.","How do you stay current with new technologies?","What questions do you have about our development process?"],
  marketing: ["Tell me about yourself and your marketing background.","How do you measure the success of a marketing campaign?","Describe your experience with digital marketing channels.","How do you identify and target your ideal customer?","Tell me about a successful campaign you've managed.","How do you stay updated with marketing trends?","Describe your approach to budget allocation.","What questions do you have about our marketing strategy?"],
  sales:     ["Tell me about yourself and your sales experience.","How do you handle rejection in sales?","Describe your sales process from lead to close.","How do you build rapport with potential clients?","Tell me about your biggest sales win.","How do you stay motivated during slow periods?","Describe your approach to CRM management.","What questions do you have about our sales targets?"],
};

const PRACTICE_OPTIONS = [
  { id:"leadership", title:"Leadership Round",    icon:"👑", description:"Leadership and management scenarios" },
  { id:"technical",  title:"Technical Deep-dive", icon:"⚡", description:"Advanced technical problem solving" },
  { id:"behavioral", title:"Behavioral Questions",icon:"🧠", description:"STAR method and soft skills" },
  { id:"case",       title:"Case Study",          icon:"📋", description:"Business problem analysis" },
];

const TOTAL = 8;

/* ─── Main Component ────────────────────────────────────────── */
export default function MockInterview() {
  const [screen, setScreen]         = useState("landing");
  const [selectedRole, setSelectedRole] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [messages, setMessages]     = useState([]);
  const [isTyping, setIsTyping]     = useState(false);
  const [feedback, setFeedback]     = useState(null);
  const [aiQuestions, setAiQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const messagesEndRef = useRef(null);
  const answerInputRef = useRef(null);

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

  /* Auto-scroll */
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  /* Generate questions on role select */
  useEffect(() => {
    if (!selectedRole) { setAiQuestions([]); return; }
    setIsLoadingQuestions(true);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    model.generateContent(
      `Generate 8 interview questions for the role of ${ROLES[selectedRole].label}. Number them 1-8, each on a new line.`
    ).then(r => {
      const text = r.response.text();
      const arr = text.split("\n")
        .map(q => q.trim())
        .filter(q => q.length > 0 && /^\d+\./.test(q))
        .map(q => q.replace(/^\d+\.\s*/, ""));
      setAiQuestions(arr);
    }).catch(() => setAiQuestions([]))
      .finally(() => setIsLoadingQuestions(false));
  }, [selectedRole]);

  const getQ = (i) => (aiQuestions.length > i ? aiQuestions[i] : FALLBACK_QUESTIONS[selectedRole]?.[i]) || "";

  const handleStartInterview = () => {
    if (!selectedRole) return;
    setScreen("interview");
    setCurrentQuestionIndex(0);
    setConfidenceScore(0);
    setFeedback(null);
    setMessages([{ text: getQ(0), isAI: true, timestamp: new Date() }]);
  };

  const handleAnswerSubmit = (e) => {
    e?.preventDefault?.();
    const answer = answerInputRef.current?.value?.trim();
    if (!answer || isTyping) return;
    setMessages(prev => [...prev, { text: answer, isAI: false, timestamp: new Date() }]);
    answerInputRef.current.value = "";
    generateFeedback(answer);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const next = currentQuestionIndex + 1;
      if (next >= TOTAL) { setScreen("summary"); return; }
      setMessages(prev => [...prev, { text: getQ(next), isAI: true, timestamp: new Date() }]);
      setCurrentQuestionIndex(next);
    }, 2000);
  };

  const generateFeedback = (answer) => {
    const wordCount = answer.split(" ").length;
    const hasExamples = /example|project|experience/i.test(answer);
    const clarity = Math.min(95, Math.max(20, wordCount * 2 + (hasExamples ? 20 : 0)));
    const COMMON = ["leadership","teamwork","problem-solving","communication","results","metrics","collaboration","innovation","efficiency"];
    const missing = COMMON.filter(k => !answer.toLowerCase().includes(k)).slice(0, 3);
    const suggestion =
      clarity < 40  ? "Try to be more specific and provide concrete details about your experience." :
      !hasExamples   ? "Consider adding a specific example to illustrate your point." :
      clarity < 70   ? "Great start! Strengthen this by quantifying your impact with numbers." :
                       "Excellent response! Clear, specific examples with great detail.";
    setFeedback({ clarity, missing, suggestion });
    setConfidenceScore(Math.min(100, clarity + (hasExamples ? 10 : 0)));
  };

  const restartInterview = () => {
    setScreen("landing"); setSelectedRole(""); setCurrentQuestionIndex(0);
    setConfidenceScore(0); setMessages([]); setFeedback(null); setAiQuestions([]);
  };

  const startPracticeSession = (title) => {
    setModalMessage(`Starting ${title} practice session…`);
    setIsModalOpen(true);
  };

  /* ── RENDER ── */
  return (
    <>
      <style>{css}</style>
      <div className="mi-root">

        {/* ─── LANDING ─── */}
        {screen === "landing" && (
          <div className="mi-landing">
            <div className="mi-glow-orb top" />
            <div className="mi-glow-orb bottom-left" />
            <div className="mi-landing-inner">
              <div className="mi-tag"><span className="dot" /> AI-Powered · Mock Interviews</div>

              <h1 className="mi-hero-title">
                Practice smarter.<br />
                <span className="accent">Interview</span>{" "}
                <span className="dim">better.</span>
              </h1>
              <p className="mi-hero-sub">
                Simulate real interviews with AI-generated questions, live feedback,
                and a confidence score to track your readiness.
              </p>

              <div className="mi-form-row">
                <div className="mi-select-wrap">
                  <select
                    className="mi-select"
                    value={selectedRole}
                    onChange={e => setSelectedRole(e.target.value)}
                  >
                    <option value="">Select your target role…</option>
                    {Object.entries(ROLES).map(([k, v]) => (
                      <option key={k} value={k}>{v.icon}  {v.label}</option>
                    ))}
                  </select>
                </div>
                <button
                  className="mi-btn"
                  onClick={handleStartInterview}
                  disabled={!selectedRole || isLoadingQuestions}
                >
                  {isLoadingQuestions
                    ? <><span className="mi-spinner" /> Generating…</>
                    : <>▶ Start Interview</>}
                </button>
              </div>

              <div className="mi-cards">
                {[
                  { icon: "🎯", title: "Skills Mapping",     desc: "AI-powered assessment of your strengths and gaps." },
                  { icon: "⚡", title: "Real-Time Feedback", desc: "Live scoring and suggestions after every answer." },
                  { icon: "🧠", title: "AI Insights",        desc: "Personalised tips based on your actual responses." },
                ].map(f => (
                  <div className="mi-feat-card" key={f.title}>
                    <div className="mi-feat-icon">{f.icon}</div>
                    <div className="mi-feat-title">{f.title}</div>
                    <div className="mi-feat-desc">{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── INTERVIEW ─── */}
        {screen === "interview" && (
          <div className="mi-interview">
            {/* Header */}
            <div className="mi-interview-header">
              <div className="mi-role-badge">{ROLES[selectedRole].icon} {ROLES[selectedRole].label}</div>
              <div className="mi-q-counter">Q {currentQuestionIndex + 1} / {TOTAL}</div>
              <div className="mi-score-wrap">
                <span className="mi-score-label">Score</span>
                <span className="mi-score-val">{Math.round(confidenceScore)}</span>
              </div>
            </div>
            <div className="mi-progress-bar">
              <div className="mi-progress-fill" style={{ width: `${(currentQuestionIndex / TOTAL) * 100}%` }} />
            </div>

            {/* Body */}
            <div className="mi-interview-body">
              {/* Chat */}
              <div className="mi-chat-pane">
                <div className="mi-chat-topbar">
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div className="mi-avatar">🤖</div>
                    <div>
                      <div style={{ fontSize:"0.875rem", fontWeight:500, color:C.ink }}>AI Interviewer</div>
                      <div style={{ fontSize:"11px", color:C.muted, fontFamily:"'IBM Plex Mono',monospace" }}>
                        {isTyping ? "Typing…" : "Ready"}
                      </div>
                    </div>
                  </div>
                  {isTyping && (
                    <div className="mi-typing-dots">
                      <span/><span/><span/>
                    </div>
                  )}
                </div>

                <div className="mi-messages">
                  {messages.map((m, i) => (
                    <div key={i} className={`mi-bubble-row${m.isAI ? "" : " user"}`}>
                      <div className={`mi-avatar${m.isAI ? "" : " user"}`}>
                        {m.isAI ? "🤖" : "🙂"}
                      </div>
                      <div>
                        <div className={`mi-bubble ${m.isAI ? "ai" : "user"}`}>{m.text}</div>
                        <div className="mi-bubble-time" style={{ textAlign: m.isAI ? "left" : "right" }}>
                          {fmt(m.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="mi-input-bar">
                  <textarea
                    ref={answerInputRef}
                    className="mi-textarea"
                    rows={1}
                    placeholder="Type your answer… (Enter to send, Shift+Enter for new line)"
                    disabled={isTyping}
                    onKeyDown={e => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAnswerSubmit(); }
                    }}
                  />
                  <button className="mi-send-btn" onClick={handleAnswerSubmit} disabled={isTyping}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Sidebar */}
              <div className="mi-sidebar">
                {/* Live Feedback */}
                <div className="mi-panel">
                  <div className="mi-panel-title">Live Feedback</div>
                  {!feedback ? (
                    <div className="mi-empty">
                      <div className="mi-empty-icon">💬</div>
                      Answer a question<br />to see feedback here.
                    </div>
                  ) : (
                    <>
                      <div className="mi-bar-wrap">
                        <div className="mi-bar-header"><span>Clarity</span><span>{feedback.clarity}/100</span></div>
                        <div className="mi-bar-track">
                          <div className={`mi-bar-fill ${barColor(feedback.clarity)}`} style={{ width:`${feedback.clarity}%` }} />
                        </div>
                      </div>
                      <div className="mi-bar-wrap">
                        <div className="mi-bar-header"><span>Confidence Score</span><span>{Math.round(confidenceScore)}</span></div>
                        <div className="mi-bar-track">
                          <div className={`mi-bar-fill ${barColor(confidenceScore)}`} style={{ width:`${confidenceScore}%` }} />
                        </div>
                      </div>

                      {feedback.missing.length > 0 && (
                        <div style={{ marginBottom:"1rem" }}>
                          <div className="mi-section-label" style={{ color:C.amber }}>Missing Keywords</div>
                          <div className="mi-kw-row">
                            {feedback.missing.map(k => <span className="mi-kw" key={k}>{k}</span>)}
                          </div>
                        </div>
                      )}

                      <div style={{ marginBottom:"1rem" }}>
                        <div className="mi-section-label" style={{ color:C.accent }}>Suggestion</div>
                        <div className="mi-suggestion">{feedback.suggestion}</div>
                      </div>

                      <div>
                        <div className="mi-section-label" style={{ color:C.purple }}>STAR Example</div>
                        <div className="mi-star-box">{`Situation: Team struggling with response times.\nTask: Reduce response time by 50%.\nAction: New ticketing system + templates.\nResult: 4h → 1.5h, +35% satisfaction.`}</div>
                      </div>
                    </>
                  )}
                </div>

                {/* Tips */}
                <div className="mi-panel">
                  <div className="mi-panel-title">Interview Tips</div>
                  <ul className="mi-tips">
                    <li>Use the STAR method for behavioural questions</li>
                    <li>Include specific numbers and metrics</li>
                    <li>Show genuine enthusiasm for the role</li>
                    <li>Ask thoughtful follow-up questions</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── SUMMARY ─── */}
        {screen === "summary" && (() => {
          const r = getReadinessData(confidenceScore);
          return (
            <div className="mi-summary">
              <div className="mi-glow-orb top" />
              <div className="mi-summary-inner">
                <div className="mi-summary-hero">
                  <div className="mi-tag"><span className="dot" /> Interview Complete</div>
                  <h1 className="mi-summary-title">{r.title}</h1>
                  <p className="mi-summary-sub">{ROLES[selectedRole].icon} {ROLES[selectedRole].label} · Interview Summary</p>
                </div>

                <div className="mi-summary-grid">
                  {/* Score */}
                  <div className="mi-sum-card">
                    <div className="mi-sum-card-title">📊 Final Score</div>
                    <div className="mi-big-score" style={{ color: scoreColor(confidenceScore) }}>
                      {Math.round(confidenceScore)}
                    </div>
                    <div className="mi-score-track">
                      <div className="mi-score-fill" style={{ width:`${confidenceScore}%`, background: scoreColor(confidenceScore) }} />
                    </div>
                    <div className="mi-score-legend">
                      <span>Needs Practice</span><span>Getting There</span><span>Ready</span>
                    </div>
                  </div>

                  {/* Readiness */}
                  <div className="mi-sum-card">
                    <div className="mi-sum-card-title">🗂 Readiness Report</div>
                    <div className="mi-readiness-section">
                      <div className="mi-readiness-label green">✓ Strengths</div>
                      <ul className="mi-readiness-list">{r.strengths.map((s,i) => <li key={i}>{s}</li>)}</ul>
                    </div>
                    <div className="mi-readiness-section">
                      <div className="mi-readiness-label amber">⚠ Improve</div>
                      <ul className="mi-readiness-list">{r.weaknesses.map((w,i) => <li key={i}>{w}</li>)}</ul>
                    </div>
                    <div className="mi-readiness-section">
                      <div className="mi-readiness-label blue">→ Next Steps</div>
                      <p style={{ fontSize:"0.82rem", color:C.mid, lineHeight:1.65 }}>{r.roadmap}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mi-sum-card wide">
                    <div className="mi-sum-card-title">🔁 What's Next?</div>
                    <div className="mi-action-row">
                      <button className="mi-btn" onClick={restartInterview}>↩ Try Again</button>
                      <button className="mi-btn ghost">⬇ Export PDF</button>
                      <button className="mi-btn ghost">↗ Share Results</button>
                    </div>
                  </div>

                  {/* Practice */}
                  <div className="mi-sum-card wide">
                    <div className="mi-sum-card-title">⚡ Recommended Practice</div>
                    <div className="mi-practice-grid">
                      {PRACTICE_OPTIONS.map(o => (
                        <div className="mi-practice-card" key={o.id} onClick={() => startPracticeSession(o.title)}>
                          <div className="mi-practice-icon">{o.icon}</div>
                          <div>
                            <div className="mi-practice-name">{o.title}</div>
                            <div className="mi-practice-desc">{o.description}</div>
                            <div className="mi-practice-cta">Start →</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ─── MODAL ─── */}
        {isModalOpen && (
          <div className="mi-modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="mi-modal" onClick={e => e.stopPropagation()}>
              <div className="mi-modal-icon">🚀</div>
              <div className="mi-modal-title">Coming Soon</div>
              <div className="mi-modal-text">{modalMessage}<br />This feature is currently being developed.</div>
              <div className="mi-modal-actions">
                <button className="mi-btn" onClick={() => setIsModalOpen(false)}>Got it</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
