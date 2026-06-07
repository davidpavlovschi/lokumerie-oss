#!/bin/bash
# lokum - CLI for Lokumerie
# http://localhost:3000
#
# Quick install (recommended):
#   curl -sL http://localhost:3000/lokum.sh | LOKUM_API_KEY=lok_xxx bash -s -- setup
#
# Manual install:
#   curl -sL http://localhost:3000/lokum.sh -o /usr/local/bin/lokum && chmod +x /usr/local/bin/lokum
#   lokum login

LOKUM_RC="$HOME/.lokumrc"
LOKUM_URL="${LOKUM_URL:-http://localhost:3000}"

RED='\033[0;31m'
GREEN='\033[0;32m'
GOLD='\033[0;33m'
DIM='\033[2m'
BOLD='\033[1m'
NC='\033[0m'

# Load saved key
load_key() {
  if [ -n "$LOKUM_API_KEY" ]; then
    return
  fi
  if [ -f "$LOKUM_RC" ]; then
    LOKUM_API_KEY=$(grep -E '^LOKUM_API_KEY=' "$LOKUM_RC" | cut -d= -f2 | tr -d '"' | tr -d "'")
    export LOKUM_API_KEY
  fi
}

require_key() {
  load_key
  if [ -z "$LOKUM_API_KEY" ]; then
    echo -e "${RED}Non authentifie.${NC} Lancez ${BOLD}lokum login${NC} d'abord."
    exit 1
  fi
}

case "${1}" in
  setup)
    echo -e "${BOLD}${GOLD}lokum${NC} — Installation"
    echo ""

    # 1. Find writable bin directory
    BIN_DIR=""
    if [ -w "/usr/local/bin" ]; then
      BIN_DIR="/usr/local/bin"
    else
      BIN_DIR="$HOME/.local/bin"
      mkdir -p "$BIN_DIR"
    fi

    # 2. Download lokum to bin dir
    SCRIPT_URL="${LOKUM_URL}/lokum.sh"
    echo -e "  Telechargement dans ${GOLD}$BIN_DIR/lokum${NC}..."
    curl -sL "$SCRIPT_URL" -o "$BIN_DIR/lokum"
    chmod +x "$BIN_DIR/lokum"
    echo -e "  ${GREEN}✓${NC} Installe"

    # 3. Handle PATH if needed
    case ":$PATH:" in
      *":$BIN_DIR:"*) ;;
      *)
        # Detect shell rc file
        SHELL_RC=""
        case "$(basename "$SHELL")" in
          zsh)  SHELL_RC="$HOME/.zshrc" ;;
          bash)
            if [ -f "$HOME/.bash_profile" ]; then
              SHELL_RC="$HOME/.bash_profile"
            else
              SHELL_RC="$HOME/.bashrc"
            fi
            ;;
          *)    SHELL_RC="$HOME/.profile" ;;
        esac

        if [ -n "$SHELL_RC" ]; then
          PATH_LINE="export PATH=\"$BIN_DIR:\$PATH\""
          if ! grep -qF "$BIN_DIR" "$SHELL_RC" 2>/dev/null; then
            echo "" >> "$SHELL_RC"
            echo "# Added by lokum setup" >> "$SHELL_RC"
            echo "$PATH_LINE" >> "$SHELL_RC"
            echo -e "  ${GREEN}✓${NC} PATH ajoute a ${DIM}$SHELL_RC${NC}"
          fi
        fi

        export PATH="$BIN_DIR:$PATH"
        ;;
    esac

    # 4. Configure auth if LOKUM_API_KEY is set
    if [ -n "$LOKUM_API_KEY" ]; then
      echo "LOKUM_API_KEY=$LOKUM_API_KEY" > "$LOKUM_RC"
      chmod 600 "$LOKUM_RC"
      echo -e "  ${GREEN}✓${NC} Cle sauvegardee dans ${DIM}~/.lokumrc${NC}"

      # 5. Verify key works
      HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$LOKUM_URL/api/skills" \
        -H "Authorization: Bearer $LOKUM_API_KEY")
      if [ "$HTTP_CODE" = "200" ]; then
        echo -e "  ${GREEN}✓${NC} Cle verifiee"
      else
        echo -e "  ${GOLD}!${NC} Cle non verifiee (HTTP $HTTP_CODE) — essayez ${BOLD}lokum list${NC} plus tard"
      fi
    else
      echo -e "  ${DIM}Pas de cle API. Lancez ${BOLD}lokum login${NC} pour vous connecter.${NC}"
    fi

    # 6. Summary
    echo ""
    echo -e "${GREEN}✓${NC} ${BOLD}lokum${NC} est pret. Tapez ${GOLD}lokum list${NC} pour commencer."
    ;;

  login)
    # Find a free port
    PORT=$(python3 -c "import socket; s=socket.socket(); s.bind(('',0)); print(s.getsockname()[1]); s.close()" 2>/dev/null)
    if [ -z "$PORT" ]; then
      PORT=9876
    fi

    AUTH_URL="$LOKUM_URL/cli/auth?port=$PORT"
    echo -e "${BOLD}${GOLD}lokum${NC} — Connexion"
    echo ""
    echo -e "Ouverture du navigateur..."
    echo -e "${DIM}Si le navigateur ne s'ouvre pas, visitez :${NC}"
    echo -e "  ${GOLD}$AUTH_URL${NC}"
    echo ""

    # Open browser
    if command -v open &>/dev/null; then
      open "$AUTH_URL"
    elif command -v xdg-open &>/dev/null; then
      xdg-open "$AUTH_URL"
    fi

    echo -e "En attente de l'autorisation..."

    # Start local HTTP server to receive the callback
    python3 -c "
