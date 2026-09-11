#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# toolera-server — PostgreSQL on Kubernetes
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

DB_NAME="toolera_db"
DB_USER="postgres"
DB_PASS="toolera_pass"
DB_PORT="5452"            # local port (maps to k8s 5432)
STATEFULSET="toolera-postgres"
SERVICE="toolera-postgres"
SECRET="toolera-db-secret"
PVC="pgdata-toolera-postgres-0"
SCHEMA="toolera"

ACTION=${1:-start}

case "$ACTION" in

  # ── START ──────────────────────────────────────────────────────────────────
  start)
    echo ">>> Deploying Toolera PostgreSQL to Kubernetes..."

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
    echo "✅ Toolera DB is ready!"

    echo ">>> Ensuring '${SCHEMA}' schema exists..."
    kubectl exec ${STATEFULSET}-0 -- \
      psql -U ${DB_USER} -d ${DB_NAME} -c "CREATE SCHEMA IF NOT EXISTS ${SCHEMA};" \
      && echo "   ✅ Schema '${SCHEMA}' is ready." \
      || echo "   ⚠️  Could not create schema (may already exist — that's fine)."

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
    echo ">>> Removing Toolera PostgreSQL from Kubernetes..."
    kubectl delete statefulset ${STATEFULSET} --ignore-not-found
    kubectl delete service     ${SERVICE}     --ignore-not-found
    kubectl delete secret      ${SECRET}      --ignore-not-found
    kubectl delete pvc         ${PVC}         --ignore-not-found
    echo "✅ Done."
    ;;

  # ── PUSH (drizzle-kit push via port-forward) ───────────────────────────────
  push)
    echo ">>> Starting port-forward in background on localhost:${DB_PORT}..."
    kubectl port-forward svc/${SERVICE} ${DB_PORT}:5432 &
    PF_PID=$!
    trap "kill $PF_PID 2>/dev/null" EXIT

    wait_for_port ${DB_PORT}

    echo ">>> Running drizzle-kit push..."
    DATABASE_WRITE_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:${DB_PORT}/${DB_NAME}" \
      npx drizzle-kit push || true

    echo ""
    echo ">>> Verifying tables:"
    kubectl exec ${STATEFULSET}-0 -- \
      psql -U ${DB_USER} -d ${DB_NAME} -c "\dt ${SCHEMA}.*"

    echo ""
    echo "✅ Push complete."
    ;;

  # ── SETUP (first-time: start + push, then keep forward running) ───────────
  setup)
    echo ">>> [1/3] Deploying Toolera PostgreSQL..."
    bash "$0" start &

    wait_for_port ${DB_PORT}

    echo ""
    echo ">>> [2/3] Pushing Drizzle schema..."
    DATABASE_WRITE_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:${DB_PORT}/${DB_NAME}" \
      npx drizzle-kit push || true

    echo ""
    echo ">>> [3/3] Tables in DB:"
    kubectl exec ${STATEFULSET}-0 -- \
      psql -U ${DB_USER} -d ${DB_NAME} -c "\dt ${SCHEMA}.*"

    echo ""
    echo "✅ Setup complete! Port-forward is running on localhost:${DB_PORT}."
    echo "   Run your server: npm run dev"
    wait
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
    echo ">>> Pods:"
    kubectl get pod -l app=${STATEFULSET}
    echo ""
    echo ">>> Service:"
    kubectl get svc ${SERVICE}
    ;;

  *)
    echo "Usage: bash run-db.sh [start|stop|push|setup|logs|connect|forward|status]"
    exit 1
    ;;
esac
