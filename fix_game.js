const fs = require('fs');
let content = fs.readFileSync('src/pages/Game.jsx', 'utf-8');

// BGM
content = content.replace(
  /bgmAudioRef\.current = new Audio\("https:\/\/cdn\.pixabay\.com\/audio\/2022\/05\/27\/audio_1808fbf07a\.mp3"\);/,
  `bgmAudioRef.current = new Audio("https://cdn.pixabay.com/audio/2022/10/25/audio_29fc96f2a7.mp3");`
);
content = content.replace(
  /const \[bgmEnabled, setBgmEnabled\] = useState\(\(\) => localStorage\.getItem\('cwc_bgm'\) === 'true'\);/,
  `const [bgmEnabled, setBgmEnabled] = useState(() => localStorage.getItem('cwc_bgm') === 'true' || false);`
);

// We need to play BGM only if agentJoined and game is active
content = content.replace(
  /if \(bgmEnabled\) \{\s*if \(\!bgmAudioRef\.current\) \{.*?bgmAudioRef\.current\.play\(\)\.catch\(e => console\.log\('Audio autoplay prevented:', e\)\);\s*\} else \{\s*if \(bgmAudioRef\.current\) \{\s*bgmAudioRef\.current\.pause\(\);\s*\}\s*\}/s,
  `if (bgmEnabled && agentJoined && game?.status === 'active') {
      if (!bgmAudioRef.current) {
        bgmAudioRef.current = new Audio("https://cdn.pixabay.com/audio/2022/10/25/audio_29fc96f2a7.mp3");
        bgmAudioRef.current.loop = true;
        bgmAudioRef.current.volume = 0.3;
      }
      bgmAudioRef.current.play().catch(e => console.log('Audio autoplay prevented:', e));
    } else {
      if (bgmAudioRef.current) {
        bgmAudioRef.current.pause();
      }
    }`
);
// We need to trigger this effect on agentJoined and game status change. Let's patch the dependencies
content = content.replace(
  /\}, \[bgmEnabled\]\);/,
  `}, [bgmEnabled, agentJoined, game?.status]);`
);


fs.writeFileSync('src/pages/Game.jsx', content);
