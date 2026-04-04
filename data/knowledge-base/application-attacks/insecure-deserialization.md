# Insecure Deserialization

## Description

Insecure deserialization occurs when an application deserializes data from untrusted sources without validation. Attackers can manipulate serialized objects to achieve remote code execution, privilege escalation, injection attacks, or replay attacks.

## Affected Layer

Application Security

## Attack Mechanism

1. Application accepts serialized objects from user input (cookies, API parameters, hidden fields)
2. Attacker modifies the serialized data to include malicious payloads
3. Application deserializes the modified data without validation
4. Malicious code executes during the deserialization process (via gadget chains or magic methods)

**Common formats exploited:** Java serialized objects, Python pickle, PHP serialize, .NET BinaryFormatter, YAML (unsafe loaders), XML

## Detection Checks

- [ ] Does the application deserialize data from untrusted sources?
- [ ] Are serialization formats with code execution capabilities used (pickle, Java serialization, BinaryFormatter)?
- [ ] Is deserialized data validated against a schema before use?
- [ ] Are integrity checks (HMAC, digital signatures) applied to serialized data?
- [ ] Is deserialization performed in a sandboxed/restricted environment?
- [ ] Are type constraints enforced during deserialization?
- [ ] Is the application using known-vulnerable deserialization libraries?

## Impact

| Impact Area | Severity |
|-------------|----------|
| Remote code execution | Critical |
| Privilege escalation | Critical |
| Data tampering | High |
| Denial of service | Medium |
| Authentication bypass | High |

## Mitigation

| Control | Priority |
|---------|----------|
| Avoid deserializing data from untrusted sources entirely | Critical |
| Use data-only formats (JSON, Protocol Buffers) instead of object serialization | Critical |
| Implement integrity checks (HMAC) on serialized data | High |
| Enforce strict type constraints during deserialization | High |
| Use safe deserialization APIs (e.g., `yaml.safe_load`, `json.loads`) | High |
| Run deserialization in isolated/sandboxed environments | Medium |
| Monitor deserialization operations for anomalies | Medium |

## References

- OWASP: A08:2021 Software and Data Integrity Failures
- CWE-502: Deserialization of Untrusted Data
