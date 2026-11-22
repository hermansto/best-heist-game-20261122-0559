// Amber Vault — room geometry: collision and line of sight.
// Cover matters: a crate or wall between a guard and the thief breaks the
// guard's vision cone, so the room reads as a stealth puzzle, not an open field.
(function () {
  var AV = (window.AV = window.AV || {});

  function pointInRect(px, py, r) {
    return px >= r[0] && px <= r[0] + r[2] && py >= r[1] && py <= r[1] + r[3];
  }

  // True when the segment from (x1,y1) to (x2,y2) touches no solid rect.
  // Sampled along the segment; the step is small enough that no thin wall
  // is ever skipped at the ranges the cones use.
  function losClear(x1, y1, x2, y2) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var steps = Math.max(2, Math.ceil(dist / 8));
    for (var i = 1; i < steps; i++) {
      var t = i / steps;
      var px = x1 + dx * t;
      var py = y1 + dy * t;
      for (var s = 0; s < AV.SOLIDS.length; s++) {
        if (pointInRect(px, py, AV.SOLIDS[s])) return false;
      }
    }
    return true;
  }

  // Move a circle (the thief) by (dx, dy), sliding along solids instead of
  // sticking: try the x step, then the y step, keeping each only if free.
  function moveCircle(body, dx, dy) {
    var r = body.r;
    var nx = body.x + dx;
    var blocked = false;
    for (var s = 0; s < AV.SOLIDS.length; s++) {
      var rect = AV.SOLIDS[s];
      if (nx + r > rect[0] && nx - r < rect[0] + rect[2] &&
          body.y + r > rect[1] && body.y - r < rect[1] + rect[3]) { blocked = true; break; }
    }
    if (!blocked) body.x = nx;
    var ny = body.y + dy;
    blocked = false;
    for (var j = 0; j < AV.SOLIDS.length; j++) {
      var rc = AV.SOLIDS[j];
      if (body.x + r > rc[0] && body.x - r < rc[0] + rc[2] &&
          ny + r > rc[1] && ny - r < rc[1] + rc[3]) { blocked = true; break; }
    }
    if (!blocked) body.y = ny;
    // Stay inside the room even where the exit doorway cuts the bottom wall.
    body.x = Math.max(AV.WALL + r, Math.min(AV.CANVAS_W - AV.WALL - r, body.x));
    body.y = Math.max(AV.WALL + r, Math.min(AV.CANVAS_H - AV.WALL - r, body.y));
  }

  function dist(ax, ay, bx, by) {
    var dx = bx - ax;
    var dy = by - ay;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Smallest absolute difference between two angles, in radians.
  function angleDiff(a, b) {
    var d = a - b;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return Math.abs(d);
  }

  AV.world = { losClear: losClear, moveCircle: moveCircle, dist: dist, angleDiff: angleDiff };
})();
