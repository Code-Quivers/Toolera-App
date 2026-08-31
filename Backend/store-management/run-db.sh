#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Toolera — store-management PostgreSQL via CloudNativePG operator
# Usage: bash run-db.sh [start|stop|push|migrate|setup|seed|logs|connect|forward|status]
#
# Ports (local):
#   5433  →  store-management-postgres-rw (primary, read-write)
#   5443  →  store-management-postgres-ro (replicas, read-only)
# ─────────────────────────────────────────────────────────────────────────────

set -e

# ── helpers ───────────────────────────────────────────────────────────────────
wait_for_port() {
  local port=$1
  echo ">>> Waiting for localhost:${port}..."
  for i in $(seq 1 60); do
    if nc -z localhost "$port" 2>/dev/null; then
      echo "   ✅ Port ${port} is open."
      return 0
    fi
    sleep 2
  done
  echo "   ⚠️  Timed out waiting for port ${port}."
  return 1
}

ensure_cnpg() {
  if kubectl get crd clusters.postgresql.cnpg.io &>/dev/null; then
    echo ">>> CloudNativePG operator already installed."
    return
  fi
  echo ">>> Installing CloudNativePG operator..."
  kubectl apply --server-side \
    -f https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/release-1.25/releases/cnpg-1.25.0.yaml
  echo ">>> Waiting for CNPG webhook to be ready..."
  kubectl rollout status deployment/cnpg-controller-manager \
    -n cnpg-system --timeout=120s
}

# ── config ────────────────────────────────────────────────────────────────────
DB_NAME="${SM_DB_NAME:-toolera_store_management_db}"
DB_USER="${SM_DB_USER:-postgres}"
DB_PASS="${SM_DB_PASS:?SM_DB_PASS is required}"
DB_PORT_RW="${SM_DB_PORT:-5433}"      # primary  (read-write)
DB_PORT_RO="${SM_DB_PORT_RO:-5443}"   # replicas (read-only)
CLUSTER="store-management-postgres"
SECRET="toolera-store-management-db-secret"

ACTION=${1:-start}

case "$ACTION" in

  # ── START ──────────────────────────────────────────────────────────────────
  start)
    ensure_cnpg

    echo ">>> Creating credential secret..."
    kubectl apply -f - <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: ${SECRET}
type: kubernetes.io/basic-auth
stringData:
  username: "${DB_USER}"
  password: "${DB_PASS}"
EOF

    echo ">>> Deploying CNPG Cluster (1 primary + 2 replicas)..."
    kubectl apply -f - <<EOF
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: ${CLUSTER}
spec:
  instances: 3
  primaryUpdateStrategy: unsupervised

  superuserSecret:
    name: ${SECRET}

  bootstrap:
    initdb:
      database: "${DB_NAME}"
      owner: "${DB_USER}"
      secret:
        name: ${SECRET}

  storage:
    size: 5Gi

  resources:
    requests:
      memory: "256Mi"
      cpu: "100m"
    limits:
      memory: "512Mi"
      cpu: "500m"

  monitoring:
    enablePodMonitor: false
