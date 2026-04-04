# SQL Injection

## Description

SQL injection occurs when untrusted data is sent to an interpreter as part of a command or query. The attacker's hostile data tricks the interpreter into executing unintended commands or accessing data without authorization.

## Affected Layer

Application Security, Data Security

## Attack Mechanism

1. Attacker identifies an input field that constructs SQL queries
2. Attacker crafts input containing SQL syntax (e.g., `' OR 1=1 --`)
3. Application concatenates attacker input into SQL query string
4. Database executes the modified query
5. Attacker extracts data, modifies data, or executes administrative operations

**Variants:**
- **Classic SQLi** — Direct injection in WHERE clauses
- **Blind SQLi** — No direct output; inferred from application behavior or timing
- **Union-based SQLi** — Uses UNION to combine results from additional queries
- **Second-order SQLi** — Payload stored first, executed later in a different query
- **Out-of-band SQLi** — Uses DNS or HTTP requests to exfiltrate data

## Detection Checks

- [ ] Are parameterized queries/prepared statements used for all database operations?
- [ ] Is an ORM used consistently (and not bypassed with raw queries)?
- [ ] Is user input ever concatenated into SQL strings?
- [ ] Are stored procedures safe from injection within their logic?
- [ ] Is input validated against expected types/patterns before use?
- [ ] Are database errors suppressed from user-facing responses?
- [ ] Does the database user have minimal required privileges?
- [ ] Is there a Web Application Firewall (WAF) with SQL injection rules?

## Impact

| Impact Area | Severity |
|-------------|----------|
| Full database read access | Critical |
| Data modification or deletion | Critical |
| Authentication bypass | Critical |
| Remote code execution (via xp_cmdshell, etc.) | Critical |
| Data exfiltration | Critical |

## Real-World Examples

- Login bypass using `admin' --` in username field
- Data exfiltration from e-commerce database via search parameter
- Blind SQL injection in sort parameter extracting data character by character

## Mitigation

| Control | Priority |
|---------|----------|
| Use parameterized queries / prepared statements exclusively | Critical |
| Use ORM query builders instead of raw SQL | Critical |
| Apply input validation (whitelist expected characters/patterns) | High |
| Enforce least privilege on database accounts | High |
| Suppress database error details in responses | High |
| Deploy WAF with SQL injection detection rules | Medium |
| Conduct regular SAST scanning for injection patterns | Medium |
| Implement query logging and anomaly detection | Medium |

## References

- OWASP: A03:2021 Injection
- OWASP: SQL Injection (owasp.org/www-community/attacks/SQL_Injection)
- CWE-89: SQL Injection
