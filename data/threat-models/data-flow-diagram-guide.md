# Data Flow Diagram (DFD) Guide

Data Flow Diagrams are the foundation of threat modeling. They visualize how data moves through the system and where trust boundaries exist.

## DFD Elements

| Element | Symbol | Description |
|---------|--------|-------------|
| **External Entity** | Rectangle | Users, third-party systems, external APIs |
| **Process** | Circle / Rounded rectangle | Components that transform data |
| **Data Store** | Parallel lines | Databases, file systems, caches |
| **Data Flow** | Arrow | Movement of data between elements |
| **Trust Boundary** | Dashed line | Where privilege or trust levels change |

## DFD Levels

### Level 0 — Context Diagram

Shows the entire system as a single process with external entities.

```
                    ┌─────────────────────────────────┐
                    │         Trust Boundary           │
 ┌──────────┐      │    ┌───────────────────┐        │     ┌──────────┐
 │   User   │─────►│    │    Application    │        │────►│ 3rd Party│
 │ (Browser)│◄─────│    │     System        │        │◄────│   API    │
 └──────────┘      │    └───────────────────┘        │     └──────────┘
                    └─────────────────────────────────┘
```

### Level 1 — System Decomposition

Breaks the system into major components with data flows.

```
 ┌──────┐     HTTPS      ┌──────────┐    SQL       ┌──────────┐
 │ User │──────────────►  │ Web App  │────────────► │ Database │
 └──────┘                 └──────────┘              └──────────┘
                               │
                               │ REST API
                               ▼
                          ┌──────────┐    S3 API    ┌──────────┐
                          │ API Svc  │────────────► │ Storage  │
                          └──────────┘              └──────────┘
```

### Level 2 — Component Detail

Detailed view of a specific component showing internal processing.

## How to Create a DFD

### Step 1: Identify External Entities

List all actors that interact with the system:
- End users (by role)
- Admin users
- Third-party APIs
- Partner systems
- CI/CD pipeline
- Monitoring systems

### Step 2: Identify Processes

List all components that process data:
- Web application
- API gateway
- Authentication service
- Business logic services
- Background workers
- Notification service

### Step 3: Identify Data Stores

List all places data is persisted:
- Primary database
- Cache (Redis, Memcached)
- File storage (S3, Blob)
- Search index (Elasticsearch)
- Message queue
- Session store

### Step 4: Map Data Flows

For each flow, document:
- Source → Destination
- Data type (credentials, PII, public)
- Protocol (HTTPS, gRPC, SQL)
- Authentication method

### Step 5: Draw Trust Boundaries

Draw boundaries between:
- Internet ↔ DMZ
- DMZ ↔ Application tier
- Application tier ↔ Data tier
- Your infrastructure ↔ Third-party services
- User context ↔ Admin context

## Threat Identification Using DFDs

For each element and data flow, apply STRIDE:

| DFD Element | Most Relevant STRIDE Threats |
|-------------|------------------------------|
| External Entity | Spoofing |
| Process | Spoofing, Tampering, Repudiation, Info Disclosure, DoS, Elevation of Privilege |
| Data Store | Tampering, Information Disclosure, DoS |
| Data Flow | Tampering, Information Disclosure, DoS |
| Trust Boundary | All STRIDE categories (highest concentration of threats) |

## Example: E-Commerce DFD with Threats

```
                  Trust Boundary: Internet
 ┌──────────┐    ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─    ┌──────────────┐
 │ Customer │ ──── HTTPS ──────────────────────► │  Web Server  │
 │ Browser  │ ◄─── (TLS 1.3) ─────────────────  │  (Nginx)     │
 └──────────┘    ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─    └──────┬───────┘
    [S][T]           [T][I][D]                          │
                                                        │ Internal API
                  Trust Boundary: App Tier               │
                  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─           ▼
                                                 ┌──────────────┐
                                                 │  App Server  │
                                                 │  (Backend)   │
                                                 └──────┬───────┘
                                                        │
                  Trust Boundary: Data Tier              │ SQL (TLS)
                  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─           ▼
                                                 ┌──────────────┐
                                                 │   Database   │
                                                 │  (PostgreSQL)│
                                                 └──────────────┘
                                                    [T][I][D]
```

Where: [S]=Spoofing, [T]=Tampering, [I]=Info Disclosure, [D]=DoS

## Output

The completed DFD should feed directly into the [STRIDE Analysis Template](stride-template.md) — one STRIDE analysis per component identified in the DFD.
