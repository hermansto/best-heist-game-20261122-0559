// Amber Vault — guards on patrol and cameras on sweep, plus spotting.
// A guard walks its waypoint line and looks where it walks; a camera sits
// still and sweeps its cone. Either one raises the alarm while the thief
// is inside its cone with a clear line of sight.
(function () {
  var AV = (window.AV = window.AV || {});

  function makeGuards() {
    return AV.GUARD_DEFS.map(function (d) {
      var g = {
        id: d.id, axis: d.axis, from: d.from, to: d.to, fixed: d.fixed,
        speed: d.speed, pos: d.from, dir: 1,
        angle: d.axis === 'x' ? 0 : Math.PI / 2, // facing along the patrol
        spotting: false,
      };
      return g;
    });
  }

  function makeCameras() {
    return AV.CAM_DEFS.map(function (d) {
      return {
        id: d.id, x: d.x, y: d.y, base: d.base, sweep: d.sweep,
        period: d.period, phase: d.phase, angle: d.base, spotting: false,
      };
    });
  }

  function updateGuards(guards, dt) {
    guards.forEach(function (g) {
      g.pos += g.dir * g.speed * dt;
      if (g.pos >= g.to) { g.pos = g.to; g.dir = -1; }
      if (g.pos <= g.from) { g.pos = g.from; g.dir = 1; }
      g.angle = g.axis === 'x' ? (g.dir > 0 ? 0 : Math.PI) : (g.dir > 0 ? Math.PI / 2 : -Math.PI / 2);
    });
  }

  function guardXY(g) {
    return g.axis === 'x' ? { x: g.pos, y: g.fixed } : { x: g.fixed, y: g.pos };
  }

  function updateCameras(cameras, t) {
    cameras.forEach(function (c) {
      c.angle = c.base + c.sweep * Math.sin((t / c.period) * Math.PI * 2 + c.phase);
    });
  }

  // Can this watcher (guard or camera, at ox,oy facing `angle`) see the thief?
  // Needs range, cone angle, and a clear line of sight past the cover.
  function canSee(ox, oy, angle, range, halfAngle, thief) {
    if (thief.smoke > 0) return false; // smoke bomb breaks every sightline
    var d = AV.world.dist(ox, oy, thief.x, thief.y);
    if (d > range) return false;
    var want = Math.atan2(thief.y - oy, thief.x - ox);
    if (AV.world.angleDiff(want, angle) > halfAngle) return false;
    return AV.world.losClear(ox, oy, thief.x, thief.y);
  }

  // Recompute every watcher's spotting flag and return the alarm rate
  // (points per second) the thief is currently earning.
  function spottingRate(guards, cameras, thief) {
    var rate = 0;
    guards.forEach(function (g) {
      var p = guardXY(g);
      g.spotting = canSee(p.x, p.y, g.angle, AV.GUARD_RANGE, AV.GUARD_HALF_ANGLE, thief);
      if (g.spotting) rate += AV.GUARD_SPOT_RATE;
    });
    cameras.forEach(function (c) {
      c.spotting = canSee(c.x, c.y, c.angle, AV.CAM_RANGE, AV.CAM_HALF_ANGLE, thief);
      if (c.spotting) rate += AV.CAM_SPOT_RATE;
    });
    return rate;
  }

  AV.guards = {
    makeGuards: makeGuards, makeCameras: makeCameras,
    updateGuards: updateGuards, updateCameras: updateCameras,
    guardXY: guardXY, spottingRate: spottingRate,
  };
})();