import http.server, urllib.parse, sys, os

class Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)
        key = params.get('key', [None])[0]

        if key and key.startswith('lok_'):
            # Save key
            rc_path = os.path.expanduser('~/.lokumrc')
            with open(rc_path, 'w') as f:
                f.write(f'LOKUM_API_KEY={key}\n')
            os.chmod(rc_path, 0o600)

            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            html = '''<!DOCTYPE html>
<html><head><title>Lokum CLI</title>
<style>
  body { background: #110e0b; color: #f5e6d3; font-family: system-ui; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
  .card { text-align: center; max-width: 360px; padding: 48px 32px; }
  .icon { font-size: 48px; margin-bottom: 16px; }
  h1 { font-size: 20px; margin: 0 0 8px; color: #d4a373; }
  p { font-size: 14px; color: #9a8575; margin: 0; }
  .tag { display: inline-block; margin-top: 16px; background: rgba(74,124,89,0.15); color: #4a7c59; font-size: 12px; padding: 4px 12px; border-radius: 8px; }
</style></head>
<body><div class=\"card\">
  <div class=\"icon\">&#x2713;</div>
  <h1>CLI autorise</h1>
  <p>Vous pouvez fermer cet onglet et retourner au terminal.</p>
  <span class=\"tag\">Connexion reussie</span>
</div></body></html>'''
            self.wfile.write(html.encode())
            # Write success marker
            with open('/tmp/.lokum_auth_ok', 'w') as f:
                f.write('ok')
        else:
            self.send_response(400)
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(b'Invalid callback')

    def log_message(self, *args):
        pass  # Silent

