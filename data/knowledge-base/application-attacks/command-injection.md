# Command Injection

## Description

Command injection occurs when an application passes untrusted data to a system shell. The attacker can execute arbitrary operating system commands on the server, typically with the privileges of the application process.

## Affected Layer

Application Security, Infrastructure

## Attack Mechanism

1. Application constructs a system command using user-supplied input
2. Attacker injects shell metacharacters (`;`, `|`, `&&`, `||`, `` ` ``, `$()`)
3. Operating system shell interprets the injected characters as command separators
4. Attacker's commands execute on the server

**Example:**
```
Application code:  os.system("ping " + user_input)
Attacker input:    127.0.0.1; cat /etc/passwd
Executed command:  ping 127.0.0.1; cat /etc/passwd
```

## Detection Checks

- [ ] Does the application ever invoke system shell commands?
- [ ] Is user input passed to shell commands, system calls, or exec functions?
- [ ] Are shell metacharacters filtered or escaped?
- [ ] Could the functionality be achieved without shell invocation?
- [ ] Are exec/system/popen functions used with user-controlled arguments?
- [ ] Is the application running with minimal OS privileges?
- [ ] Are system call audit logs enabled?

## Impact

| Impact Area | Severity |
|-------------|----------|
| Remote code execution | Critical |
| Full server compromise | Critical |
| Data exfiltration | Critical |
| Lateral movement to other systems | Critical |
| Denial of service | High |

## Mitigation

| Control | Priority |
|---------|----------|
| Avoid calling OS commands directly — use language-native libraries | Critical |
| If OS commands are necessary, never include user input | Critical |
| If user input must be used, strictly whitelist allowed values | Critical |
| Use parameterized command execution (not shell interpretation) | Critical |
| Run application processes with minimal OS privileges | High |
| Implement application-level sandboxing | High |
| Deploy WAF rules for command injection patterns | Medium |
| Monitor system call activity for anomalies | Medium |

## References

- OWASP: A03:2021 Injection
- OWASP: Command Injection (owasp.org/www-community/attacks/Command_Injection)
- CWE-78: OS Command Injection
