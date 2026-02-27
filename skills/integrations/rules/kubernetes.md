---
title: 'Kubernetes Integration'
impact: HIGH
impactDescription: 'Without proper DNS policy configuration, pods bypass NextDNS filtering entirely'
type: capability
tags:
  - kubernetes
  - k8s
  - coredns
  - daemonset
  - dns policy
  - container
---

# Kubernetes integration

Deploy NextDNS CLI in a Kubernetes cluster as a node-level DNS proxy

## Overview

Running NextDNS in Kubernetes requires deploying the CLI as a `DaemonSet` so every node gets a local
DNS proxy. Pods then route DNS queries through the node-local NextDNS instance either via
`dnsPolicy: None` or by configuring CoreDNS as an upstream forwarder.

Two approaches are covered:

1. **DaemonSet + dnsPolicy per Pod** — pods explicitly use the node IP as their nameserver.
2. **CoreDNS Forwarder** — CoreDNS forwards all or specific queries to the node-local NextDNS
   daemon, requiring no pod-level changes.

## Correct usage

### Daemonset manifest

Deploy the NextDNS CLI on every node:

```yaml
# ✅ nextdns-daemonset.yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: nextdns
  namespace: kube-system
  labels:
    app: nextdns
spec:
  selector:
    matchLabels:
      app: nextdns
  template:
    metadata:
      labels:
        app: nextdns
    spec:
      hostNetwork: true
      dnsPolicy: ClusterFirstWithHostNet
      tolerations:
        - effect: NoSchedule
          operator: Exists
      containers:
        - name: nextdns
          image: nextdns/nextdns:latest
          args:
            - run
            - -profile
            - abc123
            - -listen
            - 127.0.0.1:5300
            - -report-client-info
          securityContext:
            capabilities:
              add: [NET_ADMIN]
          resources:
            requests:
              cpu: 10m
              memory: 32Mi
            limits:
              cpu: 100m
              memory: 64Mi
```

Apply:

```bash
kubectl apply -f nextdns-daemonset.yaml
```

### Pod-level DNS configuration

Point individual pods to the node-local NextDNS:

```yaml
# ✅ Pod spec with explicit NextDNS nameserver
apiVersion: v1
kind: Pod
metadata:
  name: my-app
spec:
  dnsPolicy: None
  dnsConfig:
    nameservers:
      - 127.0.0.1 # node-local NextDNS proxy
    searches:
      - default.svc.cluster.local
      - svc.cluster.local
      - cluster.local
    options:
      - name: ndots
        value: '5'
  containers:
    - name: my-app
      image: my-app:latest
```

### CoreDNS forwarder (cluster-wide)

Configure CoreDNS to forward all external queries through NextDNS:

```bash
# ✅ Edit CoreDNS ConfigMap
kubectl edit configmap coredns -n kube-system
```

Update the `Corefile`:

```text
# ✅ Forward all non-cluster traffic to node-local NextDNS
.:53 {
    errors
    health {
       lameduck 5s
    }
    ready
    kubernetes cluster.local in-addr.arpa ip6.arpa {
       pods insecure
       fallthrough in-addr.arpa ip6.arpa
       ttl 30
    }
    prometheus :9153
    forward . 127.0.0.1:5300 {
       max_concurrent 1000
    }
    cache 30
    loop
    reload
    loadbalance
}
```

Restart CoreDNS to apply:

```bash
kubectl rollout restart deployment coredns -n kube-system
```

## Do NOT Use

```yaml
# ❌ hostPort without hostNetwork — DNS on port 53 requires hostNetwork: true
spec:
  containers:
    - name: nextdns
      ports:
        - containerPort: 53
          hostPort: 53 # ❌ Unreliable without hostNetwork: true
```

```yaml
# ❌ Running as root without NET_ADMIN capability — service will fail to configure DNS
securityContext:
  runAsUser: 0 # ❌ Must also add NET_ADMIN capability
```

## Best practices

- **Use `127.0.0.1:5300`** instead of `:53` to avoid conflicts with existing node DNS services.
- **Always add `NET_ADMIN` capability**: NextDNS CLI needs it to configure system-level DNS.
- **Use `hostNetwork: true`**: Ensures the DaemonSet container shares the node network namespace.
- **Separate profiles per namespace**: Use `dnsPolicy: None` on pods that need a different NextDNS
  profile from the cluster default.
- **Monitor with `nextdns log`**: Exec into a DaemonSet pod to inspect DNS query logs.

## Troubleshooting

### Issue: pods cannot resolve external domains

**Symptoms**: DNS queries time out or return SERVFAIL after applying the CoreDNS forwarder.

**Solution**: Verify the DaemonSet pods are running and NextDNS is listening on the configured port:

```bash
# Check DaemonSet pod status
kubectl get pods -n kube-system -l app=nextdns

# Exec into a pod and test DNS resolution
kubectl exec -it <nextdns-pod> -n kube-system -- nextdns status

# Test from a pod
kubectl run dns-test --image=busybox --rm -it -- nslookup example.com 127.0.0.1
```

### Issue: coredns NOT forwarding after configmap update

**Symptoms**: Changes to the Corefile are not taking effect.

**Solution**: Force a CoreDNS rollout restart after ConfigMap changes:

```bash
kubectl rollout restart deployment coredns -n kube-system
kubectl rollout status deployment coredns -n kube-system
```

## Reference

- [NextDNS CLI GitHub](https://github.com/nextdns/nextdns)
- [Kubernetes DNS Configuration](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/)
- [CoreDNS Forwarder Plugin](https://coredns.io/plugins/forward/)
