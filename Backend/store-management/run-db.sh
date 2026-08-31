#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Toolera — store-management PostgreSQL on Kubernetes
# Usage: bash run-db.sh [start|stop|push|setup|logs|connect|forward|status]
# ─────────────────────────────────────────────────────────────────────────────

set -e

# ── helpers ───────────────────────────────────────────────────────────────────
wait_for_port() {
  local port=$1
  echo ">>> Waiting for localhost:${port} to accept connections..."
  for i in $(seq 1 30); do
    if nc -z localhost "$port" 2>/dev/null; then
      echo "   ✅ Port ${port} is open."
      return 0
    fi
    sleep 1
  done
  echo "   ⚠️  Timed out waiting for port ${port}."
  return 1
}

DB_NAME="${SM_DB_NAME:-toolera_store_management_db}"
DB_USER="${SM_DB_USER:-postgres}"
DB_PASS="${SM_DB_PASS:?SM_DB_PASS is required}"
DB_PORT="${SM_DB_PORT:-5433}"  # local port — store-management (business uses 5434)
STATEFULSET="store-management-postgres"
SERVICE="store-management-postgres"
SECRET="toolera-store-management-db-secret"
PVC="pgdata-store-management-postgres-0"

ACTION=${1:-start}

case "$ACTION" in

  # ── START ──────────────────────────────────────────────────────────────────
  start)
    echo ">>> Deploying Toolera store-management PostgreSQL to Kubernetes..."

    kubectl apply -f - <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: ${SECRET}
stringData:
  POSTGRES_USER: "${DB_USER}"
  POSTGRES_PASSWORD: "${DB_PASS}"
  POSTGRES_DB: "${DB_NAME}"
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: ${STATEFULSET}
spec:
  serviceName: ${STATEFULSET}
  replicas: 1
  selector:
    matchLabels:
      app: ${STATEFULSET}
  template:
    metadata:
      labels:
        app: ${STATEFULSET}
    spec:
      containers:
        - name: postgres
          image: postgres:16
          envFrom:
            - secretRef:
                name: ${SECRET}
          ports:
            - containerPort: 5432
          volumeMounts:
            - name: pgdata
              mountPath: /var/lib/postgresql/data
          readinessProbe:
            exec:
              command: [pg_isready, -U, "${DB_USER}", -d, "${DB_NAME}"]
            initialDelaySeconds: 5
            periodSeconds: 5
  volumeClaimTemplates:
    - metadata:
        name: pgdata
      spec:
        accessModes: [ReadWriteOnce]
        resources:
          requests:
            storage: 5Gi
---
apiVersion: v1
kind: Service
metadata:
  name: ${SERVICE}
spec:
  selector:
    app: ${STATEFULSET}
  ports:
    - port: 5432
      targetPort: 5432
