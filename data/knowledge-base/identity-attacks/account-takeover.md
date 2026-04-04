# Account Takeover

## Description

Account takeover (ATO) is the end result of various attack techniques where an attacker gains full control of a user's account. It is an outcome that can result from credential stuffing, phishing, session hijacking, social engineering, or exploiting password recovery flaws.

## Affected Layer

Identity & Access Management

## Attack Mechanism

### Via Password Recovery Flaws
1. Attacker initiates password reset for the target account
2. Attacker exploits weaknesses in the recovery flow:
   - Predictable reset tokens
   - Reset link sent to attacker-controlled email (via email change)
   - Security questions with guessable answers
   - SMS interception (SIM swapping)
3. Attacker resets password and gains full account access

### Via Social Engineering
1. Attacker contacts customer support impersonating the victim
2. Attacker provides publicly available information to "verify" identity
3. Support agent resets credentials or disables MFA
4. Attacker gains access

### Via OAuth/SSO Flaws
1. Attacker exploits misconfigured OAuth flows
2. Attacker links their identity provider account to the victim's application account
3. Attacker gains access via SSO

## Detection Checks

- [ ] Are password reset tokens cryptographically random and single-use?
- [ ] Do reset tokens have short expiration (15-30 minutes)?
- [ ] Is the old password invalidated immediately upon reset?
- [ ] Are all active sessions terminated after password reset?
- [ ] Is email change protected with re-authentication?
- [ ] Is MFA removal protected with re-authentication and delay?
- [ ] Are account recovery flows resistant to enumeration?
- [ ] Is customer support trained on social engineering resistance?
- [ ] Are account changes (email, password, MFA) logged and alerted?
- [ ] Is there a cooldown period after sensitive account changes?

## Impact

| Impact Area | Severity |
|-------------|----------|
| Complete account compromise | Critical |
| Identity theft | Critical |
| Financial loss | High |
| Data breach | High |
| Regulatory penalties | High |

## Mitigation

| Control | Priority |
|---------|----------|
| Require re-authentication for sensitive account changes | Critical |
| Implement cryptographically random, single-use, expiring reset tokens | Critical |
| Terminate all sessions on password change | Critical |
| Enforce MFA on all accounts | High |
| Implement delay and notification for MFA removal | High |
| Notify users of account changes via out-of-band channels | High |
| Train support staff on social engineering resistance | High |
| Implement account recovery verification that's not publicly guessable | Medium |
| Log and monitor all account modification events | Medium |
| Implement login anomaly detection | Medium |

## References

- OWASP: A07:2021 Identification and Authentication Failures
- CWE-640: Weak Password Recovery Mechanism for Forgotten Password
- CWE-620: Unverified Password Change
- NIST SP 800-63B: Authentication and Lifecycle Management
