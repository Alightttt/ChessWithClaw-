const fs = require('fs');
function fixBubble(file) {
  let content = fs.readFileSync(file, 'utf8');
  const oldBubble = `const CloudBubble = ({ children, isPrevious }) => (
  <div style={{
    position: 'relative',
    background: '#f2f2f2',
    color: '#1a1a1a',
    borderRadius: '24px',
    padding: '12px 18px',
    fontSize: '13px',
    fontFamily: 'Inter, sans-serif',
    alignSelf: 'flex-start',
    wordBreak: 'break-word',
    marginTop: isPrevious ? '0' : '10px',
    zIndex: 0,
    opacity: isPrevious ? 0.6 : 1
  }}>
    <div style={{ position: 'absolute', top: '-8px', left: '15px', width: '25px', height: '25px', background: '#f2f2f2', borderRadius: '50%', zIndex: -1 }} />
    <div style={{ position: 'absolute', top: '-12px', left: '35px', width: '35px', height: '35px', background: '#f2f2f2', borderRadius: '50%', zIndex: -1 }} />
    <div style={{ position: 'absolute', top: '-6px', right: '20px', width: '20px', height: '20px', background: '#f2f2f2', borderRadius: '50%', zIndex: -1 }} />
    <div style={{ position: 'absolute', bottom: '-8px', left: '25px', width: '30px', height: '30px', background: '#f2f2f2', borderRadius: '50%', zIndex: -1 }} />
    <div style={{ position: 'absolute', bottom: '-6px', right: '25px', width: '20px', height: '20px', background: '#f2f2f2', borderRadius: '50%', zIndex: -1 }} />
    
    {!isPrevious && (
      <>
        <div style={{ position: 'absolute', left: '-10px', bottom: '8px', width: '10px', height: '10px', background: '#f2f2f2', borderRadius: '50%', zIndex: 1 }} />
        <div style={{ position: 'absolute', left: '-20px', bottom: '0px', width: '6px', height: '6px', background: '#f2f2f2', borderRadius: '50%', zIndex: 1 }} />
      </>
    )}
    <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
  </div>
);`;
  
  const newBubble = `const CloudBubble = ({ children, isPrevious, isHuman }) => {
  const bg = isHuman ? '#e63946' : '#f2f2f2';
  return (
  <div style={{
    position: 'relative',
    background: bg,
    color: isHuman ? 'white' : '#1a1a1a',
    borderRadius: '24px',
    padding: '12px 18px',
    fontSize: '13px',
    fontFamily: 'Inter, sans-serif',
    alignSelf: isHuman ? 'flex-end' : 'flex-start',
    wordBreak: 'break-word',
    marginTop: isPrevious ? '0' : '10px',
    zIndex: 0,
    opacity: isPrevious ? 0.6 : 1
  }}>
    <div style={{ position: 'absolute', top: '-8px', left: '15px', width: '25px', height: '25px', background: bg, borderRadius: '50%', zIndex: -1 }} />
    <div style={{ position: 'absolute', top: '-12px', left: '35px', width: '35px', height: '35px', background: bg, borderRadius: '50%', zIndex: -1 }} />
    <div style={{ position: 'absolute', top: '-6px', right: '20px', width: '20px', height: '20px', background: bg, borderRadius: '50%', zIndex: -1 }} />
    <div style={{ position: 'absolute', bottom: '-8px', left: '25px', width: '30px', height: '30px', background: bg, borderRadius: '50%', zIndex: -1 }} />
    <div style={{ position: 'absolute', bottom: '-6px', right: '25px', width: '20px', height: '20px', background: bg, borderRadius: '50%', zIndex: -1 }} />
    
    {!isPrevious && (
      <>
        {isHuman ? (
          <>
            <div style={{ position: 'absolute', right: '-10px', bottom: '8px', width: '10px', height: '10px', background: bg, borderRadius: '50%', zIndex: 1 }} />
            <div style={{ position: 'absolute', right: '-20px', bottom: '0px', width: '6px', height: '6px', background: bg, borderRadius: '50%', zIndex: 1 }} />
          </>
        ) : (
          <>
            <div style={{ position: 'absolute', left: '-10px', bottom: '8px', width: '10px', height: '10px', background: bg, borderRadius: '50%', zIndex: 1 }} />
            <div style={{ position: 'absolute', left: '-20px', bottom: '0px', width: '6px', height: '6px', background: bg, borderRadius: '50%', zIndex: 1 }} />
          </>
        )}
      </>
    )}
    <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
  </div>
  );
};`;
  content = content.replace(oldBubble, newBubble);
  fs.writeFileSync(file, content);
}
fixBubble('src/pages/Game.jsx');
fixBubble('src/pages/Agent.jsx');