server = http.server.HTTPServer(('127.0.0.1', $PORT), Handler)
server.timeout = 120  # 2 min timeout
server.handle_request()
" 2>/dev/null

    if [ -f /tmp/.lokum_auth_ok ]; then
      rm -f /tmp/.lokum_auth_ok
      echo ""
      echo -e "${GREEN}✓${NC} ${BOLD}Connecte !${NC}"
      echo -e "${DIM}Cle sauvegardee dans ~/.lokumrc${NC}"
    else
      echo ""
      echo -e "${RED}✗${NC} Timeout ou erreur. Reessayez avec ${BOLD}lokum login${NC}"
      exit 1
    fi
    ;;

  logout)
    if [ -f "$LOKUM_RC" ]; then
      rm -f "$LOKUM_RC"
      echo -e "${GREEN}✓${NC} Deconnecte. Cle supprimee."
    else
      echo -e "${DIM}Deja deconnecte.${NC}"
    fi
    ;;

  push)
    require_key
    shift
    if [ $# -eq 0 ]; then
      echo -e "${RED}Usage:${NC} lokum push <fichier.md|dossier-skill> [...] [--changelog=\"message\"]"
      exit 1
    fi
    CHANGELOG=""
    FILES=()
    for arg in "$@"; do
      case "$arg" in
        --changelog=*) CHANGELOG="${arg#--changelog=}" ;;
        *) FILES+=("$arg") ;;
      esac
    done
    if [ ${#FILES[@]} -eq 0 ]; then
      echo -e "${RED}Usage:${NC} lokum push <fichier.md|dossier-skill> [...] [--changelog=\"message\"]"
      exit 1
    fi
    for file in "${FILES[@]}"; do
      PAYLOAD_FILE=""
      if [ -d "$file" ]; then
        if [ ! -f "$file/SKILL.md" ]; then
          echo -e "${RED}Dossier skill invalide:${NC} $file ${DIM}(SKILL.md manquant)${NC}"
          continue
        fi
        PAYLOAD_FILE=$(mktemp)
        if ! python3 - "$file" "$CHANGELOG" > "$PAYLOAD_FILE" <<'PY'
import base64
import json
import os
import stat
import sys
from pathlib import Path

root = Path(sys.argv[1]).resolve()
changelog = sys.argv[2]
ignored_dirs = {".git", ".next", ".vercel", "node_modules", "__pycache__"}
ignored_files = {".DS_Store"}
files = []

for path in sorted(root.rglob("*")):
    if not path.is_file():
        continue
    rel_parts = path.relative_to(root).parts
    if any(part in ignored_dirs for part in rel_parts):
        continue
    if path.name in ignored_files or path.suffix in {".pyc", ".pyo"}:
        continue

    rel = Path(*rel_parts).as_posix()
    data = path.read_bytes()
    mode = stat.S_IMODE(path.stat().st_mode)
    try:
        text = data.decode("utf-8")
        if "\x00" in text:
            raise UnicodeDecodeError("utf-8", data, 0, 1, "nul byte")
        item = {
            "path": rel,
            "encoding": "utf-8",
            "content": text,
            "mode": mode,
            "size": len(data),
        }
    except UnicodeDecodeError:
        item = {
            "path": rel,
            "encoding": "base64",
            "content": base64.b64encode(data).decode("ascii"),
            "mode": mode,
            "size": len(data),
        }
    files.append(item)

skill_md = root / "SKILL.md"
payload = {
    "content": skill_md.read_text(encoding="utf-8"),
    "bundle": {
        "format": "codex-skill",
        "root": root.name,
        "entrypoint": "SKILL.md",
        "files": files,
    },
}
if changelog:
    payload["changelog"] = changelog
json.dump(payload, sys.stdout)
PY
        then
          echo -e "${RED}✗${NC} Impossible de preparer le bundle: $file"
          rm -f "$PAYLOAD_FILE"
          continue
        fi
        resp=$(curl -s -X POST "$LOKUM_URL/api/skills" \
          -H "Authorization: Bearer $LOKUM_API_KEY" \
          -H "Content-Type: application/json" \
          --data-binary @"$PAYLOAD_FILE")
        rm -f "$PAYLOAD_FILE"
      elif [ -f "$file" ]; then
        if [ -n "$CHANGELOG" ]; then
          PAYLOAD_FILE=$(mktemp)
          python3 - "$file" "$CHANGELOG" > "$PAYLOAD_FILE" <<'PY'
import json
import sys
from pathlib import Path

payload = {
    "content": Path(sys.argv[1]).read_text(encoding="utf-8"),
    "changelog": sys.argv[2],
}
json.dump(payload, sys.stdout)
PY
          resp=$(curl -s -X POST "$LOKUM_URL/api/skills" \
            -H "Authorization: Bearer $LOKUM_API_KEY" \
            -H "Content-Type: application/json" \
            --data-binary @"$PAYLOAD_FILE")
          rm -f "$PAYLOAD_FILE"
        else
          resp=$(curl -s -X POST "$LOKUM_URL/api/skills" \
            -H "Authorization: Bearer $LOKUM_API_KEY" \
            -H "Content-Type: text/markdown" \
            --data-binary @"$file")
        fi
      else
        echo -e "${RED}Introuvable:${NC} $file"
        continue
      fi

      status=$(echo "$resp" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
      name=$(echo "$resp" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
      slug_val=$(echo "$resp" | grep -o '"slug":"[^"]*"' | cut -d'"' -f4)
      ver=$(echo "$resp" | grep -o '"version":[0-9]*' | cut -d: -f2)
      is_bundle=$(echo "$resp" | grep -o '"bundle":true' || true)
      if [ -n "$name" ]; then
        echo -e "${GREEN}✓${NC} ${BOLD}$name${NC} v$ver ${DIM}($status)${NC}"
        if [ -n "$is_bundle" ]; then
          echo -e "  ${DIM}bundle Codex complet${NC}"
        fi
        if [ -n "$slug_val" ]; then
          echo -e "  ${DIM}lokum install ${slug_val}${NC}"
        fi
      else
        echo -e "${RED}✗${NC} Erreur: $resp"
      fi
    done
    ;;

  list|ls)
    require_key
    resp=$(curl -s "$LOKUM_URL/api/skills" \
      -H "Authorization: Bearer $LOKUM_API_KEY")
    echo "$resp" | python3 -c "
import sys, json
try:
    skills = json.load(sys.stdin)
    if not skills:
        print('Aucun skill disponible.')
    else:
        for s in skills:
            tags = ', '.join(s.get('tags', []))
            desc = (s.get('description') or '')[:60]
            print(f\"  \033[1m{s['name']}\033[0m  \033[2mv{s.get('version',0)}\033[0m  \033[33m{s['flavor']}\033[0m\")
            if desc:
                print(f\"    \033[2m{desc}\033[0m\")
            if tags:
                print(f\"    \033[2m[{tags}]\033[0m\")
except: print('Erreur de parsing.')
" 2>/dev/null || echo -e "${RED}Erreur de connexion${NC}"
    ;;

  install|get)
    require_key
    shift
    if [ -z "$1" ]; then
      echo -e "${RED}Usage:${NC} lokum install <slug> [--version=N]"
      exit 1
    fi
    SLUG="$1"
    VERSION_PARAM=""
    shift
    for arg in "$@"; do
      case "$arg" in
        --version=*) VERSION_PARAM="${arg#--version=}" ;;
      esac
    done
    query=$(echo "$SLUG" | sed 's/ /%20/g')
    URL="$LOKUM_URL/api/skills?slug=$query"
    if [ -n "$VERSION_PARAM" ]; then
      URL="$URL&version=$VERSION_PARAM"
    fi
    RESP_FILE=$(mktemp)
    curl -s "$URL" -H "Authorization: Bearer $LOKUM_API_KEY" > "$RESP_FILE"
    INSTALL_MSG=$(python3 - "$RESP_FILE" <<'PY' 2>/tmp/lokum_err
import base64
import json
import os
import re
import stat
import sys
from pathlib import Path

resp_path = Path(sys.argv[1])
d = json.loads(resp_path.read_text())
if "error" in d:
    print("ERREUR:" + str(d["error"]), file=sys.stderr)
    sys.exit(1)

def safe_name(value: str) -> str:
    name = re.sub(r"[^a-zA-Z0-9._-]+", "-", value.strip()).strip(".-")
    return name or "skill"

def safe_rel(path: str) -> Path:
    rel = Path(path)
    if rel.is_absolute() or any(part in {"", ".", ".."} for part in rel.parts):
        raise ValueError(f"unsafe path: {path}")
    return rel

bundle = d.get("bundle")
if isinstance(bundle, dict) and bundle.get("format") == "codex-skill":
    root = safe_name(str(bundle.get("root") or d.get("name") or d.get("slug") or "skill"))
    dest = Path(root)
    if dest.exists():
        print(f"ERREUR:destination exists: {dest}", file=sys.stderr)
        sys.exit(1)

    files = bundle.get("files")
    if not isinstance(files, list):
        print("ERREUR:invalid bundle files", file=sys.stderr)
        sys.exit(1)

    for item in files:
        if not isinstance(item, dict):
            print("ERREUR:invalid bundle file", file=sys.stderr)
            sys.exit(1)
        rel = safe_rel(str(item.get("path", "")))
        encoding = item.get("encoding")
        content = item.get("content")
        if not isinstance(content, str):
            print("ERREUR:invalid bundle content", file=sys.stderr)
            sys.exit(1)
        data = content.encode("utf-8") if encoding == "utf-8" else base64.b64decode(content)
        out = dest / rel
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_bytes(data)
        mode = item.get("mode")
        if isinstance(mode, int):
            os.chmod(out, stat.S_IMODE(mode))

    print(f"{d.get('name', root)} v{d.get('version', '')} installe dans {dest}/")
else:
    content = d.get("content")
    if not isinstance(content, str):
        print("ERREUR:missing content", file=sys.stderr)
        sys.exit(1)
    name = safe_name(str(d.get("name") or "skill")).lower()
    filename = f"{name}.md"
    Path(filename).write_text(content, encoding="utf-8")
    print(f"{d.get('name', name)} v{d.get('version', '')} installe dans {filename}")
PY
)
    rm -f "$RESP_FILE"
    err=$(cat /tmp/lokum_err 2>/dev/null)
    if [ -n "$err" ]; then
      echo -e "${RED}✗${NC} $err"
      exit 1
    fi
    echo -e "${GREEN}✓${NC} $INSTALL_MSG"
    ;;

  versions)
    require_key
    shift
    if [ -z "$1" ]; then
      echo -e "${RED}Usage:${NC} lokum versions <slug>"
      exit 1
    fi
    query=$(echo "$1" | sed 's/ /%20/g')
    resp=$(curl -s "$LOKUM_URL/api/skills?slug=$query&versions=true" \
      -H "Authorization: Bearer $LOKUM_API_KEY")
    echo "$resp" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    if 'error' in d:
        print(f'Erreur: {d[\"error\"]}')
        sys.exit(1)
    name = d.get('name', '')
    versions = d.get('versions', [])
    print(f'\033[1m{name}\033[0m — {len(versions)} version(s)')
    print()
    for v in versions:
        ver = v['version']
        date = v.get('createdAt', '')[:10]
        log = v.get('changelog') or '—'
        print(f'  \033[33mv{ver}\033[0m  \033[2m{date}\033[0m  {log}')
except Exception as e:
    print(f'Erreur de parsing: {e}')
" 2>/dev/null || echo -e "${RED}Erreur de connexion${NC}"
    ;;

  search|find)
    require_key
    shift
    if [ -z "$1" ]; then
      echo -e "${RED}Usage:${NC} lokum search <terme>"
      exit 1
    fi
    query=$(echo "$@" | sed 's/ /%20/g')
    resp=$(curl -s "$LOKUM_URL/api/skills?q=$query" \
      -H "Authorization: Bearer $LOKUM_API_KEY")
    echo "$resp" | python3 -c "
import sys, json
try:
    skills = json.load(sys.stdin)
    if not skills:
        print('Aucun resultat.')
    else:
        print(f'{len(skills)} resultat(s):')
        for s in skills:
            print(f\"  \033[1m{s['name']}\033[0m  \033[2mv{s.get('version',0)}\033[0m  \033[33m{s['flavor']}\033[0m\")
            desc = (s.get('description') or '')[:60]
            if desc:
                print(f\"    \033[2m{desc}\033[0m\")
except: print('Erreur de parsing.')
" 2>/dev/null || echo -e "${RED}Erreur de connexion${NC}"
    ;;

  whoami)
    require_key
    echo -e "${DIM}Authentifie avec la cle dans ~/.lokumrc${NC}"
    echo -e "Serveur: ${GOLD}$LOKUM_URL${NC}"
    ;;

  help|--help|-h|"")
    echo -e "${BOLD}${GOLD}lokum${NC} — CLI pour Lokumerie"
    echo ""
    echo -e "${BOLD}Commandes:${NC}"
    echo -e "  ${GREEN}setup${NC}                              Installer et configurer le CLI"
    echo -e "  ${GREEN}login${NC}                              Se connecter (ouvre le navigateur)"
    echo -e "  ${GREEN}logout${NC}                             Se deconnecter"
    echo -e "  ${GREEN}push${NC} <fichier.md|dossier> [--changelog=..] Pousser un ou plusieurs skills"
    echo -e "  ${GREEN}list${NC}                               Lister tous les skills"
    echo -e "  ${GREEN}search${NC} <terme>                     Chercher un skill"
    echo -e "  ${GREEN}install${NC} <slug> [--version=N]       Telecharger un skill (.md ou dossier Codex)"
    echo -e "  ${GREEN}versions${NC} <slug>                    Voir l'historique des versions"
    echo -e "  ${GREEN}whoami${NC}                             Verifier la connexion"
    echo -e "  ${GREEN}help${NC}                               Afficher cette aide"
    echo ""
    echo -e "${DIM}$LOKUM_URL${NC}"
    ;;

  *)
    echo -e "${RED}Commande inconnue:${NC} $1"
    echo -e "Tapez ${BOLD}lokum help${NC} pour voir les commandes."
    exit 1
    ;;
esac
