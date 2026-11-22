// Amber Vault — the thief: movement, dash, smoke, and grabbing loot.
// WASD or arrow keys move; Shift dashes through a cone's edge; Q drops a
// smoke bomb (limited charges); E grabs loot within reach.
(function () {
  var AV = (window.AV = window.AV || {});

  function makeThief() {
    return {
      x: AV.THIEF_START.x, y: AV.THIEF_START.y, r: AV.THIEF_RADIUS,
      face: -Math.PI / 2, smoke: 0, smokeLeft: AV.SMOKE_CHARGES,
      dashTime: 0, dashCooldown: 0, moving: false,
    };
  }

  function updateThief(thief, keys, dt) {
    var mx = 0;
    var my = 0;
    if (keys.left) mx -= 1;
    if (keys.right) mx += 1;
    if (keys.up) my -= 1;
    if (keys.down) my += 1;
    thief.moving = mx !== 0 || my !== 0;
    if (thief.moving) {
      var len = Math.sqrt(mx * mx + my * my);
      mx /= len;
      my /= len;
      thief.face = Math.atan2(my, mx);
    }
    if (thief.dashCooldown > 0) thief.dashCooldown -= dt;
    if (keys.dash && thief.dashCooldown <= 0 && thief.dashTime <= 0 && thief.moving) {
      thief.dashTime = AV.THIEF_DASH_TIME;
      thief.dashCooldown = AV.THIEF_DASH_COOLDOWN;
    }
    var speed = thief.dashTime > 0 ? AV.THIEF_DASH_SPEED : AV.THIEF_SPEED;
    if (thief.dashTime > 0) thief.dashTime -= dt;
    AV.world.moveCircle(thief, mx * speed * dt, my * speed * dt);
    if (thief.smoke > 0) thief.smoke -= dt;
  }

  function dropSmoke(thief) {
    if (thief.smokeLeft <= 0 || thief.smoke > 0) return false;
    thief.smokeLeft -= 1;
    thief.smoke = AV.SMOKE_TIME;
    return true;
  }

  // Loot within reach of the thief, if any (nearest first).
  function lootInReach(thief, loot) {
    var best = null;
    var bestD = Infinity;
    loot.forEach(function (item) {
      if (item.taken) return;
      var d = AV.world.dist(thief.x, thief.y, item.x, item.y);
      if (d < AV.GRAB_DIST + item.r && d < bestD) { best = item; bestD = d; }
    });
    return best;
  }

  function grabLoot(thief, loot) {
    var item = lootInReach(thief, loot);
    if (!item) return null;
    item.taken = true;
    return item;
  }

  AV.thief = {
    makeThief: makeThief, updateThief: updateThief,
    dropSmoke: dropSmoke, lootInReach: lootInReach, grabLoot: grabLoot,
  };
})();
