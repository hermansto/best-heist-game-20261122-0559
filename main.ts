// Amber Vault — make.fun entry program (Node 22, standard library only).
//
// What it does: takes the game in game/ and the screenshots in screenshots/
// from beside this file, puts them under the output directory, and writes
// /output/dossier.json with the vendored make.fun library so the judge can
// read the entry. Outside the grader, MAKEFUN_OUTPUT_DIR stands in for
// /output, e.g. `MAKEFUN_OUTPUT_DIR=out node main.ts`.
//
// The game itself is plain static files (game/index.html plus its scripts)
// that run offline in a desktop browser. Nothing here fetches anything.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const entryDir = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function freshCopy(sourceDir: string, targetDir: string): number {
  rmSync(targetDir, { recursive: true, force: true });
  mkdirSync(targetDir, { recursive: true });
  cpSync(sourceDir, targetDir, { recursive: true });
  return readdirSync(targetDir).length;
}

mkdirSync(outDir, { recursive: true });
const gameEntries = freshCopy(join(entryDir, 'game'), join(outDir, 'game'));
// Screenshots are part of the entry: a dossier without them would be
// rejected by the gate, so refuse to write one instead of going quiet.
if (!existsSync(join(entryDir, 'screenshots'))) {
  throw new Error('amber-vault: screenshots/ is missing beside main.ts');
}
const shotEntries = freshCopy(join(entryDir, 'screenshots'), join(outDir, 'screenshots'));

// Caps the sealed scorer enforces (see the kit's RULES.txt): the dossier
// text budget, at most 4 screenshots of at most 256 KiB each, and game/
// within 993 files / 48 MiB / 1000-byte paths.
const dossierPath = join(outDir, 'dossier.json');
writeFileSync(
  dossierPath,
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

// Fail closed on the one cap buildDossier itself does not enforce: the
// dossier file must stay within 1.5 MiB or the gate refuses the entry.
const dossierBytes = statSync(dossierPath).size;
if (dossierBytes > 1572864) {
  throw new Error(`amber-vault: dossier.json is ${dossierBytes} bytes, over the 1.5 MiB cap`);
}

console.log(`amber-vault: wrote ${outDir} (game: ${gameEntries} entries, screenshots: ${shotEntries}, dossier: ${dossierBytes} bytes)`);
