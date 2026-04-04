# NIST Cybersecurity Framework (CSF) — Compliance Mapping

Maps NIST CSF functions and categories to this framework's audit components.

---

## IDENTIFY (ID)

### ID.AM — Asset Management

| Subcategory | Framework Coverage |
|-------------|-------------------|
| ID.AM-1: Physical devices inventoried | [Phase 1: System Discovery](../methodology/01-system-discovery.md) — Infrastructure |
| ID.AM-2: Software platforms inventoried | [Phase 1: System Discovery](../methodology/01-system-discovery.md) — Technology Stack |
| ID.AM-3: Data flows mapped | [DFD Guide](../threat-models/data-flow-diagram-guide.md) |
| ID.AM-5: Resources prioritized | [Risk Scoring](../risk-scoring/risk-scoring-model.md) — Business Context |

### ID.RA — Risk Assessment

| Subcategory | Framework Coverage |
|-------------|-------------------|
| ID.RA-1: Vulnerabilities identified | [Phase 5: Vulnerability Identification](../methodology/05-vulnerability-identification.md) |
| ID.RA-2: Threat intelligence used | [Knowledge Base](../knowledge-base/README.md) |
| ID.RA-3: Threats identified | [Phase 2: Threat Modeling](../methodology/02-threat-modeling.md) |
| ID.RA-4: Business impact determined | [Risk Scoring](../risk-scoring/risk-scoring-model.md) — Business Context |
| ID.RA-5: Risks assessed | [Phase 6: Risk Scoring](../methodology/06-risk-scoring.md) |

---

## PROTECT (PR)

### PR.AC — Access Control

| Subcategory | Framework Coverage |
|-------------|-------------------|
| PR.AC-1: Identity and credential management | [02 — Identity & Access Checklist](../audit-checklists/02-identity-access.md) |
| PR.AC-3: Remote access managed | [06 — Network Security](../audit-checklists/06-network-security.md) |
| PR.AC-4: Access permissions managed | [Access Control Guide](../remediation-guides/access-control.md) |
| PR.AC-5: Network integrity protected | [06 — Network Security](../audit-checklists/06-network-security.md) |
| PR.AC-7: Authentication implemented | [Authentication Hardening](../remediation-guides/authentication-hardening.md) |

### PR.DS — Data Security

| Subcategory | Framework Coverage |
|-------------|-------------------|
| PR.DS-1: Data at rest protected | [05 — Data Security](../audit-checklists/05-data-security.md) |
| PR.DS-2: Data in transit protected | [05 — Data Security](../audit-checklists/05-data-security.md), [06 — Network Security](../audit-checklists/06-network-security.md) |
| PR.DS-5: Data leak protections | [05 — Data Security](../audit-checklists/05-data-security.md) — DLP section |
| PR.DS-6: Integrity checking | [Cryptographic Best Practices](../remediation-guides/cryptographic-best-practices.md) |

### PR.IP — Protective Processes

| Subcategory | Framework Coverage |
|-------------|-------------------|
| PR.IP-1: Baseline configuration | [07 — Infrastructure](../audit-checklists/07-infrastructure-cloud.md) |
| PR.IP-2: System development lifecycle | [08 — DevOps](../audit-checklists/08-devops-cicd.md) |
| PR.IP-12: Vulnerability management | [09 — Supply Chain](../audit-checklists/09-supply-chain.md) |

### PR.MA — Maintenance

| Subcategory | Framework Coverage |
|-------------|-------------------|
| PR.MA-1: Maintenance performed | [Infrastructure Hardening](../remediation-guides/infrastructure-hardening.md) — Patch Management |

---

## DETECT (DE)

### DE.AE — Anomalies and Events

| Subcategory | Framework Coverage |
|-------------|-------------------|
| DE.AE-1: Baseline of operations established | [11 — Monitoring](../audit-checklists/11-monitoring-logging.md) |
| DE.AE-2: Events analyzed | [11 — Monitoring](../audit-checklists/11-monitoring-logging.md) — Alerting |
| DE.AE-3: Event data collected | [Logging and Monitoring Guide](../remediation-guides/logging-and-monitoring.md) |

### DE.CM — Continuous Monitoring

| Subcategory | Framework Coverage |
|-------------|-------------------|
| DE.CM-1: Network monitored | [06 — Network Security](../audit-checklists/06-network-security.md) |
| DE.CM-4: Malicious code detected | [09 — Supply Chain](../audit-checklists/09-supply-chain.md), [08 — DevOps](../audit-checklists/08-devops-cicd.md) |
| DE.CM-7: Unauthorized activity monitored | [11 — Monitoring](../audit-checklists/11-monitoring-logging.md) |
| DE.CM-8: Vulnerability scans performed | [Phase 5: Vulnerability Identification](../methodology/05-vulnerability-identification.md) |

---

## RESPOND (RS)

### RS.RP — Response Planning

| Subcategory | Framework Coverage |
|-------------|-------------------|
| RS.RP-1: Response plan executed | [Logging and Monitoring Guide](../remediation-guides/logging-and-monitoring.md) — Incident Response |

### RS.MI — Mitigation

| Subcategory | Framework Coverage |
|-------------|-------------------|
| RS.MI-1: Incidents contained | [Phase 7: Remediation](../methodology/07-remediation-planning.md) |
| RS.MI-2: Incidents mitigated | [Remediation Guides](../remediation-guides/README.md) |
| RS.MI-3: Vulnerabilities mitigated | [Phase 7: Remediation](../methodology/07-remediation-planning.md) |

---

## RECOVER (RC)

### RC.RP — Recovery Planning

| Subcategory | Framework Coverage |
|-------------|-------------------|
| RC.RP-1: Recovery plan executed | [Phase 7: Remediation](../methodology/07-remediation-planning.md) — Rollback Plan |

### RC.IM — Improvements

| Subcategory | Framework Coverage |
|-------------|-------------------|
| RC.IM-1: Recovery plans incorporate lessons learned | [Logging and Monitoring Guide](../remediation-guides/logging-and-monitoring.md) — Post-incident review |
