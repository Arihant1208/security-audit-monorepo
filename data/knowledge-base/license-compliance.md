# License Compliance Audit Guide

## Overview

Open source license compliance ensures that all third-party dependencies used in a project are compatible with the project's own license and business model.

## License Categories

### Permissive Licenses (Low Risk)
- **MIT** — Do anything, keep copyright notice
- **Apache-2.0** — Like MIT + patent grant + state changes
- **BSD-2-Clause** — Minimal restrictions
- **BSD-3-Clause** — No endorsement clause
- **ISC** — Simplified MIT

### Weak Copyleft (Medium Risk)
- **LGPL-2.1 / LGPL-3.0** — Copyleft applies to modifications of the library itself, not your code that uses it (if dynamically linked)
- **MPL-2.0** — File-level copyleft; modified files must stay MPL, but your other files can be proprietary
- **EPL-2.0** — Module-level copyleft

### Strong Copyleft (High Risk)
- **GPL-2.0 / GPL-3.0** — Any distributed derivative work must use GPL. "Viral" copyleft
- **AGPL-3.0** — Like GPL + network use triggers copyleft (critical for SaaS)

### Public Domain (No Risk)
- **Unlicense** — Dedicated to public domain
- **CC0-1.0** — Creative Commons public domain
- **0BSD** — Zero-clause BSD

## Conflict Scenarios

### 1. GPL in Proprietary SaaS
**Risk:** Critical  
**Scenario:** Using a GPL-licensed library in a proprietary SaaS application  
**Issue:** If the SaaS distributes the software (e.g., desktop app, mobile app, on-premise deployment), GPL requires the entire application source to be released under GPL  
**Note:** For pure SaaS (server-side only, no distribution), GPL *may* not trigger, but AGPL would  
**Recommendation:** Replace with permissive alternative or isolate via subprocess/API boundary

### 2. AGPL in SaaS Backend
**Risk:** Critical  
**Scenario:** Using AGPL-licensed library in a web service backend  
**Issue:** AGPL explicitly triggers copyleft for network use — users interacting over a network are considered to be "receiving" the software  
**Recommendation:** Replace immediately or open-source your entire backend

### 3. License Compatibility in Dependencies
**Risk:** Medium  
**Scenario:** MIT project depends on Apache-2.0 library  
**Issue:** Apache-2.0 has additional patent and notice requirements that MIT doesn't  
**Recommendation:** Generally compatible, but ensure NOTICE file requirements are met

### 4. Unknown/Missing Licenses
**Risk:** Critical  
**Scenario:** Dependency has no LICENSE file or SPDX identifier  
**Issue:** Without explicit license, copyright law defaults to "all rights reserved" — you have no right to use it  
**Recommendation:** Contact author, check npm/PyPI/crates.io for license field, or replace

## Policy Templates

### For Proprietary/Commercial Projects
```yaml
blocked:
  - AGPL-3.0
  - GPL-2.0
  - GPL-3.0
review_required:
  - LGPL-2.1
  - LGPL-3.0
  - MPL-2.0
allowed:
  - MIT
  - Apache-2.0
  - BSD-2-Clause
  - BSD-3-Clause
  - ISC
  - Unlicense
  - CC0-1.0
```

### For SaaS Projects
```yaml
blocked:
  - AGPL-3.0
review_required:
  - GPL-2.0
  - GPL-3.0
  - LGPL-2.1
  - LGPL-3.0
allowed:
  - MIT
  - Apache-2.0
  - BSD-*
  - ISC
  - MPL-2.0
```

### For Open Source (MIT) Projects
```yaml
blocked: []
review_required:
  - GPL-2.0 (incompatible with MIT for distribution)
  - AGPL-3.0
allowed:
  - MIT
  - Apache-2.0
  - BSD-*
  - ISC
  - LGPL-*
```

## SBOM Generation

A Software Bill of Materials (SBOM) provides a complete inventory of all dependencies with their licenses. Steve generates SBOMs compatible with:

- **SPDX** — ISO standard format
- **CycloneDX** — OWASP standard format
- **CSV** — Simple tabular format for legal review

## Remediation Strategies

1. **Replace** — Find a permissively-licensed alternative
2. **Isolate** — Run copyleft code as a separate process/service behind an API
3. **Negotiate** — Contact the author for dual-licensing options
4. **Comply** — If acceptable, release your code under the copyleft license
5. **Remove** — Eliminate the dependency and implement the functionality yourself
