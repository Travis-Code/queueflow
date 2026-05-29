#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_FILE="/tmp/queueflow-test-dev.log"
BOOKING_FILE="/tmp/queueflow-test-booking.json"
SLOTS_FILE="/tmp/queueflow-test-slots.json"
SMOKE_PORT="${SMOKE_PORT:-3000}"
SMOKE_STORE="${SMOKE_STORE:-memory}"

cd "$ROOT_DIR"

QUEUEFLOW_STORE="$SMOKE_STORE" npm run dev -- --port "$SMOKE_PORT" > "$LOG_FILE" 2>&1 &
DEV_PID=$!

cleanup() {
  if kill -0 "$DEV_PID" 2>/dev/null; then
    kill "$DEV_PID" || true
  fi
}

trap cleanup EXIT

READY=0
for _ in $(seq 1 30); do
  HTTP_STATUS="$(curl -s -o "$SLOTS_FILE" -w "%{http_code}" "http://localhost:${SMOKE_PORT}/api/slots" || true)"
  if [[ "$HTTP_STATUS" == "200" ]] && node -e "const fs=require('fs'); try { const payload=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); if (!Array.isArray(payload)) process.exit(1); } catch { process.exit(1); }" "$SLOTS_FILE"; then
    READY=1
    break
  fi
  sleep 1
done

if [[ "$READY" -ne 1 ]]; then
  echo "Smoke test failed: dev server did not become ready in time."
  exit 1
fi

SLOT_ID="$(node -e "const fs=require('fs'); const slots=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); process.stdout.write(slots[0]?.id || '');" "$SLOTS_FILE")"

if [[ -z "$SLOT_ID" ]]; then
  TODAY="$(date +%F)"
  CREATE_STATUS="$(curl -s -o /tmp/queueflow-test-slot.json -w "%{http_code}" -X POST "http://localhost:${SMOKE_PORT}/api/slots" \
    -H 'Content-Type: application/json' \
    -d "{\"time\":\"9:00 AM\",\"date\":\"$TODAY\",\"capacity\":6}")"

  if [[ "$CREATE_STATUS" != "201" ]]; then
    echo "Smoke test failed: unable to create a slot for testing."
    cat /tmp/queueflow-test-slot.json
    exit 1
  fi

  SLOT_ID="$(node -e "const fs=require('fs'); const payload=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); process.stdout.write(payload.id || '');" /tmp/queueflow-test-slot.json)"

  if [[ -z "$SLOT_ID" ]]; then
    echo "Smoke test failed: no slot ID returned after slot creation."
    exit 1
  fi
fi

HTTP_STATUS="$(curl -s -o "$BOOKING_FILE" -w "%{http_code}" -X POST "http://localhost:${SMOKE_PORT}/api/bookings" \
  -H 'Content-Type: application/json' \
  -d "{\"slotId\":\"$SLOT_ID\",\"firstName\":\"Smoke\",\"lastName\":\"Test\",\"email\":\"smoke@example.com\",\"phoneNumber\":\"+15551234567\",\"partySize\":1}")"

if [[ "$HTTP_STATUS" != "201" ]]; then
  echo "Smoke test failed: expected HTTP 201 but got $HTTP_STATUS"
  echo "Response body:"
  cat "$BOOKING_FILE"
  exit 1
fi

node -e "const fs=require('fs'); const payload=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); if(!payload.booking?.id || !payload.booking?.phoneNumber || !payload.slot?.id){ process.exit(1); }" "$BOOKING_FILE"

echo "Smoke test passed: booking API flow returned HTTP 201 with valid payload."