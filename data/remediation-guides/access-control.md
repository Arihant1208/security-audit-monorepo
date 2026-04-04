# Access Control — Remediation Guide

## Core Principles

### 1. Deny by Default
Every request should be denied unless explicitly permitted.

```
# Pseudocode — correct approach
if not user.has_permission(resource, action):
    return 403 Forbidden
```

### 2. Server-Side Enforcement
Never rely on client-side controls (hidden buttons, disabled fields). Enforce all access control server-side.

### 3. Centralized Authorization
Use a single authorization mechanism, not scattered checks.

```
# Middleware approach (preferred)
@app.before_request
def check_authorization():
    if not authorize(current_user, request.endpoint, request.method):
        abort(403)
```

---

## Authorization Patterns

### Role-Based Access Control (RBAC)

Define roles with specific permissions:

```
Role: admin
  - users:read, users:write, users:delete
  - settings:read, settings:write

Role: editor
  - content:read, content:write
  - users:read

Role: viewer
  - content:read
```

**Implementation:**
- Map roles to permissions (not directly to endpoints)
- Check permissions, not role names, in code
- Use framework middleware for enforcement

### Attribute-Based Access Control (ABAC)

For complex scenarios, use attributes:

```
Policy: "User can edit document if user.department == document.department AND user.role == 'editor'"
```

---

## Preventing IDOR (Insecure Direct Object References)

### Problem
```
GET /api/users/123/profile  ← User 456 can access user 123's data
```

### Fix: Ownership Verification

```python
# VULNERABLE
@app.route('/api/users/<user_id>/profile')
def get_profile(user_id):
    return db.get_user(user_id)  # No ownership check

# SECURE
@app.route('/api/users/<user_id>/profile')
@login_required
def get_profile(user_id):
    if current_user.id != user_id and not current_user.is_admin:
        abort(403)
    return db.get_user(user_id)
```

### Additional IDOR Protections
- Use UUIDs instead of sequential IDs (reduces enumeration)
- Apply data-level filters in queries: `WHERE user_id = @current_user`
- Use indirect references (map user-facing IDs to internal IDs per session)

---

## Preventing Privilege Escalation

### Vertical Escalation Prevention
- Server-side role validation on every admin endpoint
- Admin routes use separate middleware/router with admin check
- Role changes require re-authentication
- Role assignment requires admin approval workflow

### Horizontal Escalation Prevention
- Every data access query includes user context filter
- Object-level authorization checked, not just endpoint access
- API responses filtered by user ownership

---

## Framework Integration Examples

### Express.js (Node.js)
```javascript
// Middleware for role check
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

app.delete('/api/users/:id', requireRole('admin'), deleteUser);
```

### Django (Python)
```python
from django.contrib.auth.decorators import permission_required

@permission_required('users.delete_user', raise_exception=True)
def delete_user(request, user_id):
    # ...
```

### Spring Boot (Java)
```java
@PreAuthorize("hasRole('ADMIN')")
@DeleteMapping("/api/users/{id}")
public ResponseEntity<?> deleteUser(@PathVariable Long id) {
    // ...
}
```

---

## Testing Access Control

- Test every endpoint with unauthenticated requests
- Test every endpoint with each role level
- Test resource access with IDs belonging to other users
- Test admin functions with non-admin tokens
- Automate access control tests in CI/CD
