# BrnoSkript (VS Code Extension)

Syntax highlighting a základ pro jazyk **BrnoSkript** s příponou **.brno**.

## Features
- Zvýraznění klíčových slov (`nech`, `rob`, `esli/inak`, `šalina`, `okruh`, `vokno`, `zkus/chyť/potom`, `vypadni`, `přeskoč`)
- Terminátor **`piča`** jako zvláštní punctuace
- Bool literály `rožni` / `zhasni`, `null`
- Strings, čísla, komentáře (`//`, `/* ... */`)
- Členské volání `text.malý(..)`, `šalát.mapuj(..)`, ...
- Snippets pro nejčastější konstrukce
- Přípona **`.brno`**

## Instalace pro vývoj
1. `npm i -g vsce` (pokud chceš balit .vsix)
2. Otevři složku v VS Code: `code ./vscode-brnoskript`
3. Stiskni **F5** (Run Extension) – otevře se Extension Host s podporou `.brno`.
4. Nebo zabal: `vsce package` → `brnoskript-language-*.vsix` a v VS Code `Extensions → ... → Install from VSIX`.

## Poznámky
- Gramatika je záměrně minimalistická (TextMate), ale pokrývá běžné patterny v jazyce vč. diakritiky.
- Pokud přidáš nové klíčové konstrukce v jazyce, stačí rozšířit `syntaxes/brnoskript.tmLanguage.json`.
