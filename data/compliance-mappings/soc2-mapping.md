# SOC 2 — Trust Service Criteria Mapping

Maps SOC 2 Trust Service Criteria to this framework's audit evidence sources.

---

## CC — Common Criteria (Security)

### CC1 — Control Environment

| Criteria | Framework Coverage | Evidence Source |
|----------|-------------------|----------------|
| CC1.1 | Organizational commitment to security | [01 — Architecture](../audit-checklists/01-architecture.md) |

### CC6 — Logical and Physical Access Controls

| Criteria | Description | Framework Coverage |
|----------|-------------|-------------------|
| CC6.1 | Logical access security | [02 — Identity & Access](../audit-checklists/02-identity-access.md) |
| CC6.2 | User authentication | [02 — Identity & Access](../audit-checklists/02-identity-access.md) — Authentication |
| CC6.3 | Authorization controls | [02 — Identity & Access](../audit-checklists/02-identity-access.md) — Authorization |
| CC6.6 | System boundaries security | [06 — Network Security](../audit-checklists/06-network-security.md), [01 — Architecture](../audit-checklists/01-architecture.md) |
| CC6.7 | Data transmission security | [05 — Data Security](../audit-checklists/05-data-security.md) — Encryption in transit |
| CC6.8 | Unauthorized software prevented | [09 — Supply Chain](../audit-checklists/09-supply-chain.md) |

### CC7 — System Operations

| Criteria | Description | Framework Coverage |
|----------|-------------|-------------------|
| CC7.1 | Detection of security events | [11 — Monitoring](../audit-checklists/11-monitoring-logging.md) — Security event logging |
| CC7.2 | Anomaly monitoring | [11 — Monitoring](../audit-checklists/11-monitoring-logging.md) — Alerting |
| CC7.3 | Security incident evaluation | [Logging Guide](../remediation-guides/logging-and-monitoring.md) — Incident Response |
| CC7.4 | Incident response | [Logging Guide](../remediation-guides/logging-and-monitoring.md) — Incident Response |
| CC7.5 | Incident recovery | [Phase 7: Remediation](../methodology/07-remediation-planning.md) |

### CC8 — Change Management

| Criteria | Description | Framework Coverage |
|----------|-------------|-------------------|
| CC8.1 | Change management process | [08 — DevOps](../audit-checklists/08-devops-cicd.md) — Pipeline security, Deployment |

### CC9 — Risk Mitigation

| Criteria | Description | Framework Coverage |
|----------|-------------|-------------------|
| CC9.1 | Risk identification and assessment | [Phase 6: Risk Scoring](../methodology/06-risk-scoring.md) |
| CC9.2 | Vendor risk management | [09 — Supply Chain](../audit-checklists/09-supply-chain.md) — Third-party integrations |

---

## Availability

| Criteria | Description | Framework Coverage |
|----------|-------------|-------------------|
| A1.1 | Processing capacity | [01 — Architecture](../audit-checklists/01-architecture.md) — Resilience, Scalability |
| A1.2 | Environmental protections | [07 — Infrastructure](../audit-checklists/07-infrastructure-cloud.md) |
| A1.3 | Recovery procedures | [Logging Guide](../remediation-guides/logging-and-monitoring.md) — Incident Response |

---

## Confidentiality

| Criteria | Description | Framework Coverage |
|----------|-------------|-------------------|
| C1.1 | Confidential information identified | [05 — Data Security](../audit-checklists/05-data-security.md) — Data classification |
| C1.2 | Confidential information disposed | [05 — Data Security](../audit-checklists/05-data-security.md) — Data retention |

---

## Processing Integrity

| Criteria | Description | Framework Coverage |
|----------|-------------|-------------------|
| PI1.1 | Accurate and complete processing | [12 — Business Logic](../audit-checklists/12-business-logic.md) — Data integrity |

---

## Privacy

| Criteria | Description | Framework Coverage |
|----------|-------------|-------------------|
| P1-P8 | Privacy criteria | [05 — Data Security](../audit-checklists/05-data-security.md) — Data classification, Access control, Retention |

---

## Audit Evidence Collection

For each SOC 2 criteria, collect:

1. **Policy documentation** — Written security policies
2. **Configuration evidence** — Screenshots/exports of security configurations
3. **Audit logs** — Samples of security event logs
4. **Access reviews** — Evidence of periodic access reviews
5. **Scan results** — Vulnerability and compliance scan reports
6. **Incident records** — Incident response documentation
7. **Change records** — Change management and deployment logs
