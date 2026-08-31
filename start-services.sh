#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Toolera — start both backend services with CNPG port-forwards
# Usage: bash start-services.sh
#
# Required env vars (set once, or export before running):
#   BIZ_DB_PASS   — business DB password
#   SM_DB_PASS    — store-management DB password
# ─────────────────────────────────────────────────────────────────────────────

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

# ── credentials ───────────────────────────────────────────────────────────────
BIZ_DB_PASS="${BIZ_DB_PASS:?BIZ_DB_PASS is required (business DB password)}"
SM_DB_PASS="${SM_DB_PASS:?SM_DB_PASS  is required (store-management DB password)}"

# ── Redis via Docker ──────────────────────────────────────────────────────────
REDIS_CONTAINER="redis-dev"

# ── colours ───────────────────────────────────────────────────────────────────
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${CYAN}[start-services]${NC} $*"; }
ok()   { echo -e "${GREEN}[start-services]${NC} $*"; }
warn() { echo -e "${YELLOW}[start-services]${NC} $*"; }

# ── cleanup on exit ───────────────────────────────────────────────────────────
PIDS=()
cleanup() {
  echo ""
  warn "Shutting down all processes..."
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null
  warn "All stopped. CNPG clusters still running in Kubernetes."
  exit 0
}
trap cleanup SIGINT SIGTERM

# ── helper: wait for port ─────────────────────────────────────────────────────
wait_for_port() {
  local label=$1 port=$2
  log "Waiting for ${label} on localhost:${port}..."
  for i in $(seq 1 30); do
    if nc -z localhost "$port" 2>/dev/null; then
      ok "${label} is up on localhost:${port}"
      return 0
    fi
    sleep 1
  done
  echo -e "${RED}[start-services] Timeout waiting for ${label} on localhost:${port}${NC}"
  return 1
}

# ── helper: ensure CNPG cluster is running, start it if not ──────────────────
ensure_cluster() {
  local cluster=$1 script=$2 pass_var=$3 pass_val=$4
  if kubectl get cluster "$cluster" &>/dev/null; then
    ok "CNPG cluster '${cluster}' already running."
  else
    warn "CNPG cluster '${cluster}' not found — starting it now..."
    export "$pass_var"="$pass_val"
    bash "$script" start &
    PIDS+=($!)
  fi
}

# ── helper: wait for CNPG cluster ready ──────────────────────────────────────
wait_for_cluster() {
  local cluster=$1
  log "Waiting for cluster '${cluster}' to be Ready..."
  for i in $(seq 1 60); do
    STATUS=$(kubectl get cluster "$cluster" -o jsonpath='{.status.readyInstances}' 2>/dev/null || echo "0")
    if [ "$STATUS" -ge 1 ] 2>/dev/null; then
      ok "Cluster '${cluster}' is Ready."
      return 0
    fi
    sleep 5
  done
  echo -e "${RED}[start-services] Timeout waiting for cluster '${cluster}'${NC}"
  return 1
}

# ─────────────────────────────────────────────────────────────────────────────
log "Checking Redis..."
if docker inspect "$REDIS_CONTAINER" &>/dev/null; then
  STATUS=$(docker inspect -f '{{.State.Status}}' "$REDIS_CONTAINER" 2>/dev/null)
  if [ "$STATUS" != "running" ]; then
    log "Starting existing Redis container..."
    docker start "$REDIS_CONTAINER"
  else
    ok "Redis container '${REDIS_CONTAINER}' already running."
  fi
else
  log "Creating Redis 7 container on port 6379..."
  docker run -d --name "$REDIS_CONTAINER" -p 6379:6379 redis:7-alpine
fi
wait_for_port "Redis" 6379
ok "Redis ready."
echo ""

# ─────────────────────────────────────────────────────────────────────────────
log "Checking CNPG clusters..."
ensure_cluster business-postgres \
  "$ROOT/Backend/business/run-db.sh" BIZ_DB_PASS "$BIZ_DB_PASS"
ensure_cluster store-management-postgres \
  "$ROOT/Backend/store-management/run-db.sh" SM_DB_PASS "$SM_DB_PASS"

# wait for both clusters to have at least 1 ready instance
wait_for_cluster business-postgres
wait_for_cluster store-management-postgres

# ── business port-forwards ────────────────────────────────────────────────────
log "Starting business DB port-forwards (primary: 5434, replicas: 5444)..."
kubectl port-forward svc/business-postgres-rw 5434:5432 &>/dev/null &
PIDS+=($!)
kubectl port-forward svc/business-postgres-ro 5444:5432 &>/dev/null &
PIDS+=($!)

# ── store-management port-forwards ────────────────────────────────────────────
log "Starting store-management DB port-forwards (primary: 5433, replicas: 5443)..."
kubectl port-forward svc/store-management-postgres-rw 5433:5432 &>/dev/null &
PIDS+=($!)
kubectl port-forward svc/store-management-postgres-ro 5443:5432 &>/dev/null &
PIDS+=($!)

# ── wait for DB ports to be ready ────────────────────────────────────────────
wait_for_port "business primary"           5434
wait_for_port "business replicas"          5444
wait_for_port "store-management primary"   5433
wait_for_port "store-management replicas"  5443

echo ""
ok "All databases ready."
echo ""

# ── start business service ────────────────────────────────────────────────────
log "Starting business service on port 5002..."
(
  cd "$ROOT/Backend/business"
  npm run dev 2>&1 | sed "s/^/[business]  /"
) &
PIDS+=($!)

# ── start store-management service ───────────────────────────────────────────
log "Starting store-management service on port 5001..."
(
  cd "$ROOT/Backend/store-management"
  npm run dev 2>&1 | sed "s/^/[store-mgmt] /"
) &
PIDS+=($!)

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ✅  All services running${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "  business         →  http://localhost:5002"
echo "  store-management →  http://localhost:5001"
echo ""
echo "  business DB (rw) →  localhost:5434"
echo "  business DB (ro) →  localhost:5444"
echo "  store-mgmt DB (rw) →  localhost:5433"
echo "  store-mgmt DB (ro) →  localhost:5443"
echo ""
echo "  Press Ctrl+C to stop all services"
echo ""

# ── wait forever (Ctrl+C triggers cleanup) ────────────────────────────────────
wait
