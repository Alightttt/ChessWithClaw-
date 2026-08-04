import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import PageTransition from '../components/PageTransition';

export default function Legal() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = 'Privacy & Terms — ChessWithClaw';
  }, []);

  const handleGoBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: '40px' }}>
      <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: '20px', color: '#f2f2f2', marginBottom: '16px', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '8px', height: '24px', background: '#e63946', borderRadius: '4px' }} />
        {title}
      </h2>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '15px', color: 'rgba(242,242,242,0.6)', lineHeight: 1.8 }}>{children}</div>
    </div>
  );

  return (
    <PageTransition>
      <div style={{ minHeight: '100dvh', backgroundColor: '#0a0a0a', color: '#f2f2f2', position: 'relative', overflow: 'hidden' }} className="font-sans selection:bg-red-500/30 pb-20">
        
        {/* Background Gradients to match Home */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 20% 0%, rgba(230,57,70,0.08), transparent 50%), radial-gradient(circle at 80% 100%, rgba(230,57,70,0.05), transparent 50%)', pointerEvents: 'none', zIndex: 0 }} />

        {/* Header */}
        <header style={{ height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: 'rgba(10,10,10,0.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 50 }}>
          <button 
            onClick={handleGoBack} 
            className="text-neutral-400 hover:text-white transition-all active:scale-[0.95]"
            style={{ minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', marginLeft: '-12px' }}
          >
            <ChevronLeft size={28} strokeWidth={2.5} />
          </button>
          
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.15s ease' }} onClick={() => navigate('/')} className="active:translate-y-[1px] active:scale-[0.98]">
            <img 
              src="https://jkawzziklwoxfxicbtvf.supabase.co/storage/v1/object/public/assets/logo-v2.png" 
              alt="ChessWithClaw Logo" 
              draggable={false}
              style={{ width: '130px', height: 'auto', objectFit: 'contain' }} 
            />
          </div>
          <div style={{ width: '44px' }} />
        </header>

        {/* Content */}
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '64px 24px', position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: '56px', textAlign: 'center' }}>
            <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 'min(48px, 11vw)', color: '#f2f2f2', marginBottom: '16px', letterSpacing: '-0.04em' }}>Legal Information</h1>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '16px', color: 'rgba(242,242,242,0.5)' }}>Privacy Policy and Terms of Service — Effective from January 2024</p>
          </div>

          <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', marginBottom: '40px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'radial-gradient(circle at top, rgba(230,57,70,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
            
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: '28px', color: '#e63946', marginBottom: '32px', letterSpacing: '-0.03em', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '20px', position: 'relative', zIndex: 1 }}>Privacy Policy</h2>
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <Section title="What We Collect">
                <p>ChessWithClaw collects only what is strictly necessary to facilitate a chess game between you and your AI agent.</p>
                <ul style={{ paddingLeft: '24px', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px', listStyleType: 'disc' }}>
                  <li><strong style={{ color: '#f2f2f2' }}>Game data:</strong> Chess moves (FEN strings, UCI notation, SAN), game result, and board state.</li>
                  <li><strong style={{ color: '#f2f2f2' }}>Chat messages:</strong> Messages exchanged between you and your agent during an active game session.</li>
                  <li><strong style={{ color: '#f2f2f2' }}>Agent connection data:</strong> The name of your agent, connection timestamps, and heartbeat signals.</li>
                  <li><strong style={{ color: '#f2f2f2' }}>Preferences:</strong> Board theme and piece style settings (stored locally).</li>
                </ul>
              </Section>
              <Section title="What We Do Not Collect">
                <p>We do not collect your name, email address, IP address (beyond standard server logs), physical location, payment information, or any other personally identifying information. We operate without requiring account registration.</p>
              </Section>
              <Section title="Data Retention & Deletion">
                <p>Game sessions automatically expire after 4 hours of inactivity. Upon expiration, all associated game data is permanently deleted from our active databases. We do not maintain long-term game history records.</p>
              </Section>
            </div>
          </div>

          <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'radial-gradient(circle at top, rgba(230,57,70,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
            
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: '28px', color: '#e63946', marginBottom: '32px', letterSpacing: '-0.03em', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '20px', position: 'relative', zIndex: 1 }}>Terms of Service</h2>
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <Section title="Acceptance of Terms">
                <p>By accessing or using ChessWithClaw, you agree to abide by these Terms of Service. ChessWithClaw is provided as a platform to facilitate live chess matches against your configured AI agents.</p>
              </Section>
              <Section title="Acceptable Use Policy">
                <p>When using our service, you explicitly agree not to:</p>
                <ul style={{ paddingLeft: '24px', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px', listStyleType: 'disc' }}>
                  <li>Use automated scripts to generate game sessions at a rate that burdens our infrastructure.</li>
                  <li>Attempt to reverse-engineer, tamper with, or exploit game session tokens belonging to other users.</li>
                  <li>Utilize the chat system to transmit illegal, abusive, harmful, or explicitly prohibited content.</li>
                </ul>
              </Section>
              <Section title="AI Agent Liability">
                <p>You are solely responsible for the configuration, behavior, and output of your connected AI agent. We have no visibility into, and bear no responsibility for, the underlying models or actions your agent takes within a game.</p>
              </Section>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '48px', color: 'rgba(242,242,242,0.35)', fontFamily: "'Inter', sans-serif", fontSize: '14px' }}>
            Questions? Reach out via the ChessWithClaw GitHub repository.
          </div>
        </div>
      </div>
    </PageTransition>
  );
 
}
