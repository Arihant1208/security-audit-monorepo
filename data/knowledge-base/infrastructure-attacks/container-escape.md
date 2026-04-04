# Container Escape

## Description

Container escape is an attack where a process running inside a container breaks out of the container's isolation boundary and gains access to the host operating system or other containers. This defeats the security boundary that containers are expected to provide.

## Affected Layer

Infrastructure & Cloud

## Attack Mechanism

1. Attacker gains code execution inside a container (via application vulnerability)
2. Attacker exploits container runtime vulnerabilities, misconfigurations, or excessive privileges
3. Attacker breaks out of the container namespace to the host OS
4. Attacker gains host-level access, can read all containers' data, pivot further

**Common escape vectors:**
- Privileged containers (--privileged flag)
- Mounted Docker socket (/var/run/docker.sock)
- Host filesystem mounts
- Kernel exploits from within container
- Capabilities abuse (SYS_ADMIN, SYS_PTRACE)
- Exploiting container runtime vulnerabilities (runc, containerd)

## Detection Checks

- [ ] Are containers running without the `--privileged` flag?
- [ ] Is the Docker socket NOT mounted inside containers?
- [ ] Are host filesystem mounts limited to read-only where needed?
- [ ] Are Linux capabilities dropped to minimum required?
- [ ] Are containers running as non-root users?
- [ ] Is a container runtime security tool deployed (Falco, Sysdig)?
- [ ] Are container images scanned for known vulnerabilities?
- [ ] Is the container runtime (runc, containerd) up to date?
- [ ] Are seccomp profiles and AppArmor/SELinux policies applied?

## Impact

| Impact Area | Severity |
|-------------|----------|
| Full host compromise | Critical |
| Access to all co-located containers | Critical |
| Data breach across container boundaries | Critical |
| Lateral movement in the cluster | Critical |
| Denial of service to all hosted workloads | High |

## Mitigation

| Control | Priority |
|---------|----------|
| Never run containers in privileged mode in production | Critical |
| Never mount Docker socket inside containers | Critical |
| Run containers as non-root users | Critical |
| Drop all Linux capabilities, add only what's needed | High |
| Apply seccomp profiles and AppArmor/SELinux policies | High |
| Keep container runtime patched and updated | High |
| Use read-only root filesystems | High |
| Deploy runtime security monitoring (Falco) | Medium |
| Use gVisor or Kata Containers for stronger isolation | Medium |

## References

- CWE-250: Execution with Unnecessary Privileges
- NIST SP 800-190: Application Container Security Guide
- CIS Docker Benchmark
- CIS Kubernetes Benchmark
