import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Copy, Check, Mail } from 'lucide-react';

const INVITE_IMAGE_URL = "https://jkawzziklwoxfxicbtvf.supabase.co/storage/v1/object/public/assets/invite-image.png";
if (typeof window !== 'undefined') {
  const img = new Image();
  img.src = INVITE_IMAGE_URL;
}


const MOTION = {
  functional: '120ms cubic-bezier(0.25, 1, 0.5, 1)',
  cinematic: '400ms cubic-bezier(0.16, 1, 0.3, 1)',
};

export default function GameCreated({ gameId }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [hasCopied, setHasCopiedState] = useState(() => localStorage.getItem('cwc_copied_' + gameId) === 'true');
  const setHasCopied = (val) => { setHasCopiedState(val); if(val) localStorage.setItem('cwc_copied_' + gameId, 'true'); };
  const [bounceCopy, setBounceCopy] = useState(false);
  const [legalError, setLegalError] = useState(false);
  const [boardOpening, setBoardOpening] = useState(false);
  const [legalAccepted, setLegalAcceptedState] = useState(() => localStorage.getItem('cwc_legal_' + gameId) === 'true');
  const setLegalAccepted = (val) => { setLegalAcceptedState(val); if(val) localStorage.setItem('cwc_legal_' + gameId, 'true'); else localStorage.removeItem('cwc_legal_' + gameId); };
  const [showError, setShowError] = useState(false);
  const [scrolled, setScrolled] = useState(() => typeof window !== 'undefined' ? window.scrollY > 10 : false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (legalAccepted) {
      setShowError(false);
    }
  }, [legalAccepted]);

  const mcpUrl = `${window.location.origin}/api/mcp`;
  const inviteMessage = `Hey — I set up a chess match for us. Connect to ${mcpUrl} and join match ${gameId}. You're playing Black, I'm White, I move first. Play for real — think it through, tell me what you're thinking, and talk to me while we play. Let's go.`;

  const handleCopyInvite = async () => {
    setHasCopied(true);
    try {
      await navigator.clipboard.writeText(inviteMessage);
    } catch {
      // fallback for insecure contexts — create temp textarea
      const ta = document.createElement('textarea');
      ta.value = inviteMessage;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch {}
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleOpenBoard = () => {
    if (!legalAccepted) {
      setLegalError(true);
      setShowError(true);
      setTimeout(() => { setLegalError(false); setShowError(false); }, 2500);
      return;
    }
    if (!hasCopied) {
      setBounceCopy(true);
      setTimeout(() => setBounceCopy(false), 700);
      // keep hard gate visible — show helper instead of silent fail
      return;
    }
    setBoardOpening(true);
    setTimeout(() => {
      navigate(`/game/${gameId}`);
    }, 400);
  };

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#f2f2f2', overflowX: 'clip' }} className="font-sans selection:bg-red-500/30 flex flex-col">
      <style>{`
        .design-card {
          background: linear-gradient(145deg, #1b1a19 0%, #161514 100%);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 24px;
          position: relative;
          overflow: hidden;
          will-change: transform;
          transform: translateZ(0);
          backface-visibility: hidden;
          transition: all ${MOTION.cinematic};
          box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        }
        .design-card:hover {
          border-color: rgba(255,255,255,0.12);
          transform: translateY(-2px) translateZ(0);
          box-shadow: 0 6px 24px rgba(0,0,0,0.5);
        }
        
        .design-btn-primary {
          background: linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(0,0,0,0.04) 100%), #e63946;
          color: white;
          border-radius: 8px;
          padding: 8px 16px;
          font-family: "'Poppins', sans-serif";
          font-weight: 600;
          font-size: 14px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all ${MOTION.functional};
          box-shadow: rgba(255,255,255,0.18) 0px 1px 0px 0px inset, rgba(0,0,0,0.22) 0px -1px 0px 0px inset, rgba(0,0,0,0.22) 0px 0px 0px 0.5px inset;
        }
        .design-btn-primary:hover:not(:disabled) {
          background: linear-gradient(180deg, rgba(255,255,255,0.11) 0%, rgba(0,0,0,0.03) 100%), #e63946;
          transform: translateY(-1px);
        }
        .design-btn-primary:active:not(:disabled) {
          background: linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(255,255,255,0.02) 100%), #c62e39;
          transform: translateY(0);
          box-shadow: rgba(255,255,255,0.10) 0px 0.5px 0px inset, rgba(0,0,0,0.28) 0px -0.5px 0px inset, rgba(0,0,0,0.28) 0px 0px 0px 0.5px inset;
        }
        
        .design-btn-disabled {
          background: #111111;
          color: rgba(242,242,242,0.3);
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.04);
          font-family: "'Poppins', sans-serif";
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: not-allowed;
          transition: all ${MOTION.functional};
        }

        .design-btn-secondary {
          background: transparent;
          color: rgba(242,242,242,0.6);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          height: 40px;
          padding: 0 16px;
          font-family: "'Poppins', sans-serif";
          font-weight: 600;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
          text-decoration: none;
        }
        .design-btn-secondary:hover:not(:disabled) {
          color: rgba(242,242,242,0.9);
          border-color: rgba(255,255,255,0.25);
          background: rgba(255,255,255,0.04);
        }
        .design-btn-secondary:active:not(:disabled) {
          transform: translateY(1px);
          transition-duration: 0.1s;
        }

        .invite-focus-glow {
          box-shadow: 0 0 50px rgba(230,57,70,0.08), 0 10px 30px rgba(0,0,0,0.5);
          border-color: rgba(230,57,70,0.2);
        }

        .custom-checkbox {
          appearance: none;
          background-color: #1a1a1a;
          margin: 0;
          font: inherit;
          color: currentColor;
          width: 1.15em;
          height: 1.15em;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 0.25em;
          display: grid;
          place-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        
        .custom-checkbox::before {
          content: "";
          width: 0.65em;
          height: 0.65em;
          transform: scale(0);
          transition: 120ms transform ease-in-out;
          box-shadow: inset 1em 1em white;
          background-color: white;
          transform-origin: center;
          clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
        }
        
        .custom-checkbox:checked {
          background-color: #e63946;
          border-color: #e63946;
        }
        
        .custom-checkbox:checked::before {
          transform: scale(1);
        }
        @keyframes bounce-anim {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); box-shadow: 0 0 15px rgba(230,57,70,0.5); }
        }
        .bounce-anim {
          animation: bounce-anim 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      `}</style>

      {/* Header */}
      <header 
        className="sticky top-0 z-50 flex w-full"
        style={{
          fontFamily: "'Inter', sans-serif",
          height: '72px',
          alignItems: 'center',
          backgroundColor: scrolled ? 'rgba(10,10,10,0.85)' : 'rgba(10,10,10,0)',
          backdropFilter: scrolled ? 'blur(16px)' : 'blur(0px)',
          WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'blur(0px)',
          transition: 'background-color 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease',
          borderBottom: `1px solid ${scrolled ? 'rgba(26,26,26,1)' : 'rgba(26,26,26,0)'}`,
        }}
      >
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 grid items-center" style={{ gridTemplateColumns: '1fr auto 1fr' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '44px', minHeight: '44px', cursor: 'pointer', marginLeft: '-12px' }} onClick={() => navigate('/')} title="Back">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(242,242,242,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <img 
              src="https://jkawzziklwoxfxicbtvf.supabase.co/storage/v1/object/public/assets/logo-v2.png" 
              alt="ChessWithClaw Logo" 
              draggable={false}
              onClick={() => navigate('/')}
              style={{ 
                width: '140px', 
                height: 'auto', 
                objectFit: 'contain', 
                cursor: 'pointer',
                filter: 'drop-shadow(0 2px 10px rgba(230,57,70,0.15))'
              }} 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center max-w-4xl mx-auto px-4 md:px-8 w-full" style={{ paddingTop: 'clamp(12px, 2.5vh, 20px)', paddingBottom: '48px' }}>
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="flex flex-col items-center w-full"
        >
          <img 
            src={INVITE_IMAGE_URL} 
            alt="Invite Agent" 
            draggable={false}
            loading="eager"
            fetchPriority="high"
            decoding="sync"
            className="w-[85%] max-w-[320px] md:max-w-[420px] h-auto object-contain mb-2 md:mb-3"
          />
          <h1 
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 'clamp(32px, 7vw, 48px)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: '#f2f2f2',
              textAlign: 'center',
              marginBottom: '16px'
            }}
          >
            Invite your agent for chess match
          </h1>
          
          <p 
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: '16px',
              fontWeight: 300,
              color: 'rgba(242,242,242,0.6)',
              textAlign: 'center',
              marginBottom: '40px'
            }}
          >
            First invite your agent in game
          </p>

          <div 
            className="design-card invite-focus-glow" 
            style={{ 
              width: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px', 
              marginBottom: '24px' 
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '15px', color: '#f2f2f2', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} className="text-[#e63946]" /> Invite message
              </span>
              <button 
                onClick={handleCopyInvite} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: 'transparent', 
                  border: 'none', 
                  color: bounceCopy ? '#ffffff' : (copied ? '#10b981' : '#e63946'), 
                  cursor: 'pointer', 
                  transition: `color ${MOTION.functional}, transform ${MOTION.functional}`,
                  padding: '4px',
                  borderRadius: '4px',
                  transform: bounceCopy ? 'scale(1.3)' : 'scale(1)'
                }}
                title="Copy invite"
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
            
            <div
              style={{
                background: 'rgba(0,0,0,0.4)',
                borderRadius: '8px',
                padding: '16px',
                border: hasCopied ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(255,255,255,0.05)',
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                color: 'rgba(242,242,242,0.85)',
                lineHeight: 1.6,
                wordBreak: 'break-word',
                userSelect: 'all',
                position: 'relative'
              }}
            >
              <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:11, letterSpacing:'0.06em', color:'rgba(242,242,242,0.4)', marginBottom:8, textTransform:'uppercase' }}>Agent payload — copy exactly</div>
              {inviteMessage}
              {hasCopied && (
                <div style={{ position:'absolute', top:8, right:8, background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.25)', color:'#10b981', fontSize:10, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', padding:'3px 7px', borderRadius:999, fontFamily:"'Inter', sans-serif" }}>Copied ✓</div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '40px', alignItems: 'center' }}>
            <p 
              style={{ 
                fontFamily: "'Poppins', sans-serif", 
                fontWeight: 300, 
                fontSize: '13px', 
                color: showError ? '#e63946' : 'rgba(242,242,242,0.45)', 
                textAlign: 'center', 
                maxWidth: '500px',
                lineHeight: 1.6,
                transition: `color ${MOTION.functional}`
              }}
            >
              Send this invite message to your agent wherever it lives to invite it in match, first time takes little long , faster after that
            </p>
            <p 
              style={{ 
                fontFamily: "'Poppins', sans-serif", 
                fontWeight: 300, 
                fontSize: '13px', 
                color: '#f2f2f2', 
                textAlign: 'center', 
                maxWidth: '500px',
                lineHeight: 1.6
              }}
            >
              You can enter the room after sending invite , your agent reaching there soon.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
            <input 
              type="checkbox" 
              id="legal" 
              checked={legalAccepted} 
              onChange={(e) => setLegalAccepted(e.target.checked)} 
              className="custom-checkbox"
              style={{ borderColor: showError ? '#e63946' : 'rgba(255,255,255,0.2)' }}
            />
            <label 
              htmlFor="legal" 
              style={{ 
                fontFamily: "'Poppins', sans-serif", 
                fontSize: '14px', 
                color: showError ? '#e63946' : 'rgba(242,242,242,0.6)', 
                cursor: 'pointer',
                userSelect: 'none',
                textDecorationLine: showError ? 'underline' : 'none',
                textDecorationColor: '#e63946',
                textUnderlineOffset: '4px',
                transition: `all ${MOTION.functional}`
              }}
            >
              accept <span onClick={(e) => { e.preventDefault(); navigate('/legal', { state: { from: `/created/${gameId}` } }); }} style={{ cursor: 'pointer', color: showError ? '#e63946' : '#f2f2f2', textDecoration: 'underline', textUnderlineOffset: '2px' }}>privacy policy & terms</span>
            </label>
          </div>

          <button
            onClick={handleOpenBoard}
            disabled={boardOpening || !legalAccepted || !hasCopied}
            aria-disabled={!legalAccepted || !hasCopied}
            className={legalAccepted && hasCopied ? "design-btn-primary" : "design-btn-disabled"}
            style={{
              width: '100%',
              maxWidth: '360px',
              height: '56px',
              fontSize: '16px',
              cursor: boardOpening ? 'not-allowed' : (legalAccepted && hasCopied) ? 'pointer' : 'not-allowed',
              opacity: (legalAccepted && hasCopied) ? 1 : 0.45,
              transition: `all ${MOTION.cinematic}`,
            }}
            title={!legalAccepted ? 'Accept privacy policy & terms to continue' : !hasCopied ? 'Please copy the invite message first' : 'Enter game'}
          >
            {boardOpening ? 'Entering Game...' : 'Enter game'}
          </button>
          {!legalAccepted && showError && (
            <p style={{ fontFamily:"'Poppins', sans-serif", fontSize:12, color:'#e63946', marginTop:8, textAlign:'center' }}>
              Please accept the privacy policy & terms to enter the game.
            </p>
          )}
          {legalAccepted && !hasCopied && !boardOpening && (
            <p style={{ fontFamily:"'Poppins', sans-serif", fontSize:12, color:'#f59e0b', marginTop:8, textAlign:'center', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
              <span style={{ width:6, height:6, borderRadius:999, background:'#f59e0b', flexShrink:0 }} /> Please copy the invite message first — your agent needs it to join.
            </p>
          )}
        </motion.div>
      </main>
    </div>
  );
}