EOF

    echo ">>> Waiting for pod to be ready..."
    kubectl wait pod \
      -l app=${STATEFULSET} \
      --for=condition=Ready \
      --timeout=120s

    echo ""
    echo "✅ store-management DB is ready!"
    echo ""
    echo "   Internal k8s URL : postgresql://${DB_USER}:${DB_PASS}@${SERVICE}:5432/${DB_NAME}"
    echo "   Local URL        : postgresql://${DB_USER}:${DB_PASS}@localhost:${DB_PORT}/${DB_NAME}"
    echo ""
    echo ">>> Starting port-forward on localhost:${DB_PORT}..."
    echo ">>> Press Ctrl+C to stop port-forward (DB keeps running in k8s)"
    echo ""
    kubectl port-forward svc/${SERVICE} ${DB_PORT}:5432
    ;;

  # ── STOP ───────────────────────────────────────────────────────────────────
  stop)
    echo ">>> Removing store-management PostgreSQL from Kubernetes..."
    kubectl delete statefulset ${STATEFULSET} --ignore-not-found
    kubectl delete service     ${SERVICE}     --ignore-not-found
    kubectl delete secret      ${SECRET}      --ignore-not-found
    kubectl delete pvc         ${PVC}         --ignore-not-found
    echo "✅ Done."
    ;;

  # ── PUSH (prisma db push via port-forward) ─────────────────────────────────
  push)
    echo ">>> Starting port-forward in background on localhost:${DB_PORT}..."
    kubectl port-forward svc/${SERVICE} ${DB_PORT}:5432 &
    PF_PID=$!
    trap "kill $PF_PID 2>/dev/null" EXIT

    wait_for_port ${DB_PORT}

    echo ">>> Running drizzle-kit push..."
    DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:${DB_PORT}/${DB_NAME}" \
      npm run db:push

    echo ""
    echo ">>> Verifying tables:"
    kubectl exec ${STATEFULSET}-0 -- \
      psql -U ${DB_USER} -d ${DB_NAME} -c "\dt public.*"

    echo ""
    echo "✅ Push complete."
    ;;

  # ── MIGRATE (drizzle-kit migrate — apply generated SQL migrations) ────────
  migrate)
    echo ">>> Starting port-forward in background on localhost:${DB_PORT}..."
    kubectl port-forward svc/${SERVICE} ${DB_PORT}:5432 &
    PF_PID=$!
    trap "kill $PF_PID 2>/dev/null" EXIT

    wait_for_port ${DB_PORT}

    echo ">>> Running drizzle-kit migrate..."
    DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:${DB_PORT}/${DB_NAME}" \
      npm run db:migrate

    echo "✅ Migrations applied."
    ;;

  # ── SETUP (first-time: start + push) ──────────────────────────────────────
  setup)
    echo ">>> [1/3] Deploying store-management PostgreSQL..."
    bash "$0" start &

    wait_for_port ${DB_PORT}

    echo ""
    echo ">>> [2/3] Pushing Drizzle schema..."
    DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:${DB_PORT}/${DB_NAME}" \
      npm run db:push

    echo ""
    echo ">>> [3/3] Tables in DB:"
    kubectl exec ${STATEFULSET}-0 -- \
      psql -U ${DB_USER} -d ${DB_NAME} -c "\dt public.*"

    echo ""
    echo "✅ Setup complete! Port-forward is running on localhost:${DB_PORT}."
    echo "   Run your server: npm run dev"
    wait
    ;;

  # ── SEED ───────────────────────────────────────────────────────────────────
  seed)
    echo ">>> Starting port-forward in background on localhost:${DB_PORT}..."
    kubectl port-forward svc/${SERVICE} ${DB_PORT}:5432 &
    PF_PID=$!
    trap "kill $PF_PID 2>/dev/null" EXIT

    wait_for_port ${DB_PORT}

    echo ">>> Running db seed..."
    DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:${DB_PORT}/${DB_NAME}" \
      npm run db:seed

    echo "✅ Seed complete."
    ;;

  # ── LOGS ───────────────────────────────────────────────────────────────────
  logs)
    kubectl logs -l app=${STATEFULSET} --follow
    ;;

  # ── CONNECT (psql shell inside pod) ────────────────────────────────────────
  connect)
    echo ">>> Opening psql shell inside the pod..."
    kubectl exec -it ${STATEFULSET}-0 -- \
      psql -U ${DB_USER} -d ${DB_NAME}
    ;;

  # ── FORWARD (port-forward only, DB already running) ────────────────────────
  forward)
    echo ">>> Port-forwarding localhost:${DB_PORT} → k8s ${SERVICE}:5432"
    kubectl port-forward svc/${SERVICE} ${DB_PORT}:5432
    ;;

  # ── STATUS ─────────────────────────────────────────────────────────────────
  status)
    echo ">>> StatefulSet:"
    kubectl get statefulset ${STATEFULSET}
    echo ""
    echo ">>> Pod:"
    kubectl get pod -l app=${STATEFULSET}
    echo ""
    echo ">>> PVC:"
    kubectl get pvc ${PVC}
    echo ""
    echo ">>> Service:"
    kubectl get service ${SERVICE}
    ;;

  *)
    cat <<HELP
Usage: bash run-db.sh [command]

Commands:
  start    Deploy PostgreSQL to Kubernetes (includes port-forward)
  stop     Stop and remove all resources (PVC deleted — data lost)
  push     Sync schema via drizzle-kit push (dev)
  migrate  Apply SQL migrations via drizzle-kit migrate (prod)
  setup    One-time init: deploy + push schema
  seed     Run prisma db seed
  logs     Watch PostgreSQL logs
  connect  Open psql shell inside pod
  forward  Port-forward localhost:${DB_PORT} (DB must already be running)
  status   Show pod/pvc/service status

Examples:
  bash run-db.sh start       # Deploy and start port-forward
  bash run-db.sh push        # Sync Prisma schema (DB must be running)
  bash run-db.sh forward     # Port-forward for local development
  bash run-db.sh migrate     # Run production migrations

Environment:
  DB_PORT:     ${DB_PORT}
  DB_NAME:     ${DB_NAME}
  STATEFULSET: ${STATEFULSET}
HELP
    ;;

esac
