#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-8080}"

ip="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)"

if [[ -z "${ip}" ]]; then
  ip="<your-lan-ip>"
fi

echo "Serving on 0.0.0.0:${PORT}"
echo "Open from another device: http://${ip}:${PORT}"
python3 -m http.server "${PORT}" --bind 0.0.0.0
