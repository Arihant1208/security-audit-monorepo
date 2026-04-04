# 01 — Architecture Security Checklist

## Defense in Depth

- [ ] Multiple security layers exist (not single points of failure)
- [ ] Compromise of one component does not grant full system access
- [ ] Security controls exist at network, application, and data layers

## Principle of Least Privilege

- [ ] Each component has minimum required access to function
- [ ] Service accounts use scoped permissions
- [ ] No shared credentials between services

## Separation of Concerns

- [ ] Security-critical components (auth, encryption) are isolated
- [ ] Administrative functions are separated from user functions
- [ ] Different trust levels are in separate network zones

## Fail-Safe Defaults

- [ ] System denies access by default, allows explicitly
- [ ] Error conditions result in secure state (not open)
- [ ] Timeouts and failures default to denied/locked

## Trust Boundaries

- [ ] Trust boundaries are clearly defined
- [ ] All trust boundary crossings enforce authentication and authorization
- [ ] Data is validated at every trust boundary

## Secure Communication

- [ ] All inter-service communication is encrypted
- [ ] Service-to-service authentication is implemented (mTLS, API keys)
- [ ] External integrations use encrypted channels

## Resilience

- [ ] Single points of failure are identified and mitigated
- [ ] Graceful degradation is implemented for dependent service failures
- [ ] Circuit breakers protect against cascading failures

## Scalability Security

- [ ] Auto-scaling does not bypass security controls
- [ ] Security controls are stateless or properly distributed
- [ ] Rate limiting scales with the system
