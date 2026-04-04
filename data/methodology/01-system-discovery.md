# Phase 1 — System Discovery

## Objective

Build a complete understanding of the target system before performing any security analysis. Poor discovery leads to blind spots in the audit.

## What to Identify

### 1.1 System Architecture

- [ ] Overall architecture pattern (monolithic, microservices, serverless, hybrid)
- [ ] Component inventory (services, databases, caches, queues, workers)
- [ ] Communication patterns (synchronous, asynchronous, event-driven)
- [ ] Data flow between components
- [ ] Architecture diagrams (if available)

### 1.2 Technology Stack

- [ ] Programming languages and versions
- [ ] Frameworks and libraries (with versions)
- [ ] Databases and data stores
- [ ] Message brokers and queues
- [ ] Caching layers
- [ ] Web servers and reverse proxies
- [ ] Operating systems

### 1.3 Infrastructure

- [ ] Cloud provider(s) and services used
- [ ] Container orchestration (Kubernetes, ECS, etc.)
- [ ] Serverless functions
- [ ] CDN and edge services
- [ ] DNS configuration
- [ ] Load balancers
- [ ] Hosting environment (shared, dedicated, hybrid)

### 1.4 Network Topology

- [ ] Network segments and zones
- [ ] Firewalls and security groups
- [ ] VPNs and private networks
- [ ] Public-facing endpoints
- [ ] Internal service mesh

### 1.5 External Dependencies

- [ ] Third-party APIs consumed
- [ ] SaaS services integrated
- [ ] Payment processors
- [ ] Authentication providers (OAuth, SAML, SSO)
- [ ] CDN and DNS providers
- [ ] Package registries and dependencies

### 1.6 Deployment Pipeline

- [ ] Source control system and branching strategy
- [ ] CI/CD platform and pipeline configuration
- [ ] Build process and artifact storage
- [ ] Deployment targets and strategies (blue-green, canary, rolling)
- [ ] Environment hierarchy (dev, staging, production)

### 1.7 Users and Access

- [ ] User roles and types
- [ ] Admin and privileged access paths
- [ ] Service accounts and machine identities
- [ ] API consumers (internal and external)
- [ ] Authentication mechanisms in use

### 1.8 Data Classification

- [ ] Types of data processed (PII, financial, health, credentials)
- [ ] Data storage locations
- [ ] Data retention policies
- [ ] Data flows across boundaries (geographic, organizational)
- [ ] Encryption at rest and in transit

## Discovery Techniques

| Technique | Description |
|-----------|-------------|
| Documentation review | Review architecture docs, runbooks, API specs |
| Stakeholder interviews | Talk to developers, ops, security teams |
| Code repository analysis | Examine repo structure, configs, dependencies |
| Infrastructure scanning | Query cloud APIs, scan networks |
| Traffic analysis | Review logs, monitor network traffic patterns |
| Configuration review | Examine deployment configs, IaC templates |

## Outputs

At the end of this phase, you should have:

1. **System inventory** — Complete list of components, services, and dependencies
2. **Architecture diagram** — Visual representation of the system
3. **Technology matrix** — Languages, frameworks, versions mapped to components
4. **Data flow diagram** — How data moves through the system
5. **Access map** — Who and what can access each component

## Next Phase

Proceed to → [Phase 2: Threat Modeling](02-threat-modeling.md)
