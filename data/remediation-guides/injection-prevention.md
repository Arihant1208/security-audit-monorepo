# Injection Prevention — Remediation Guide

## SQL Injection

### Root Cause
User input concatenated directly into SQL query strings.

### Fix: Use Parameterized Queries

**Instead of:**
```
-- VULNERABLE
query = "SELECT * FROM users WHERE name = '" + userInput + "'"
```

**Use:**
```sql
-- SAFE: Parameterized query
SELECT * FROM users WHERE name = @username
```

**Language examples:**

Python (psycopg2):
```python
cursor.execute("SELECT * FROM users WHERE name = %s", (user_input,))
```

Node.js (pg):
```javascript
const result = await pool.query('SELECT * FROM users WHERE name = $1', [userInput]);
```

Java (PreparedStatement):
```java
PreparedStatement stmt = conn.prepareStatement("SELECT * FROM users WHERE name = ?");
stmt.setString(1, userInput);
```

C# (SqlCommand):
```csharp
var cmd = new SqlCommand("SELECT * FROM users WHERE name = @name", conn);
cmd.Parameters.AddWithValue("@name", userInput);
```

### Additional Controls
- Use ORM query builders as primary data access pattern
- Apply input validation (whitelist allowed characters)
- Set database user to minimum required privileges
- Enable WAF SQL injection rules as defense-in-depth

---

## Command Injection

### Root Cause
User input passed to OS shell commands.

### Fix: Avoid Shell Commands

**Instead of:**
```python
# VULNERABLE
os.system("ping " + user_input)
```

**Use language-native libraries:**
```python
# SAFE: Use library instead of shell
import subprocess
# If shell is absolutely required, use array form (no shell interpretation)
subprocess.run(["ping", "-c", "1", validated_host], shell=False, check=True)
```

### If Shell Commands Are Unavoidable
1. Strictly whitelist allowed input values
2. Use array-form command execution (not shell string)
3. Never use `shell=True` or equivalent with user input
4. Validate input against a regex pattern

---

## LDAP Injection

### Root Cause
User input included in LDAP queries without encoding.

### Fix
- Use LDAP library functions that handle escaping
- Validate input against expected LDAP attribute value patterns
- Use parameterized LDAP queries where available

---

## Template Injection (SSTI)

### Root Cause
User input passed as part of a template (not as data within a template).

### Fix
- Never use user input as part of template code
- Pass user input as template variables only
- Use sandboxed template engines
- Disable dangerous template features in production

---

## General Injection Prevention Principles

1. **Separate code from data** — Never mix user input with commands/queries
2. **Parameterize everything** — Use the platform's parameterized API for all interpreters
3. **Validate input** — Whitelist expected format before processing
4. **Minimize privileges** — Run with least permissions so injection has limited impact
5. **Defense in depth** — WAF, monitoring, and logging as additional layers