EOF

    echo ">>> Waiting for primary to be ready (up to 5 min)..."
    kubectl wait cluster/${CLUSTER} \
      --for=condition=Ready \
      --timeout=300s

    echo ""
    echo "✅ store-management DB cluster ready!"
    echo "   Primary  (rw) : ${CLUSTER}-rw:5432"
    echo "   Replicas (ro) : ${CLUSTER}-ro:5432"
    echo ""
    echo ">>> Starting port-forwards:"
    echo "    localhost:${DB_PORT_RW} → primary  (read-write)"
    echo "    localhost:${DB_PORT_RO} → replicas (read-only)"
    echo ">>> Press Ctrl+C to stop (cluster keeps running in k8s)"
    echo ""
    kubectl port-forward svc/${CLUSTER}-rw ${DB_PORT_RW}:5432 &
    PF_RW=$!
    kubectl port-forward svc/${CLUSTER}-ro ${DB_PORT_RO}:5432 &
    PF_RO=$!
    trap "kill $PF_RW $PF_RO 2>/dev/null" EXIT
    wait $PF_RW $PF_RO
    ;;

  # ── STOP ───────────────────────────────────────────────────────────────────
  stop)
    echo ">>> Removing store-management CNPG Cluster and secret..."
    kubectl delete cluster ${CLUSTER} --ignore-not-found
    kubectl delete secret  ${SECRET}  --ignore-not-found
    echo "✅ Done. (PVCs kept — data preserved)"
    echo "   To also delete data: kubectl delete pvc -l cnpg.io/cluster=${CLUSTER}"
    ;;

  # ── PUSH ───────────────────────────────────────────────────────────────────
  push)
    kubectl port-forward svc/${CLUSTER}-rw ${DB_PORT_RW}:5432 &
    PF_PID=$!
    trap "kill $PF_PID 2>/dev/null" EXIT
    wait_for_port ${DB_PORT_RW}

    echo ">>> Running drizzle-kit push..."
    DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:${DB_PORT_RW}/${DB_NAME}" \
      npm run db:push
    echo "✅ Push complete."
    ;;

  # ── MIGRATE ────────────────────────────────────────────────────────────────
  migrate)
    kubectl port-forward svc/${CLUSTER}-rw ${DB_PORT_RW}:5432 &
    PF_PID=$!
    trap "kill $PF_PID 2>/dev/null" EXIT
    wait_for_port ${DB_PORT_RW}

    echo ">>> Running drizzle-kit migrate..."
    DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:${DB_PORT_RW}/${DB_NAME}" \
      npm run db:migrate
    echo "✅ Migrations applied."
    ;;

  # ── SETUP ──────────────────────────────────────────────────────────────────
  setup)
    bash "$0" start &
    wait_for_port ${DB_PORT_RW}

    echo ">>> Pushing Drizzle schema..."
    DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:${DB_PORT_RW}/${DB_NAME}" \
      npm run db:push
    echo "✅ Setup complete. Run: npm run dev"
    wait
    ;;

  # ── SEED ───────────────────────────────────────────────────────────────────
  seed)
    kubectl port-forward svc/${CLUSTER}-rw ${DB_PORT_RW}:5432 &
    PF_PID=$!
    trap "kill $PF_PID 2>/dev/null" EXIT
    wait_for_port ${DB_PORT_RW}

    echo ">>> Running db seed..."
    DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:${DB_PORT_RW}/${DB_NAME}" \
      npm run db:seed
    echo "✅ Seed complete."
    ;;

  # ── LOGS ───────────────────────────────────────────────────────────────────
  logs)
    kubectl logs -l cnpg.io/cluster=${CLUSTER} --follow
    ;;

  # ── CONNECT ────────────────────────────────────────────────────────────────
  connect)
    echo ">>> Opening psql on primary pod..."
    PRIMARY=$(kubectl get pod -l cnpg.io/cluster=${CLUSTER},role=primary -o name | head -1)
    kubectl exec -it ${PRIMARY} -- psql -U ${DB_USER} -d ${DB_NAME}
    ;;

  # ── FORWARD ────────────────────────────────────────────────────────────────
  forward)
    echo ">>> Port-forwarding:"
    echo "    localhost:${DB_PORT_RW} → ${CLUSTER}-rw (primary)"
    echo "    localhost:${DB_PORT_RO} → ${CLUSTER}-ro (replicas)"
    kubectl port-forward svc/${CLUSTER}-rw ${DB_PORT_RW}:5432 &
    PF_RW=$!
    kubectl port-forward svc/${CLUSTER}-ro ${DB_PORT_RO}:5432 &
    PF_RO=$!
    trap "kill $PF_RW $PF_RO 2>/dev/null" EXIT
    wait $PF_RW $PF_RO
    ;;

  # ── STATUS ─────────────────────────────────────────────────────────────────
  status)
    echo ">>> CNPG Cluster:"
    kubectl get cluster ${CLUSTER}
    echo ""
    echo ">>> Pods:"
    kubectl get pod -l cnpg.io/cluster=${CLUSTER}
    echo ""
    echo ">>> Services:"
    kubectl get svc -l cnpg.io/cluster=${CLUSTER}
    ;;

  *)
    cat <<HELP
Usage: bash run-db.sh [command]

Commands:
  start    Install CNPG operator + deploy 3-instance cluster (1 primary + 2 replicas)
  stop     Delete cluster and secret (PVCs kept; data preserved)
  push     Sync schema via drizzle-kit push
  migrate  Apply SQL migrations via drizzle-kit migrate
  setup    One-time init: start + push schema
  seed     Run db seed
  logs     Stream logs from all cluster pods
  connect  Open psql shell on primary pod
  forward  Port-forward primary + replica services (cluster must be running)
  status   Show cluster / pod / service status

Ports:
  ${DB_PORT_RW}  →  ${CLUSTER}-rw  (primary, read-write)
  ${DB_PORT_RO}  →  ${CLUSTER}-ro  (replicas, read-only)

Environment:
  SM_DB_PASS    required — Postgres password
  SM_DB_NAME    default: toolera_store_management_db
  SM_DB_USER    default: postgres
  SM_DB_PORT    default: 5433  (primary port-forward)
  SM_DB_PORT_RO default: 5443  (replica port-forward)

Example:
  SM_DB_PASS=secret bash run-db.sh start
HELP
    ;;

esac
