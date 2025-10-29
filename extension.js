// extension.js
const vscode = require('vscode');

/** Regex „slova“ s diakritikou + tečka (pro text.malý apod.) */
const WORD_RE = /[A-Za-z_\p{L}\p{N}]+(?:\.[A-Za-z_\p{L}\p{N}]+)?/u;

/** Jednoduchý slovník dokumentace – můžeš libovolně rozšiřovat */
const DOCS = (() => {
  const d = {};

  // --- ZÁKLADNÍ KLÍČOVÁ SLOVA
  define('nech', 'Deklarace proměnné.\n\n```brnoskript\nnech x = 42 piča\n```');
  define('rob', 'Deklarace/ výraz funkce.\n\n```brnoskript\nrob f(n) { vrat n + 1 piča }\n// nebo výraz:\nšalát.mapuj(arr, rob (x) { vrat x*2 piča })\n```');
  define('esli', 'Podmínka.\n\n```brnoskript\nesli (cond) { ... } inak { ... }\n```');
  define('inak', 'Větev else pro `esli`.');
  define('šalina', 'While-smyčka.\n\n```brnoskript\nšalina (i < 10) { i += 1 piča }\n```');
  define('okruh', 'For-like smyčka se třemi výrazy oddělenými „piča“.\n\n```brnoskript\nokruh (nech i=0 piča i<3 piča i++) { ... }\n```');
  define('vrat', 'Návrat z funkce.\n\n```brnoskript\nvrat hodnota piča\n```');
  define('vokno', 'Import jiného .brno souboru (run-eval).\n\n```brnoskript\nvokno \"cesta/modul.brno\" piča\n```');
  define('zkus', 'Try/catch/finally.\n\n```brnoskript\nzkus { ... } chyť (e) { ... } potom { ... }\n```');
  define('chyť', 'Catch větev pro `zkus`.');
  define('potom', 'Finally větev pro `zkus`.');
  define('vypadni', 'Break ze smyčky.');
  define('přeskoč', 'Continue ve smyčce.');
  define('rožni', 'Boolean literál `true`.');
  define('zhasni', 'Boolean literál `false`.');
  define('piča', 'Terminátor příkazu (ekvivalent `;`).');

  // --- BUILTINY
  define('vyblij', 'Výpis na konzoli.\n\n```brnoskript\nvyblij(\"Ahoj\") piča\n```');
  define('řekni', 'Alias `vyblij`.');
  define('typ', 'Vrátí textový typ hodnoty (\"číslo\", \"řetězec\", \"pole\", \"mapa\" …).');
  define('házej', 'Vyhození výjimky.\n\n```brnoskript\nházej(\"chyba\") piča\n```');

  // --- NAMESPACEs + členy
  ns('text', {
    'malý': 'Lowercase.\n```brnoskript\ntext.malý(\"Šalina\") // \"šalina\"\n```',
    'velký': 'Uppercase.',
    'díl': 'Substr (od, délka).',
    'obsahuje': 'String.includes.',
    'řež': 'String.split.',
    'spojuj': 'Array.join.',
    'trim': 'String.trim.',
    'zacina': 'String.startsWith.',
    'končí': 'String.endsWith.',
    'formátujDatum': 'Formát data (YYYY,MM,DD,hh,mm,ss).'
  });

  ns('šalát', {
    'dl': 'Délka pole.',
    'hoď': 'push; vrací novou délku.',
    'sekni': 'pop.',
    'otoč': 'reverse.',
    'seřaď': 'sort (volitelný comparator).',
    'mapuj': 'map (callback (x, idx, arr)).',
    'filtruj': 'filter (callback).',
    'spočítej': 'reduce (callback, init).',
    'placka': 'flat(1).',
    'vem': 'index access (a[i]).'
  });

  ns('mapa', {
    'vytvor': 'Vytvoří prázdný objekt `{}`.',
    'dej': 'Nastaví klíč: `mapa.dej(m, k, v)`.',
    'vem': 'Získá hodnotu: `mapa.vem(m, k)`.',
    'keys': 'Object.keys.',
    'values': 'Object.values.',
    'páry': 'Object.entries.',
    'spojit': 'Object.assign({}, a, b).'
  });

  ns('matyš', {
    'abs': 'Abs.',
    'kolo': 'Round.',
    'pod': 'Floor.',
    'nad': 'Ceil.',
    'moc': 'Pow.',
    'kořen': 'Sqrt.',
    'sin': 'Math.sin',
    'cos': 'Math.cos',
    'tan': 'Math.tan',
    'min': 'Math.min(...)',
    'max': 'Math.max(...)',
    'náhoda': 'Math.random()',
    'náhodaMezi': 'Náhodné celé <a,b>.'
  });

  ns('čas', {
    'teď': 'Timestamp v ms.',
    'formát': 'Formát času (mask: YYYY MM DD hh mm ss).',
    'usni': 'Sleep (ms).',
    'odměř': 'Změří dobu běhu funkce (ms).'
  });

  ns('regl', {
    'najdi': 'První shoda regexu.',
    'všeci': 'Všechny shody regexu.',
    'nahrad': 'Globální nahrazení regexem.'
  });

  ns('krypto', {
    'uuid': 'Vygeneruje UUID v4.',
    'base64': 'String → base64.',
    'zbase64': 'base64 → string.',
    'sha256': 'SHA-256 hex.'
  });

  ns('šichta', {
    'argv': 'Argumenty procesu (bez node/script).',
    'env': 'Env proměnná dle jména.',
    'konec': 'Ukončí proces s kódem.'
  });

  ns('šufle', {
    'je': 'existsSync(cesta).',
    'čti': 'readFile utf8.',
    'piš': 'writeFile utf8.',
    'seznam': 'readdir.',
    'info': 'stat().'
  });

  ns('šmirgl', {
    'typy': 'Vrátí mapu klíč → typ hodnoty v objektu.'
  });

  return d;

  function define(name, md) { d[name] = md; }
  function ns(prefix, members) {
    define(prefix, `Namespace **${prefix}**.`);
    for (const k of Object.keys(members)) {
      define(`${prefix}.${k}`, `**${prefix}.${k}** — ${members[k]}`);
    }
  }
})();

/** Vytvoří Markdown hover */
function hoverFor(word) {
  const md = DOCS[word] || DOCS[word.split('.')[0]];
  if (!md) return null;
  const ms = new vscode.MarkdownString(md);
  ms.isTrusted = true;
  ms.supportHtml = false;
  return new vscode.Hover(ms);
}

function activate(context) {
  const provider = vscode.languages.registerHoverProvider('brnoskript', {
    provideHover(doc, pos) {
      const range = doc.getWordRangeAtPosition(pos, WORD_RE);
      if (!range) return;
      const word = doc.getText(range);
      return hoverFor(word);
    }
  });

  context.subscriptions.push(provider);
}

function deactivate() {}

module.exports = { activate, deactivate };
