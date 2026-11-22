// Amber Vault — game state, the main loop, input, alarm, and HUD.
// States: title -> play -> caught | escaped. A ?shot= URL freezes one
// staged moment for screenshots instead of starting the title screen.
(function () {
  var AV = (window.AV = window.AV || {});
  var canvas = document.getElementById('game');
  var ctx = canvas.getContext('2d');

  var hudLoot = document.getElementById('hud-loot');
  var hudTime = document.getElementById('hud-time');
  var hudExit = document.getElementById('hud-exit');
  var alarmFill = document.getElementById('alarm-fill');
  var hudAlarm = document.getElementById('hud-alarm');
  var hudSmoke = document.getElementById('hud-smoke');

  var keys = { up: false, down: false, left: false, right: false, dash: false };
  var game = null;

  function newGame() {
    var loot = AV.LOOT_DEFS.map(function (d) {
      return { id: d.id, name: d.name, x: d.x, y: d.y, r: d.r, main: d.main, taken: false };
    });
    return {
      state: 'title', time: 0, alarm: 0, loot: loot,
      thief: AV.thief.makeThief(),
      guards: AV.guards.makeGuards(),
      cameras: AV.guards.makeCameras(),
      exitOpen: false, spotted: false, toast: '', toastTime: 0, frozen: false,
    };
  }

  function fmtTime(t) {
    var m = Math.floor(t / 60);
    var s = Math.floor(t % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function syncHud() {
    var got = game.loot.filter(function (l) { return l.taken; }).length;
    hudLoot.textContent = got + ' / ' + game.loot.length;
    hudTime.textContent = fmtTime(game.time);
    hudExit.textContent = game.exitOpen ? 'TERBUKA' : 'TERKUNCI';
    hudExit.className = game.exitOpen ? 'open' : 'locked';
    alarmFill.style.width = Math.round(game.alarm) + '%';
    hudAlarm.textContent = Math.round(game.alarm) + '%';
    hudSmoke.textContent = '●'.repeat(game.thief.smokeLeft) + '○'.repeat(AV.SMOKE_CHARGES - game.thief.smokeLeft);
  }

  function startPlay() {
    if (game.state === 'title' || game.state === 'caught' || game.state === 'escaped') {
      var keepShot = game.frozen;
      if (!keepShot) { game = newGame(); game.state = 'play'; }
      else { game.state = 'play'; }
      syncHud();
    }
  }

  function update(dt) {
    if (game.state !== 'play' || game.frozen) return;
    game.time += dt;
    AV.guards.updateGuards(game.guards, dt);
    AV.guards.updateCameras(game.cameras, game.time);
    AV.thief.updateThief(game.thief, keys, dt);

    var wasSpotted = game.spotted;
    var rate = AV.guards.spottingRate(game.guards, game.cameras, game.thief);
    game.spotted = rate > 0;
    if (game.spotted && !wasSpotted) AV.audio.spot();
    if (game.spotted) game.alarm = Math.min(AV.ALARM_MAX, game.alarm + rate * dt);
    else game.alarm = Math.max(0, game.alarm - AV.ALARM_DECAY * dt);

    if (game.toastTime > 0) {
      game.toastTime -= dt;
      if (game.toastTime <= 0) game.toast = '';
    }
    if (game.alarm >= AV.ALARM_MAX) {
      game.state = 'caught';
      game.toast = '';
      AV.audio.caught();
      return;
    }
    // All loot in hand and the thief reaches the doorway: getaway.
    var got = game.loot.filter(function (l) { return l.taken; }).length;
    if (got === game.loot.length && game.exitOpen &&
        AV.world.dist(game.thief.x, game.thief.y, 620, 599) < 46) {
      game.state = 'escaped';
      AV.audio.escaped();
    }
  }

  function tryGrab() {
    if (game.state !== 'play' || game.frozen) return;
    var item = AV.thief.grabLoot(game.thief, game.loot);
    if (!item) return;
    AV.audio.grab();
    var got = game.loot.filter(function (l) { return l.taken; }).length;
    game.toast = item.name + ' diambil! (' + got + '/4)';
    game.toastTime = 2.5;
    if (item.main) game.exitOpen = true;
  }

  function trySmoke() {
    if (game.state !== 'play' || game.frozen) return;
    if (AV.thief.dropSmoke(game.thief)) {
      AV.audio.smoke();
      game.toast = 'Bom asap! Tidak terlihat 3 detik.';
      game.toastTime = 2;
    }
  }

  function keyName(e) {
    var k = e.key.toLowerCase();
    if (k === 'arrowup' || k === 'w') return 'up';
    if (k === 'arrowdown' || k === 's') return 'down';
    if (k === 'arrowleft' || k === 'a') return 'left';
    if (k === 'arrowright' || k === 'd') return 'right';
    return null;
  }

  window.addEventListener('keydown', function (e) {
    var dir = keyName(e);
    if (dir) { keys[dir] = true; e.preventDefault(); }
    if (e.key === 'Shift') keys.dash = true;
    if (e.key === 'Enter') startPlay();
    if (e.key === 'e' || e.key === 'E') tryGrab();
    if (e.key === 'q' || e.key === 'Q') trySmoke();
    if (e.key === 'r' || e.key === 'R') { game = newGame(); game.state = 'play'; syncHud(); }
  });
  window.addEventListener('keyup', function (e) {
    var dir = keyName(e);
    if (dir) keys[dir] = false;
    if (e.key === 'Shift') keys.dash = false;
  });
  canvas.addEventListener('click', startPlay);
  document.getElementById('btn-restart').addEventListener('click', function () {
    game = newGame();
    game.state = 'play';
    syncHud();
  });

  var last = performance.now();
  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    AV.render.render(ctx, game);
    syncHud();
    requestAnimationFrame(frame);
  }

  // Boot: a ?shot= URL stages one frozen moment for screenshots.
  // ?nolabel=1 hides every text label (rev1 label-removal test): the scene
  // itself has to tell the story. HUD text hides, the alarm track stays.
  game = newGame();
  var shot = null;
  var noLabel = false;
  try {
    var params = new URLSearchParams(window.location.search);
    shot = params.get('shot');
    noLabel = params.get('nolabel') === '1';
  } catch (e) { shot = null; }
  AV.NO_LABEL = noLabel;
  if (noLabel) {
    var hideText = function (sel) {
      document.querySelectorAll(sel).forEach(function (el) { el.style.visibility = 'hidden'; });
    };
    hideText('header, footer');
    hideText('#hud .stat, #hud .alarm-label, #hud-alarm, #hud-smoke, #btn-restart');
  }
  if (shot && AV.shots.applyShot(game, shot)) {
    game.state = 'play';
    syncHud();
  }
  // For the shot script and for debugging: live game state.
  window.__amber = {
    get state() { return game.state; },
    get alarm() { return game.alarm; },
    get thief() { return { x: game.thief.x, y: game.thief.y }; },
    get loot() { return game.loot.filter(function (l) { return l.taken; }).length; },
    get exitOpen() { return game.exitOpen; },
  };
  syncHud();
  requestAnimationFrame(frame);
})();
