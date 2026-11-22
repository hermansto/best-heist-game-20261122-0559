// Amber Vault — tiny sound effects, synthesized, no audio files.
// WebAudio beeps only; created lazily on the first user gesture so the page
// never needs autoplay permission. Silence is a valid fallback.
(function () {
  var AV = (window.AV = window.AV || {});
  var ctx = null;

  function audio() {
    if (ctx) return ctx;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    } catch (e) { return null; }
    return ctx;
  }

  function beep(freq, dur, type, vol) {
    var ac = audio();
    if (!ac) return;
    try {
      var osc = ac.createOscillator();
      var gain = ac.createGain();
      osc.type = type || 'sine';
      osc.frequency.value = freq;
      gain.gain.value = vol || 0.06;
      gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start();
      osc.stop(ac.currentTime + dur);
    } catch (e) { /* sound is decoration; never break the game */ }
  }

  AV.audio = {
    grab: function () { beep(880, 0.12, 'sine', 0.07); setTimeout(function () { beep(1320, 0.16, 'sine', 0.07); }, 90); },
    spot: function () { beep(220, 0.18, 'square', 0.05); },
    smoke: function () { beep(330, 0.25, 'triangle', 0.05); },
    caught: function () { beep(160, 0.5, 'sawtooth', 0.07); },
    escaped: function () { [523, 659, 784].forEach(function (f, i) { setTimeout(function () { beep(f, 0.2, 'sine', 0.07); }, i * 120); }); },
  };
})();
