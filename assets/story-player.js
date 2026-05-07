// Shared Story Player for She Is app
// Usage in story HTML:
//   <div id="storyPlayer" data-bgm="assets/audio/bgm/story-bingbing.mp3" data-tts="assets/audio/tts/story-bingbing.mp3"></div>
//   <script src="assets/story-player.js"></script>
(function () {
  var root = document.getElementById('storyPlayer');
  if (!root) return;

  var bgmSrc = root.dataset.bgm || '';
  var ttsSrc = root.dataset.tts || '';

  function fmt(s) {
    var m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return m + ':' + String(sec).padStart(2, '0');
  }

  // ── Build HTML ────────────────────────────────────────────────
  root.innerHTML =
    '<div class="story-player-modes">' +
      '<button id="modeRead" class="mode-btn active">阅读</button>' +
      '<button id="modeListen" class="mode-btn">听故事</button>' +
    '</div>' +

    // BGM player (read mode)
    '<div id="bgPlayerSection" class="glass-player story-player-card">' +
      '<div class="sp-row">' +
        '<button id="bgPlayBtn" class="sp-play-btn"><span class="material-symbols-outlined" style="font-variation-settings:\'FILL\' 1;">play_arrow</span></button>' +
        '<span class="sp-label">Background Music / 背景音乐</span>' +
        '<span id="bgTime" class="sp-time">0:00 / --:--</span>' +
      '</div>' +
      '<input id="bgProgress" type="range" min="0" max="100" value="0" class="sp-range">' +
    '</div>' +

    // TTS player (listen mode)
    '<audio id="storyAudio" src="' + ttsSrc + '" preload="metadata"></audio>' +
    '<div id="storyPlayerSection" class="glass-player story-player-card sp-listen-player">' +
      '<div class="sp-row">' +
        '<button id="storyPlayBtn" class="sp-play-btn sp-play-btn--small"><span id="storyPlayIcon" class="material-symbols-outlined" style="font-variation-settings:\'FILL\' 1;">play_arrow</span></button>' +
        '<span class="sp-label" style="font-size:13px;font-weight:700;">听故事</span>' +
        '<span class="sp-time"><span id="storyCurrentTime">0:00</span> / <span id="storyDuration">--:--</span></span>' +
        '<span class="sp-speeds">' +
          '<button class="speed-btn active" data-speed="1">1x</button>' +
          '<button class="speed-btn" data-speed="1.5">1.5x</button>' +
          '<button class="speed-btn" data-speed="2">2x</button>' +
        '</span>' +
      '</div>' +
      '<input type="range" id="storyProgress" min="0" max="100" value="0" class="sp-range" style="--prog:0%">' +
    '</div>' +

    // BGM audio element
    '<audio id="bgAudio" loop><source src="' + bgmSrc + '" type="audio/mpeg"></audio>';

  // ── Elements ──────────────────────────────────────────────────
  var bgAudio = document.getElementById('bgAudio');
  var bgPlayBtn = document.getElementById('bgPlayBtn');
  var bgProgress = document.getElementById('bgProgress');
  var bgTime = document.getElementById('bgTime');
  var storyAudio = document.getElementById('storyAudio');
  var storyPlayBtn = document.getElementById('storyPlayBtn');
  var storyPlayIcon = document.getElementById('storyPlayIcon');
  var storyProgress = document.getElementById('storyProgress');
  var storyCurrentTime = document.getElementById('storyCurrentTime');
  var storyDuration = document.getElementById('storyDuration');
  var modeRead = document.getElementById('modeRead');
  var modeListen = document.getElementById('modeListen');
  var bgPlayerSection = document.getElementById('bgPlayerSection');
  var storyPlayerSection = document.getElementById('storyPlayerSection');
  var storyArticle = document.querySelector('.article-listen-mode') || document.querySelector('article');

  // ── BGM auto-play (muted until interaction) ───────────────────
  if (bgAudio && bgmSrc) {
    bgAudio.volume = 0.35;
    bgAudio.muted = true;
    bgAudio.play().catch(function () {});
    var unmuted = false;
    function unmute() {
      if (!unmuted) { bgAudio.muted = false; unmuted = true; }
      document.removeEventListener('click', unmute);
      document.removeEventListener('touchstart', unmute);
    }
    document.addEventListener('click', unmute);
    document.addEventListener('touchstart', unmute);
  }

  // ── BGM controls ──────────────────────────────────────────────
  if (bgPlayBtn && bgAudio) {
    bgPlayBtn.addEventListener('click', function () {
      var icon = bgPlayBtn.querySelector('.material-symbols-outlined');
      if (bgAudio.paused) { bgAudio.play().catch(function () {}); icon.textContent = 'pause'; }
      else { bgAudio.pause(); icon.textContent = 'play_arrow'; }
    });
    bgAudio.addEventListener('timeupdate', function () {
      if (!bgAudio.duration) return;
      bgProgress.value = (bgAudio.currentTime / bgAudio.duration) * 100;
      bgTime.textContent = fmt(bgAudio.currentTime) + ' / ' + fmt(bgAudio.duration);
    });
    bgProgress.addEventListener('input', function () {
      bgAudio.currentTime = (bgProgress.value / 100) * bgAudio.duration;
    });
  }

  // ── Mode toggle ───────────────────────────────────────────────
  modeRead.addEventListener('click', function () {
    modeRead.classList.add('active');
    modeListen.classList.remove('active');
    if (bgPlayerSection) bgPlayerSection.style.display = '';
    if (storyPlayerSection) storyPlayerSection.classList.remove('visible');
    if (storyArticle) storyArticle.classList.remove('dimmed');
    if (storyAudio) storyAudio.pause();
  });

  modeListen.addEventListener('click', function () {
    modeListen.classList.add('active');
    modeRead.classList.remove('active');
    if (bgPlayerSection) bgPlayerSection.style.display = 'none';
    if (storyPlayerSection) storyPlayerSection.classList.add('visible');
    if (storyArticle) storyArticle.classList.add('dimmed');
  });

  // ── TTS player controls ──────────────────────────────────────
  if (storyPlayBtn && storyAudio) {
    storyPlayBtn.addEventListener('click', function () {
      if (storyAudio.paused) {
        storyAudio.play().catch(function () { storyPlayIcon.textContent = 'music_off'; });
        storyPlayIcon.textContent = 'pause';
      } else {
        storyAudio.pause();
        storyPlayIcon.textContent = 'play_arrow';
      }
    });

    storyAudio.addEventListener('loadedmetadata', function () {
      storyDuration.textContent = fmt(storyAudio.duration);
    });

    storyAudio.addEventListener('timeupdate', function () {
      if (!storyAudio.duration) return;
      var pct = (storyAudio.currentTime / storyAudio.duration) * 100;
      storyProgress.value = pct;
      storyProgress.style.setProperty('--prog', pct + '%');
      storyCurrentTime.textContent = fmt(storyAudio.currentTime);
    });

    storyAudio.addEventListener('ended', function () {
      storyPlayIcon.textContent = 'play_arrow';
    });

    storyProgress.addEventListener('input', function () {
      var t = (storyProgress.value / 100) * storyAudio.duration;
      storyAudio.currentTime = t;
      storyProgress.style.setProperty('--prog', storyProgress.value + '%');
    });

    // Speed buttons
    document.querySelectorAll('.speed-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.speed-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        storyAudio.playbackRate = parseFloat(btn.dataset.speed);
      });
    });
  }

  // ── Hide players if no audio source ───────────────────────────
  if (!bgmSrc && bgPlayerSection) bgPlayerSection.style.display = 'none';
  if (!ttsSrc && storyPlayerSection) storyPlayerSection.style.display = 'none';
  if (!bgmSrc && !ttsSrc) root.style.display = 'none';
})();
