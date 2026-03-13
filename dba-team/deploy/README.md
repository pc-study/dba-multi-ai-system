# 云原生部署

支持Docker和Kubernetes部署。

## Docker部署

### 构建镜像

```bash
docker build -t dba-team:latest .
```

### 运行容器

```bash
docker run -d \
  --name dba-team \
  -p 8080:8080 \
  -v ~/.openclaw:/data \
  dba-team:latest
```

### Docker Compose

```yaml
version: '3.8'
services:
  dba-team:
    image: dba-team:latest
    ports:
      - "8080:8080"
    volumes:
      - ./config:/app/config
      - ./memory:/app/memory
    environment:
      - OPENCLAW_API_KEY=xxx
      - TZ=Asia/Shanghai
```

## Kubernetes部署

### Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dba-team
spec:
  replicas: 2
  selector:
    matchLabels:
      app: dba-team
  template:
    metadata:
      labels:
        app: dba-team
    spec:
      containers:
      - name: dba-team
        image: dba-team:latest
        ports:
        - containerPort: 8080
        env:
        - name: OPENCLAW_API_KEY
          valueFrom:
            secretKeyRef:
              name: dba-team-secret
              key: api-key
        volumeMounts:
        - name: config
          mountPath: /app/config
      volumes:
      - name: config
        configMap:
          name: dba-team-config
```

### Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: dba-team
spec:
  selector:
    app: dba-team
  ports:
  - port: 80
    targetPort: 8080
  type: ClusterIP
```

### Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: dba-team
spec:
  rules:
  - host: dba-team.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: dba-team
            port:
              number: 80
```

## Helm Chart

```bash
# 添加仓库
helm repo add dba-team https://charts.example.com

# 安装
helm install dba-team dba-team/dba-team \
  --set image.tag=latest \
  --set replicaCount=2
```

## 环境变量

| 变量 | 说明 | 必需 |
|------|------|------|
| OPENCLAW_API_KEY | OpenClaw API密钥 | ✅ |
| TZ | 时区 | ✅ |
| LOG_LEVEL | 日志级别 | ❌ |
| MAX_WORKERS | 最大并发数 | ❌ |

## 健康检查

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10
readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5
```

## 资源限制

```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```
