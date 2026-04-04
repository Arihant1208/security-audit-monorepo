# Phase 3 — Attack Surface Mapping

## Objective

Enumerate every entry point, interface, and component that an attacker could target. The attack surface is the sum of all points where an attacker can try to interact with the system.

## Attack Surface Categories

### 3.1 Network Attack Surface

- [ ] Public IP addresses and DNS records
- [ ] Open ports and services
- [ ] TLS/SSL endpoints and certificate configuration
- [ ] Load balancer and CDN endpoints
- [ ] VPN and remote access endpoints
- [ ] DNS zone configuration

### 3.2 Web Application Attack Surface

- [ ] All HTTP endpoints (routes, methods)
- [ ] Form inputs and file upload handlers
- [ ] URL parameters and path variables
- [ ] Cookie and session handling
- [ ] WebSocket endpoints
- [ ] GraphQL endpoints and introspection
- [ ] CORS configuration
- [ ] Content Security Policy headers

### 3.3 API Attack Surface

- [ ] REST API endpoints (all methods: GET, POST, PUT, DELETE, PATCH)
- [ ] GraphQL queries, mutations, and subscriptions
- [ ] gRPC services and methods
- [ ] WebSocket message handlers
- [ ] API authentication mechanisms
- [ ] API versioning and deprecated endpoints
- [ ] API documentation exposure (Swagger, OpenAPI)
- [ ] Rate limiting and throttling configuration

### 3.4 Authentication Attack Surface

- [ ] Login endpoints
- [ ] Registration and account creation
- [ ] Password reset and recovery flows
- [ ] Multi-factor authentication implementation
- [ ] OAuth/OIDC redirect URIs
- [ ] SSO integration points
- [ ] Token generation and validation
- [ ] Session management

### 3.5 Infrastructure Attack Surface

- [ ] Cloud management consoles and APIs
- [ ] Container registries
- [ ] Kubernetes API server and dashboard
- [ ] Storage buckets and blob containers
- [ ] Database endpoints (direct access)
- [ ] Message queue interfaces
- [ ] Serverless function triggers
- [ ] SSH and remote management ports

### 3.6 CI/CD Attack Surface

- [ ] Source code repositories (public/private)
- [ ] CI/CD pipeline configuration files
- [ ] Build server interfaces
- [ ] Artifact repositories
- [ ] Deployment credentials and secrets
- [ ] Webhook endpoints
- [ ] Package registry accounts

### 3.7 Client-Side Attack Surface

- [ ] JavaScript bundles and source maps
- [ ] Local storage and session storage usage
- [ ] Client-side routing and deep links
- [ ] Mobile app endpoints and certificate pinning
- [ ] Browser extensions and plugins
- [ ] Embedded iframes and third-party scripts

### 3.8 Data Attack Surface

- [ ] Database access points
- [ ] File storage access (S3, Azure Blob, GCS)
- [ ] Backup storage locations
- [ ] Log aggregation endpoints
- [ ] Data export and reporting endpoints
- [ ] Data migration endpoints

### 3.9 Third-Party Attack Surface

- [ ] Third-party API integrations
- [ ] Webhook receivers
- [ ] OAuth provider integrations
- [ ] Payment gateway interfaces
- [ ] Analytics and tracking scripts
- [ ] Embedded widgets and iframes

## Attack Surface Mapping Techniques

| Technique | Purpose |
|-----------|---------|
| Port scanning | Discover open network services |
| Web crawling | Enumerate web application endpoints |
| API specification review | Map API endpoints from OpenAPI/Swagger docs |
| DNS enumeration | Discover subdomains and related services |
| Cloud resource inventory | List all cloud resources via provider APIs |
| Dependency analysis | Map third-party components and their interfaces |
| Configuration review | Identify exposed management interfaces |
| Code analysis | Find endpoints defined in source code |

## Attack Surface Scoring

Rate each surface area:

| Factor | Low (1) | Medium (2) | High (3) |
|--------|---------|------------|----------|
| Exposure | Internal only | Limited external | Fully public |
| Complexity | Requires auth + complex steps | Requires auth | No auth required |
| Data sensitivity | No sensitive data | Some PII | Financial/health/credentials |
| Historical targeting | No known attacks | Occasionally targeted | Frequently targeted |

**Surface Risk = Exposure × Complexity × Data Sensitivity × Historical Targeting**

## Outputs

1. **Attack surface inventory** — Complete map of all entry points
2. **Surface risk scores** — Each surface area rated by exposure and risk
3. **Priority targets** — Highest-risk surfaces to focus the audit on
4. **Entry point catalog** — Detailed documentation of each interface

## Next Phase

Proceed to → [Phase 4: Layered Security Audit](04-layered-security-audit.md)
