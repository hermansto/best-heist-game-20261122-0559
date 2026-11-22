// Amber Vault — tuning constants and the museum floor plan.
// One shared namespace (window.AV) so the classic scripts below can find
// each other without imports. All positions are canvas pixels (1240 x 620).
(function () {
  var AV = (window.AV = window.AV || {});

  AV.CANVAS_W = 1240;
  AV.CANVAS_H = 620;
  AV.WALL = 14; // outer wall thickness

  AV.THIEF_SPEED = 168;
  AV.THIEF_DASH_SPEED = 350;
  AV.THIEF_DASH_TIME = 0.18;
  AV.THIEF_DASH_COOLDOWN = 1.2;
  AV.THIEF_RADIUS = 13;

  AV.GUARD_RANGE = 235;
  AV.GUARD_HALF_ANGLE = 0.56; // ~32 degrees each side
  AV.GUARD_SPOT_RATE = 55; // alarm points per second while seen by a guard
  // Camera cones are smaller and harder-edged than before (rev1 F):
  // high-contrast amber, hard outline, less of the frame covered.
  AV.CAM_RANGE = 210;
  AV.CAM_HALF_ANGLE = 0.42;
  AV.CAM_SPOT_RATE = 40;
  AV.ALARM_DECAY = 6; // alarm points per second while hidden
  AV.ALARM_MAX = 100;

  AV.SMOKE_CHARGES = 2;
  AV.SMOKE_TIME = 3;
  AV.GRAB_DIST = 38;

  // Solid rectangles: [x, y, w, h]. Walls block movement and line of sight;
  // furniture blocks movement and sight the same way. AV.SOLID_KIND names
  // each solid's look (rev1 E: museum, not warehouse — 2 crates left).
  AV.SOLIDS = [
    // outer walls (as four bars)
    [0, 0, 1240, 14], [0, 606, 1240, 14], [0, 0, 14, 620], [1226, 0, 14, 620],
    // interior gallery walls — the gaps between them are the two routes
    [300, 90, 26, 220], [300, 380, 26, 160],
    [640, 240, 26, 200],
    [940, 90, 26, 220],
    // storage crate (kept) + wooden bench facing the painting
    [180, 180, 46, 46],
    [150, 430, 110, 26],
    // marble plinths with small statues
    [480, 120, 46, 46], [480, 440, 46, 46],
    // second storage crate (kept)
    [820, 440, 46, 46],
    // central glass case holding the Amber Diamond
    [660, 270, 80, 60],
    // display pedestals
    [520, 300, 40, 40], [880, 180, 40, 40],
  ];
  AV.SOLID_KIND = [
    'wall', 'wall', 'wall', 'wall',
    'wall', 'wall', 'wall', 'wall',
    'crate', 'bench',
    'plinth', 'plinth',
    'crate',
    'case',
    'pedestal', 'pedestal',
  ];

  // Loot: the Amber Diamond is the main target; taking it unlocks the exit.
  AV.LOOT_DEFS = [
    { id: 'diamond', name: 'Berlian Kuning', x: 700, y: 300, r: 16, main: true },
    { id: 'gold', name: 'Batang Emas', x: 120, y: 110, r: 12, main: false },
    { id: 'painting', name: 'Lukisan Mona', x: 120, y: 500, r: 12, main: false },
    { id: 'vase', name: 'Vas Jade', x: 1120, y: 110, r: 12, main: false },
  ];

  AV.GUARD_DEFS = [
    { id: 'A', axis: 'x', from: 380, to: 900, fixed: 170, speed: 55 },
    { id: 'B', axis: 'y', from: 180, to: 500, fixed: 1080, speed: 48 },
  ];

  // Cameras sit on walls and sweep their cones back and forth.
  // C1 moved slightly off the corner (rev1: it pierced the border).
  AV.CAM_DEFS = [
    { id: 'C1', x: 1180, y: 54, base: 2.35, sweep: 0.55, period: 4.2, phase: 0 },
    { id: 'C2', x: 44, y: 576, base: -0.85, sweep: 0.55, period: 5.1, phase: 4.2 },
  ];

  // The exit door: a real doorway in the bottom wall (rev1 C). The win
  // point (620, 599) sits in its opening; AV.EXIT is the door frame rect.
  AV.EXIT = { x: 570, y: 574, w: 100, h: 46 };
  AV.THIEF_START = { x: 80, y: 540 };
})();
