# AI/ML Security Patterns

## Overview

When AI/ML systems are introduced into an application, they bring both opportunities and new attack surfaces. This guide covers security patterns for AI-enhanced systems.

## AI Security Threats

### 1. Prompt Injection
**Description:** Attackers craft inputs that manipulate LLM behavior to bypass instructions, leak system prompts, or execute unintended actions.
**Detection:**
- Monitor for unusual output patterns
- Input sanitization before LLM processing
- Output validation after LLM response
**Mitigation:**
- Separate system prompts from user content
- Use structured output formats (JSON schema validation)
- Implement output guardrails
- Defense-in-depth: don't rely solely on the LLM for access control

### 2. Training Data Poisoning
**Description:** Attackers inject malicious data into training sets to influence model behavior.
**Detection:**
- Statistical analysis of training data distributions
- Anomaly detection on data ingestion
- Regular model behavior auditing
**Mitigation:**
- Data provenance tracking
- Input validation on training pipelines
- Regular model retraining with clean data
- Differential privacy techniques

### 3. Model Extraction
**Description:** Attackers query the model repeatedly to reconstruct it or learn its parameters.
**Detection:**
- Rate limiting on model API calls
- Monitor for systematic probing patterns
- Track unusual query distributions
**Mitigation:**
- Rate limiting and quotas
- Add noise to outputs (differential privacy)
- Monitor and block extraction patterns
- Watermark model outputs

### 4. Adversarial Inputs
**Description:** Specially crafted inputs designed to cause model misclassification or unexpected behavior.
**Detection:**
- Input perturbation detection
- Confidence score monitoring
- Adversarial training validation
**Mitigation:**
- Adversarial training
- Input preprocessing and normalization
- Ensemble methods for robust predictions
- Human-in-the-loop for low-confidence decisions

### 5. Data Leakage via Model Outputs
**Description:** Models inadvertently expose training data through their outputs (memorization).
**Detection:**
- Output monitoring for PII/sensitive data
- Membership inference testing
- Regular privacy audits
**Mitigation:**
- Differential privacy in training
- Output filtering for sensitive data
- Minimize training on sensitive data
- Regular model privacy testing

## Secure AI Architecture Patterns

### Pattern 1: Sandboxed AI Service
```
[User] → [Input Validation] → [AI Service (sandboxed)] → [Output Validation] → [User]
                                       ↓
                              [Monitoring & Logging]
```
- AI service runs in isolated environment
- All inputs sanitized before reaching model
- All outputs validated before returning to user
- Full audit trail

### Pattern 2: Human-in-the-Loop for High-Impact Decisions
```
[AI Analysis] → [Confidence Check] → High confidence → [Auto-execute]
                                    → Low confidence → [Human Review] → [Execute]
```
- AI handles routine decisions autonomously
- Human approval required for high-impact or low-confidence cases
- Maintains audit trail of human decisions

### Pattern 3: Multi-Model Consensus
```
[Input] → [Model A] ─┐
        → [Model B] ──┼→ [Consensus Engine] → [Output]
        → [Model C] ─┘
```
- Multiple models or approaches vote on outcome
- Reduces risk of single-model manipulation
- Disagreement triggers alert/review

## AI Opportunity Assessment Framework

When recommending AI for a system, evaluate:

| Factor | Low Risk | Medium Risk | High Risk |
|--------|----------|-------------|-----------|
| Data sensitivity | Public data only | Internal data | PII/financial/health |
| Decision impact | Informational | Efficiency | Safety/security-critical |
| Reversibility | Easily reversible | Partially reversible | Irreversible |
| Transparency | Fully explainable | Partially explainable | Black box |
| Failure mode | Graceful degradation | Service disruption | Safety hazard |

## Implementation Checklist

- [ ] Input validation and sanitization before AI processing
- [ ] Output validation and filtering after AI processing
- [ ] Rate limiting on AI endpoints
- [ ] Monitoring for adversarial patterns
- [ ] Audit logging of all AI decisions
- [ ] Fallback mechanism if AI service fails
- [ ] Regular model evaluation and retraining schedule
- [ ] Privacy impact assessment for training data
- [ ] Access control on model endpoints
- [ ] Secure model artifact storage and versioning
