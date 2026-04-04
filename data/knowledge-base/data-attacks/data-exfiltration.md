# Data Exfiltration

## Description

Data exfiltration is the unauthorized transfer of data out of an organization. It is the end goal of many attacks, where stolen data is transmitted to an attacker-controlled location via network channels, physical devices, or covert channels.

## Affected Layer

Data Security

## Attack Mechanism

1. Attacker gains access to sensitive data (via injection, access control flaw, insider access)
2. Attacker transfers data out of the network via:
   - HTTP/HTTPS requests to external servers
   - DNS tunneling (encoding data in DNS queries)
   - Email with attachments
   - Cloud storage uploads
   - Steganography (data hidden in images/files)
   - USB/physical media
3. Data reaches attacker's infrastructure

## Detection Checks

- [ ] Is outbound traffic monitored for anomalous data transfers?
- [ ] Is DLP (Data Loss Prevention) implemented?
- [ ] Are database queries monitored for bulk data extraction?
- [ ] Is DNS query logging and analysis enabled?
- [ ] Are API responses sized appropriately (no bulk data dumps)?
- [ ] Is data classification applied to identify sensitive data locations?
- [ ] Are USB ports and physical media controlled?

## Impact

| Impact Area | Severity |
|-------------|----------|
| Data breach | Critical |
| Regulatory penalties | Critical |
| Intellectual property loss | High |
| Competitive disadvantage | High |
| Reputation damage | High |

## Mitigation

| Control | Priority |
|---------|----------|
| Implement DLP at network and endpoint levels | High |
| Monitor and alert on bulk data access patterns | High |
| Enforce query result size limits and pagination | High |
| Monitor outbound traffic for anomalies | High |
| Implement network segmentation for sensitive data | High |
| Use database activity monitoring | Medium |
| Monitor DNS queries for tunneling patterns | Medium |
| Encrypt sensitive data at rest (limits value if exfiltrated) | Medium |

## References

- CWE-200: Exposure of Sensitive Information
- OWASP: A01:2021 Broken Access Control
