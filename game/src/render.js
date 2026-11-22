// Amber Vault — all canvas drawing: the room, the cones, the actors, the HUD
// text inside the canvas. Rev1: the cover has to survive two tests —
// shrunk to 300px, and with every label deleted, a stranger must still see
// a thief stealing in a museum, guards and cameras, and a high alarm. So the
// actors are FIGURES (not dots), the moment is staged (reaching, cracked
// case, an empty slot), and the room is a museum (plinths, ropes, bench,
// framed paintings), not a warehouse.
(function () {
  var AV = (window.AV = window.AV || {});
  var W = AV.CANVAS_W;
  var H = AV.CANVAS_H;

  function noLabel() { return !!AV.NO_LABEL; }

  function label(ctx, text, x, y, color) {
    if (noLabel()) return;
    ctx.font = 'bold 18px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(4,6,12,0.9)';
    ctx.strokeText(text, x, y);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }

  function drawCone(ctx, ox, oy, angle, range, half, fill, edge) {
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.arc(ox, oy, range, angle - half, angle + half);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    // hard outline: both boundary rays and the far arc, so the wedge keeps
    // its shape when the frame shrinks
    ctx.strokeStyle = edge;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox + Math.cos(angle - half) * range, oy + Math.sin(angle - half) * range);
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox + Math.cos(angle + half) * range, oy + Math.sin(angle + half) * range);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(ox, oy, range, angle - half, angle + half);
    ctx.stroke();
  }

  function drawFloor(ctx) {
    ctx.fillStyle = '#0d1424';
    ctx.fillRect(0, 0, W, H);
    // checker tiles, quiet so the actors stay loud — but distinct enough
    // to read as a floor (storyboard: the two dark tiles must separate)
    for (var y = 0; y < 10; y++) {
      for (var x = 0; x < 20; x++) {
        if ((x + y) % 2 === 0) continue;
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fillRect(x * 62, y * 62, 62, 62);
      }
    }
    // red carpet runner down the middle gallery
    ctx.fillStyle = 'rgba(120,40,60,0.16)';
    ctx.fillRect(340, 14, 580, 592);
  }

  function drawSolids(ctx) {
    AV.SOLIDS.forEach(function (r, i) {
      var kind = (AV.SOLID_KIND && AV.SOLID_KIND[i]) || 'wall';
      var cx = r[0] + r[2] / 2;
      var cy = r[1] + r[3] / 2;
      if (kind === 'wall') {
        ctx.fillStyle = '#3a4763';
        ctx.fillRect(r[0], r[1], r[2], r[3]);
        ctx.fillStyle = '#4d5d80';
        ctx.fillRect(r[0], r[1], r[2], 5);
      } else if (kind === 'crate') {
        ctx.fillStyle = '#7a5a28';
        ctx.fillRect(r[0], r[1], r[2], r[3]);
        ctx.fillStyle = '#9c7434';
        ctx.fillRect(r[0], r[1], r[2], 5);
        ctx.strokeStyle = 'rgba(40,26,8,0.7)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(r[0] + 4, r[1] + 4);
        ctx.lineTo(r[0] + r[2] - 4, r[1] + r[3] - 4);
        ctx.moveTo(r[0] + r[2] - 4, r[1] + 4);
        ctx.lineTo(r[0] + 4, r[1] + r[3] - 4);
        ctx.stroke();
      } else if (kind === 'bench') {
        // wooden bench: slats + legs
        ctx.fillStyle = '#6b4a2a';
        ctx.fillRect(r[0], r[1], r[2], r[3]);
        ctx.fillStyle = '#8a6238';
        ctx.fillRect(r[0], r[1], r[2], 7);
        ctx.fillStyle = '#4a3018';
        ctx.fillRect(r[0] + 8, r[1] + r[3] - 4, 6, 4);
        ctx.fillRect(r[0] + r[2] - 14, r[1] + r[3] - 4, 6, 4);
      } else if (kind === 'plinth' || kind === 'pedestal') {
        // marble plinth / pedestal with a small exhibit on top
        ctx.fillStyle = '#c9d2de';
        ctx.fillRect(r[0], r[1], r[2], r[3]);
        ctx.fillStyle = '#e8edf4';
        ctx.fillRect(r[0], r[1], r[2], 6);
        ctx.fillStyle = '#9aa7b8';
        ctx.fillRect(r[0], r[1] + r[3] - 5, r[2], 5);
        if (kind === 'plinth') {
          // small stone bust
          ctx.fillStyle = '#7e8894';
          ctx.beginPath();
          ctx.arc(cx, cy - 6, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(cx, cy + 6, 10, 6, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // small gold vase
          ctx.fillStyle = '#d99600';
          ctx.beginPath();
          ctx.arc(cx, cy, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(cx - 2, cy - 11, 4, 6);
        }
      } else if (kind === 'case') {
        // marble base slab under the glass case; the glass itself is drawn
        // by drawCase, after the diamond, so it can crack or stand open
        ctx.fillStyle = '#c9d2de';
        ctx.fillRect(r[0] - 4, r[1] + r[3], r[2] + 8, 10);
        ctx.fillStyle = '#9aa7b8';
        ctx.fillRect(r[0] - 4, r[1] + r[3] + 7, r[2] + 8, 3);
      }
    });
  }

  function drawDecor(ctx) {
    // framed paintings on the top wall
    [[430, 16], [980, 16]].forEach(function (p) {
      ctx.fillStyle = '#3a2a1a';
      ctx.fillRect(p[0], p[1], 60, 42);
      ctx.fillStyle = '#7a9cc4';
      ctx.fillRect(p[0] + 4, p[1] + 4, 52, 26);
      ctx.fillStyle = '#4a6b4a';
      ctx.fillRect(p[0] + 4, p[1] + 24, 52, 10);
      ctx.fillStyle = '#ffd34d';
      ctx.beginPath();
      ctx.arc(p[0] + 44, p[1] + 12, 5, 0, Math.PI * 2);
      ctx.fill();
    });
    // velvet rope barriers: posts + sagging rope
    function rope(x1, y1, x2, y2) {
      [[x1, y1], [x2, y2]].forEach(function (p) {
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(p[0] - 2, p[1] - 2, 4, 12);
        ctx.fillStyle = '#ffd34d';
        ctx.beginPath();
        ctx.arc(p[0], p[1] - 2, 4, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.strokeStyle = '#a11d2e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo((x1 + x2) / 2, y1 + 14, x2, y2);
      ctx.stroke();
    }
    rope(648, 385, 752, 385); // in front of the diamond case
    rope(1078, 170, 1162, 170); // in front of the vase
    rope(78, 462, 162, 462); // in front of the painting
  }

  // The exit is a real doorway in the bottom wall (rev1 C): frame, two
  // panels, and a TERKUNCI / TERBUKA plate attached to the door itself.
  function drawExitDoor(ctx, open) {
    var e = AV.EXIT;
    ctx.fillStyle = '#2a2118';
    ctx.fillRect(e.x, e.y, e.w, e.h);
    ctx.strokeStyle = '#6b4a2a';
    ctx.lineWidth = 3;
    ctx.strokeRect(e.x, e.y, e.w, e.h);
    if (open) {
      // doors swung open: green glow from the doorway + open panels
      var glow = ctx.createRadialGradient(620, 599, 4, 620, 599, 46);
      glow.addColorStop(0, 'rgba(74,222,128,0.8)');
      glow.addColorStop(1, 'rgba(74,222,128,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(e.x + 4, e.y + 4, e.w - 8, e.h - 8);
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(e.x + 6, e.y + 8);
      ctx.lineTo(e.x + 22, e.y + e.h - 6);
      ctx.moveTo(e.x + e.w - 6, e.y + 8);
      ctx.lineTo(e.x + e.w - 22, e.y + e.h - 6);
      ctx.stroke();
    } else {
      // closed double doors + padlock
      ctx.fillStyle = '#5a3a22';
      ctx.fillRect(e.x + 4, e.y + 4, (e.w - 8) / 2 - 1, e.h - 8);
      ctx.fillRect(e.x + e.w / 2 + 1, e.y + 4, (e.w - 8) / 2 - 1, e.h - 8);
      ctx.strokeStyle = '#3a2412';
      ctx.lineWidth = 2;
      ctx.strokeRect(e.x + 4, e.y + 4, (e.w - 8) / 2 - 1, e.h - 8);
      ctx.strokeRect(e.x + e.w / 2 + 1, e.y + 4, (e.w - 8) / 2 - 1, e.h - 8);
      ctx.strokeStyle = '#ffd34d';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(620, 597, 5, Math.PI, 0);
      ctx.stroke();
      ctx.fillStyle = '#ffd34d';
      ctx.fillRect(614, 596, 12, 9);
    }
    // the plate, attached to the top of the door frame
    ctx.fillStyle = open ? '#15803d' : '#7f1d2a';
    ctx.fillRect(e.x + 8, e.y - 22, e.w - 16, 20);
    ctx.strokeStyle = open ? '#4ade80' : '#ff5d6c';
    ctx.lineWidth = 2;
    ctx.strokeRect(e.x + 8, e.y - 22, e.w - 16, 20);
    if (!noLabel()) {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(open ? 'TERBUKA' : 'TERKUNCI', e.x + e.w / 2, e.y - 8);
    }
  }

  function drawLoot(ctx, loot) {
    loot.forEach(function (item) {
      if (item.taken) {
        // an empty slot, not a vanished one (rev1 B): the taken loot leaves
        // a faint pedestal ring behind, so the theft has a trace
        ctx.strokeStyle = 'rgba(255,211,77,0.35)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(item.x, item.y, item.main ? 16 : 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(201,210,222,0.25)';
        ctx.fillRect(item.x - 10, item.y + 8, 20, 5);
        return;
      }
      var glow = item.main ? 34 : 20;
      var grad = ctx.createRadialGradient(item.x, item.y, 2, item.x, item.y, glow);
      grad.addColorStop(0, 'rgba(255,200,60,0.85)');
      grad.addColorStop(1, 'rgba(255,200,60,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(item.x, item.y, glow, 0, Math.PI * 2);
      ctx.fill();
      if (item.main) {
        // the Amber Diamond: a big faceted gem. No in-canvas label: the gem
        // + case + glow + the objective line name it, and a label there
        // would sit on the glow it is supposed to frame.
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = '#ffc93d';
        ctx.fillRect(-13, -13, 26, 26);
        ctx.fillStyle = '#ffedb0';
        ctx.fillRect(-13, -13, 26, 10);
        ctx.fillStyle = '#d99600';
        ctx.fillRect(-4, -4, 8, 8);
        ctx.restore();
        ctx.strokeStyle = '#fff3c4';
        ctx.lineWidth = 2;
        ctx.strokeRect(item.x - 13, item.y - 13, 26, 26);
      } else {
        ctx.fillStyle = '#ffd34d';
        ctx.beginPath();
        ctx.arc(item.x, item.y, item.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff3c4';
        ctx.beginPath();
        ctx.arc(item.x - 3, item.y - 3, 4, 0, Math.PI * 2);
        ctx.fill();
        var tag = item.id === 'gold' ? 'EMAS' : item.id === 'painting' ? 'LUKISAN' : 'VAS JADE';
        // label clear of the cone edge and of other labels. FIX 1: the vase
        // label moves LEFT of the C1 cone's edge line (it used to straddle
        // it). FIX 2: the painting label moves to the framed painting on
        // the top wall — below, it pointed at the bench and the rope.
        var lx = item.x;
        var ly = item.y + 36;
        if (item.id === 'painting') { lx = 460; ly = 80; }
        // FIX 1 (revised): (1050,152) was clear for cam1=2.6 but the
        // 2.9 sweep in 3-grab put the edge line through the text. (1030,117)
        // is clear of the edge for both sweeps (20-70px), clear of the
        // wall, the vase glow, and the rope.
        else if (item.id === 'vase') { lx = 1030; ly = 117; }
        label(ctx, tag, lx, ly, '#ffd34d');
      }
    });
  }

  // The glass case: closed, cracked open while the thief reaches in, or
  // standing open and empty once the diamond is gone.
  function drawCase(ctx, game) {
    var diamond = game.loot[0];
    var reaching = game.thief.pose === 'reach' && !diamond.taken;
    ctx.fillStyle = 'rgba(140,220,255,0.12)';
    ctx.fillRect(660, 270, 80, 60);
    if (diamond.taken) {
      // open and empty: the two glass panels swung out, the pedestal bare
      ctx.strokeStyle = 'rgba(140,220,255,0.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(660, 270);
      ctx.lineTo(640, 250);
      ctx.moveTo(660, 330);
      ctx.lineTo(640, 350);
      ctx.moveTo(740, 270);
      ctx.lineTo(760, 250);
      ctx.moveTo(740, 330);
      ctx.lineTo(760, 350);
      ctx.stroke();
      ctx.fillStyle = 'rgba(201,210,222,0.5)';
      ctx.fillRect(690, 300, 20, 8);
      return;
    }
    ctx.strokeStyle = 'rgba(140,220,255,0.85)';
    ctx.lineWidth = 3;
    ctx.strokeRect(660, 270, 80, 60);
    if (reaching) {
      // cracked where the hand comes in, lid ajar
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(740, 300);
      ctx.lineTo(724, 288);
      ctx.lineTo(730, 278);
      ctx.moveTo(740, 300);
      ctx.lineTo(722, 306);
      ctx.lineTo(728, 318);
      ctx.moveTo(740, 300);
      ctx.lineTo(726, 296);
      ctx.stroke();
      ctx.save();
      ctx.translate(700, 270);
      ctx.rotate(-0.45);
      ctx.strokeStyle = 'rgba(140,220,255,0.6)';
      ctx.lineWidth = 2;
      ctx.strokeRect(-40, -16, 80, 8);
      ctx.restore();
    }
  }

  // A guard is a figure, not a dot: shoulders, head with cap, and a
  // flashlight at the front — the vision cone starts at the flashlight.
  // FIX 3: the figure is drawn 1.5x (QC: it read as a dot at judge size).
  function drawGuardFigure(ctx, x, y, angle, pose) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(1.5, 1.5);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 17, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // legs, trailing
    ctx.fillStyle = '#1f2a44';
    ctx.beginPath();
    ctx.ellipse(-11, -7, 7, 4, 0, 0, Math.PI * 2);
    ctx.ellipse(-11, 7, 7, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // torso: red uniform
    ctx.fillStyle = '#b01e2e';
    ctx.strokeStyle = '#5f0f1a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // head + cap
    ctx.fillStyle = '#e8b98a';
    ctx.beginPath();
    ctx.arc(7, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1f2a44';
    ctx.beginPath();
    ctx.arc(7, 0, 7, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(11, -2, 5, 4);
    if (pose === 'alert') {
      // arm extended forward, flashlight on the thief
      ctx.strokeStyle = '#e8b98a';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(4, -6);
      ctx.lineTo(20, -2);
      ctx.stroke();
    } else {
      ctx.strokeStyle = '#e8b98a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.lineTo(-5, -11);
      ctx.moveTo(0, 9);
      ctx.lineTo(-5, 11);
      ctx.stroke();
    }
    // flashlight at the front: the cone starts here
    ctx.fillStyle = '#fff7c0';
    ctx.beginPath();
    ctx.arc(13, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // A camera is a real camera: wall mount, body, lens facing the sweep.
  function drawCameraFigure(ctx, c) {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.rotate(c.angle);
    ctx.fillStyle = '#dfe5ee';
    ctx.strokeStyle = '#5a6b84';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(-8, -6, 20, 12);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#222a3a';
    ctx.beginPath();
    ctx.arc(13, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#cfe8ff';
    ctx.beginPath();
    ctx.arc(11, -2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff2e4d';
    ctx.beginPath();
    ctx.arc(-4, -3, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawGuards(ctx, game) {
    game.guards.forEach(function (g) {
      var p = AV.guards.guardXY(g);
      // the cone starts at the flashlight — FIX 3: the 1.5x figure puts
      // the flashlight ~20px ahead of the body, not 12px
      var ox = p.x + Math.cos(g.angle) * 20;
      var oy = p.y + Math.sin(g.angle) * 20;
      drawCone(ctx, ox, oy, g.angle, AV.GUARD_RANGE, AV.GUARD_HALF_ANGLE,
        g.spotting ? 'rgba(255,45,70,0.5)' : 'rgba(255,45,70,0.30)',
        g.spotting ? 'rgba(255,90,105,0.95)' : 'rgba(255,90,105,0.6)');
      drawGuardFigure(ctx, p.x, p.y, g.angle, g.pose || 'patrol');
      // label on the side away from the cone: below, unless the cone
      // points down (guard B), where it goes above
      var ly = (g.axis === 'y' && g.dir > 0) ? p.y - 42 : p.y + 42;
      label(ctx, 'PENJAGA', p.x, ly, '#ff8b96');
      if (g.spotting) label(ctx, '!', p.x, ly === p.y - 42 ? p.y + 42 : p.y - 42, '#ff2e4d');
    });
    game.cameras.forEach(function (c) {
      var ox = c.x + Math.cos(c.angle) * 12;
      var oy = c.y + Math.sin(c.angle) * 12;
      drawCone(ctx, ox, oy, c.angle, AV.CAM_RANGE, AV.CAM_HALF_ANGLE,
        c.spotting ? 'rgba(255,170,0,0.6)' : 'rgba(255,170,0,0.45)',
        c.spotting ? 'rgba(255,205,90,1)' : 'rgba(255,205,90,0.95)');
      drawCameraFigure(ctx, c);
      // label clear of the cone edge and of the border. FIX 1: C1's label
      // used to sit on the cone's edge line; it moves below the cone, clear
      // of the vase glow, the rope, and the right wall. C2's stays above.
      var lx = c.x < 100 ? c.x + 16 : c.x;
      var ly = c.y < 100 ? c.y + 38 : c.y - 38;
      if (c.id === 'C1') { lx = 1178; ly = 148; }
      label(ctx, 'KAMERA', lx, ly, '#ffc93d');
    });
  }

  // The thief is a figure: hunched, loot bag on his back, one hand reaching.
  // Drawn in local space facing east, then rotated to the facing angle.
  function drawThief(ctx, game) {
    var thief = game.thief;
    if (thief.smoke > 0) {
      ctx.fillStyle = 'rgba(200,205,215,0.35)';
      for (var i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(thief.x - 18 + i * 9, thief.y + ((i % 2) ? -8 : 8), 13, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    var pose = thief.pose || (thief.moving ? 'run' : 'stand');
    ctx.save();
    ctx.translate(thief.x, thief.y);
    ctx.rotate(thief.face);
    ctx.scale(1.5, 1.5); // FIX 3: 1.5x figure (QC: ~70px read as a smudge at 768px)
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 17, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    if (pose === 'reach') {
      ctx.fillStyle = '#0b2a33';
      ctx.beginPath();
      ctx.ellipse(-14, -6, 8, 4, 0, 0, Math.PI * 2);
      ctx.ellipse(-14, 6, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#19c8f0';
      ctx.strokeStyle = '#0a5a70';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 13, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // loot bag on the back
      ctx.fillStyle = '#7a5a28';
      ctx.strokeStyle = '#3a2a10';
      ctx.fillRect(-21, -7, 11, 14);
      ctx.strokeRect(-21, -7, 11, 14);
      ctx.fillStyle = '#ffd34d';
      ctx.fillRect(-17, -1, 3, 3);
      // head
      ctx.fillStyle = '#e8b98a';
      ctx.beginPath();
      ctx.arc(9, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.arc(9, 0, 7, Math.PI * 0.9, Math.PI * 1.9);
      ctx.fill();
      // reaching arm, hand at the glass
      ctx.strokeStyle = '#e8b98a';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(2, -5);
      ctx.lineTo(26, -2);
      ctx.stroke();
      ctx.fillStyle = '#e8b98a';
      ctx.beginPath();
      ctx.arc(27, -2, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (pose === 'crouch') {
      ctx.fillStyle = '#0b2a33';
      ctx.beginPath();
      ctx.ellipse(-6, -8, 8, 4, 0, 0, Math.PI * 2);
      ctx.ellipse(-6, 8, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#19c8f0';
      ctx.strokeStyle = '#0a5a70';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#7a5a28';
      ctx.fillRect(-15, -6, 9, 12);
      ctx.fillStyle = '#e8b98a';
      ctx.beginPath();
      ctx.arc(5, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.arc(5, 0, 6, Math.PI * 0.9, Math.PI * 1.9);
      ctx.fill();
      // hands pulled in, up near the head
      ctx.strokeStyle = '#e8b98a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(7, -7);
      ctx.moveTo(0, 6);
      ctx.lineTo(7, 7);
      ctx.stroke();
    } else if (pose === 'run') {
      ctx.strokeStyle = '#0b2a33';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-8, -4);
      ctx.lineTo(-22, -9);
      ctx.moveTo(-8, 4);
      ctx.lineTo(-22, 9);
      ctx.stroke();
      ctx.fillStyle = '#19c8f0';
      ctx.strokeStyle = '#0a5a70';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(2, 0, 13, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#7a5a28';
      ctx.strokeStyle = '#3a2a10';
      ctx.fillRect(-14, -7, 11, 14);
      ctx.strokeRect(-14, -7, 11, 14);
      ctx.fillStyle = '#e8b98a';
      ctx.beginPath();
      ctx.arc(11, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.arc(11, 0, 7, Math.PI * 0.9, Math.PI * 1.9);
      ctx.fill();
      ctx.strokeStyle = '#e8b98a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(2, -6);
      ctx.lineTo(18, -8);
      ctx.moveTo(2, 6);
      ctx.lineTo(-12, 10);
      ctx.stroke();
    } else {
      // stand: upright, arms at the sides
      ctx.fillStyle = '#0b2a33';
      ctx.beginPath();
      ctx.ellipse(-8, -6, 7, 4, 0, 0, Math.PI * 2);
      ctx.ellipse(-8, 6, 7, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#19c8f0';
      ctx.strokeStyle = '#0a5a70';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 11, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#7a5a28';
      ctx.fillRect(-14, -6, 9, 12);
      ctx.fillStyle = '#e8b98a';
      ctx.beginPath();
      ctx.arc(4, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.arc(4, 0, 7, Math.PI * 0.9, Math.PI * 1.9);
      ctx.fill();
      ctx.strokeStyle = '#e8b98a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(-4, -10);
      ctx.moveTo(0, 8);
      ctx.lineTo(-4, 10);
      ctx.stroke();
    }
    ctx.restore();
    // label below the figure, clear of the cone edge and the case glow;
    // above instead when the thief runs south (escape: the door is below)
    var ly = thief.y + 58;
    if (Math.sin(thief.face) > 0.7) ly = thief.y - 52;
    label(ctx, 'MALING', thief.x, ly, '#5ee6ff');
  }

  function drawObjective(ctx) {
    if (noLabel()) return;
    // one static mission line. The loot count lives here and in the HUD
    // only — the toasts and the third footer span that repeated it are gone.
    ctx.font = '600 14px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#c6d2e4';
    ctx.fillText('Misi: ambil 4 loot — mulai dari BERLIAN KUNING', 70, H - 26);
  }

  function drawEndState(ctx, game) {
    if (game.state !== 'caught' && game.state !== 'escaped') return;
    ctx.fillStyle = 'rgba(5,8,16,0.82)';
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    if (game.state === 'caught') {
      ctx.fillStyle = '#ff2e4d';
      ctx.font = 'bold 52px "Segoe UI", system-ui, sans-serif';
      ctx.fillText('TERTANGKAP!', W / 2, 290);
      ctx.fillStyle = '#e8ecf4';
      ctx.font = '20px "Segoe UI", system-ui, sans-serif';
      ctx.fillText('Alarm 100% — tekan Enter untuk coba lagi', W / 2, 330);
    } else {
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 52px "Segoe UI", system-ui, sans-serif';
      ctx.fillText('KABUR!', W / 2, 290);
      ctx.fillStyle = '#e8ecf4';
      ctx.font = '20px "Segoe UI", system-ui, sans-serif';
      ctx.fillText('Semua loot aman — tekan Enter untuk main lagi', W / 2, 330);
    }
  }

  function drawTitle(ctx) {
    ctx.fillStyle = 'rgba(5,8,16,0.82)';
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd34d';
    ctx.font = 'bold 52px "Segoe UI", system-ui, sans-serif';
    ctx.fillText('AMBER VAULT', W / 2, 240);
    ctx.fillStyle = '#e8ecf4';
    ctx.font = '20px "Segoe UI", system-ui, sans-serif';
    ctx.fillText('Museum Heist — curi Berlian Kuning tanpa ketahuan', W / 2, 280);
    ctx.fillStyle = '#9fb0c8';
    ctx.font = '17px "Segoe UI", system-ui, sans-serif';
    ctx.fillText('WASD / panah gerak · Shift lari · E ambil loot · Q bom asap (2x)', W / 2, 330);
    ctx.fillText('Kerucut merah = penjaga · kerucut amber = kamera · alarm 100% = tertangkap', W / 2, 358);
    ctx.fillStyle = '#ffd34d';
    ctx.font = 'bold 22px "Segoe UI", system-ui, sans-serif';
    ctx.fillText('Klik atau tekan Enter untuk mulai', W / 2, 420);
  }

  function render(ctx, game) {
    drawFloor(ctx);
    drawSolids(ctx);
    drawDecor(ctx);
    drawExitDoor(ctx, game.exitOpen);
    drawLoot(ctx, game.loot);
    drawCase(ctx, game);
    drawGuards(ctx, game);
    drawThief(ctx, game);
    drawObjective(ctx);
    drawEndState(ctx, game);
    // red edge pulse while the alarm runs hot
    if (game.alarm > 50 && game.state === 'play') {
      ctx.strokeStyle = 'rgba(255,46,77,' + (0.25 + (game.alarm - 50) / 100) + ')';
      ctx.lineWidth = 10;
      ctx.strokeRect(5, 5, W - 10, H - 10);
    }
    if (game.state === 'title') drawTitle(ctx);
  }

  AV.render = { render: render };
})();
