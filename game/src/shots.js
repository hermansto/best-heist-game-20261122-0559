// Amber Vault — staged states for the entry screenshots.
// ?shot=cover|patrol|grab|escape freezes one dramatic moment of the game so
// the screenshot is a real render of this code, not a drawing: the same
// update and draw paths run, only the state is placed by hand first.
// The cover is the whole heist in one frame: the thief a hair outside the
// guard's cone, the camera sweeping the far gallery, the diamond glowing
// in its case, and the alarm already at 62%.
(function () {
  var AV = (window.AV = window.AV || {});

  function place(game, cfg) {
    game.state = 'play';
    game.alarm = cfg.alarm;
    game.time = cfg.time;
    game.toast = '';
    game.thief.x = cfg.thief[0];
    game.thief.y = cfg.thief[1];
    game.thief.face = cfg.thief[2];
    game.thief.pose = cfg.pose || 'stand';
    game.thief.smokeLeft = cfg.smokeLeft;
    game.guards[0].pos = cfg.guardA;
    game.guards[0].dir = cfg.guardADir;
    game.guards[0].angle = cfg.guardADir > 0 ? 0 : Math.PI;
    game.guards[0].pose = cfg.guardAPose || 'patrol';
    game.guards[1].pos = cfg.guardB;
    game.guards[1].dir = cfg.guardBDir;
    game.guards[1].angle = cfg.guardBAngle;
    game.guards[1].pose = cfg.guardBPose || 'patrol';
    game.cameras[0].angle = cfg.cam1;
    game.cameras[1].angle = cfg.cam2;
    cfg.taken.forEach(function (id) {
      game.loot.forEach(function (item) { if (item.id === id) item.taken = true; });
    });
    game.exitOpen = game.loot[0].taken;
    game.frozen = true; // the frame holds still for the screenshot
  }

  var SHOTS = {
    cover: {
      alarm: 62, time: 84, smokeLeft: 1,
      // Half a step off the case, mid-reach: the hand is at the cracked
      // glass, the diamond still inside. Guard A's cone grazes him.
      thief: [758, 300, Math.PI], pose: 'reach',
      guardA: 560, guardADir: 1, guardAPose: 'patrol',
      guardB: 320, guardBDir: 1, guardBAngle: Math.PI / 2, guardBPose: 'patrol',
      cam1: 2.6, cam2: -0.6, taken: ['gold', 'painting'],
    },
    patrol: {
      alarm: 18, time: 31, smokeLeft: 2,
      thief: [200, 240, 0], pose: 'crouch', // tucked behind the crates, reading the patrols
      guardA: 480, guardADir: -1, guardAPose: 'patrol',
      guardB: 220, guardBDir: -1, guardBAngle: -Math.PI / 2, guardBPose: 'patrol',
      cam1: 2.0, cam2: -1.1, taken: [],
    },
    alarm: {
      alarm: 78, time: 95, smokeLeft: 1,
      thief: [700, 170, 0], pose: 'crouch', // caught flat-footed inside guard A's cone
      guardA: 560, guardADir: 1, guardAPose: 'alert',
      guardB: 320, guardBDir: 1, guardBAngle: Math.PI / 2, guardBPose: 'patrol',
      cam1: 2.6, cam2: -0.6, taken: ['gold'],
    },
    grab: {
      alarm: 78, time: 123, smokeLeft: 1,
      thief: [700, 352, -Math.PI / 2], pose: 'reach', // at the open, empty case
      guardA: 620, guardADir: 1, guardAPose: 'alert',
      guardB: 300, guardBDir: 1, guardBAngle: Math.PI, guardBPose: 'patrol',
      cam1: 2.9, cam2: -0.3, taken: ['diamond', 'gold', 'painting'],
    },
    escape: {
      alarm: 88, time: 161, smokeLeft: 0,
      thief: [620, 525, Math.PI / 2], pose: 'run', // sprinting for the open door
      guardA: 850, guardADir: -1, guardAPose: 'patrol',
      guardB: 480, guardBDir: 1, guardBAngle: Math.PI / 2, guardBPose: 'patrol',
      cam1: 2.2, cam2: -0.9, taken: ['diamond', 'gold', 'painting', 'vase'],
    },
  };

  function applyShot(game, name) {
    var cfg = SHOTS[name];
    if (!cfg) return false;
    place(game, cfg);
    return true;
  }

  AV.shots = { applyShot: applyShot, names: Object.keys(SHOTS) };
})();
