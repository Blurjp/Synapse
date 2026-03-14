# RBAC UI Test - Quick Start Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Start Services

```bash
# Terminal 1 - Backend
cd qwen-local-chat/backend
source venv/bin/activate
uvicorn app.main:app --reload
```

```bash
# Terminal 2 - Frontend
cd qwen-local-chat/frontend
npm run dev
```

### Step 2: Verify Services Running

- Backend: http://localhost:8000/docs
- Frontend: http://localhost:5173

### Step 3: Run Tests

```bash
# Terminal 3 - Tests
cd qwen-local-chat/tests/e2e
./run_rbac_tests.sh
```

---

## 📋 What the Tests Do

### Admin User Tests (test@example.com / testpass123)
- ✅ Can see delete/edit buttons for default templates
- ✅ Can delete default character templates
- ✅ Can edit default character templates
- ✅ JWT contains all 6 permissions
- ✅ API allows deletion (204 response)

### Regular User Tests (regular@example.com / regular123)
- ✅ Cannot see delete buttons for default templates (hidden)
- ✅ Cannot see edit buttons for default templates (hidden)
- ✅ Can create custom templates
- ✅ Can delete own custom templates
- ✅ JWT contains only 1 permission (view_templates)
- ✅ API returns 403 on delete attempt

---

## 🎯 Test Coverage

| Test Scenario | Admin | Regular |
|--------------|-------|---------|
| **UI - See Delete Button** | ✅ Visible | ❌ Hidden |
| **UI - See Edit Button** | ✅ Visible | ❌ Hidden |
| **Action - Delete Default** | ✅ Success | ❌ 403 Error |
| **Action - Edit Default** | ✅ Success | ❌ 403 Error |
| **Action - Create Custom** | ✅ Success | ✅ Success |
| **Action - Delete Own** | ✅ Success | ✅ Success |
| **JWT - Permissions** | 6 perms | 1 perm |
| **JWT - is_superuser** | true | false |
| **API - DELETE /templates** | 204 | 403 |

---

## 📊 Expected Output

```
========================================
RBAC Permission E2E Tests
========================================

✓ Backend is running
✓ Frontend is running

========================================
Running RBAC Permission Tests
========================================

test_rbac_permissions.py::TestRBACPermissions::test_admin_can_see_all_template_actions PASSED
✅ Admin can see all template action buttons

test_rbac_permissions.py::TestRBACPermissions::test_admin_can_delete_default_template PASSED
✅ Admin successfully deleted default template

test_rbac_permissions.py::TestRBACPermissions::test_admin_can_edit_default_template PASSED
✅ Admin successfully edited default template

test_rbac_permissions.py::TestRBACPermissions::test_admin_jwt_contains_all_permissions PASSED
✅ Admin JWT verified: 6 permissions, is_superuser=True

test_rbac_permissions.py::TestRBACPermissions::test_admin_succeeds_on_delete_default_template_api PASSED
✅ Admin successfully deleted default template via API

test_rbac_permissions.py::TestRBACPermissions::test_regular_user_cannot_see_delete_default_template_buttons PASSED
✅ Regular user correctly cannot see delete buttons for default templates

test_rbac_permissions.py::TestRBACPermissions::test_regular_user_cannot_see_edit_default_template_buttons PASSED
✅ Regular user correctly cannot see edit buttons for default templates

test_rbac_permissions.py::TestRBACPermissions::test_regular_user_can_create_custom_templates PASSED
✅ Regular user successfully created custom template

test_rbac_permissions.py::TestRBACPermissions::test_regular_user_can_delete_own_custom_templates PASSED
✅ Regular user successfully deleted own custom template

test_rbac_permissions.py::TestRBACPermissions::test_regular_jwt_contains_limited_permissions PASSED
✅ Regular user JWT verified: ['view_templates'], is_superuser=False

test_rbac_permissions.py::TestRBACPermissions::test_regular_user_gets_403_on_delete_default_template_api PASSED
✅ Regular user correctly receives 403 when attempting to delete default template

==================== 11 passed in 120.45s ====================

========================================
✅ All RBAC tests passed!
========================================
```

---

## 🔧 Manual Testing

If you want to manually verify the differences:

### 1. Test Admin Access

```bash
# Open browser to http://localhost:5173
# Login with:
Email: test@example.com
Password: testpass123

# You should see:
- Delete buttons on default templates ✅
- Edit buttons on default templates ✅
- "Audit Logs" menu item ✅
- Can successfully delete/edit defaults ✅
```

### 2. Test Regular User Access

```bash
# Logout and login with:
Email: regular@example.com
Password: regular123

# You should see:
- No delete buttons on default templates ❌
- No edit buttons on default templates ❌
- No "Audit Logs" menu ❌
- Can create custom templates ✅
- Can delete own custom templates ✅
- Get 403 error if trying to delete defaults ❌
```

---

## 🐛 Troubleshooting

### Tests Fail: "Backend not running"
```bash
cd qwen-local-chat/backend
source venv/bin/activate
uvicorn app.main:app --reload
```

### Tests Fail: "Frontend not running"
```bash
cd qwen-local-chat/frontend
npm run dev
```

### Tests Fail: "Login failed"
```bash
# Verify accounts exist
cd qwen-local-chat/backend
source venv/bin/activate
python -c "
from app.database import SessionLocal
from app import db_models
db = SessionLocal()
admin = db.query(db_models.User).filter(db_models.User.email == 'test@example.com').first()
regular = db.query(db_models.User).filter(db_models.User.email == 'regular@example.com').first()
print(f'Admin exists: {admin is not None}')
print(f'Regular exists: {regular is not None}')
"
```

### Tests Fail: "Element not found"
- Frontend UI may have changed
- Check if templates page URL is correct
- Verify templates exist in database

---

## 📁 File Structure

```
qwen-local-chat/
├── backend/
│   ├── app/
│   │   ├── auth.py                    # RBAC logic
│   │   ├── auth_routes.py             # Login endpoints
│   │   ├── routes_templates.py        # Protected endpoints
│   │   └── db_models.py               # User/Role models
│   └── migrations/
│       └── 002_add_rbac.sql          # Database schema
├── frontend/
│   └── src/
│       └── contexts/
│           └── AuthContext.tsx        # hasPermission() checks
└── tests/
    └── e2e/
        ├── test_rbac_permissions.py   # ← Selenium tests
        ├── run_rbac_tests.sh          # ← Test runner
        └── RBAC_TEST_README.md        # Full documentation
```

---

## 🎓 Learn More

- **Full Test Documentation**: `qwen-local-chat/tests/e2e/RBAC_TEST_README.md`
- **Account Details**: `TEST_ACCOUNTS.md`
- **Implementation Report**: `codex_reviews/rbac_implementation_complete.md`
- **Selenium Docs**: https://selenium-python.readthedocs.io/

---

## ✅ Success Criteria

All tests pass means:

1. ✅ Admin user has full access to all template operations
2. ✅ Regular user cannot modify default templates (UI hides buttons)
3. ✅ Regular user cannot delete default templates (API returns 403)
4. ✅ JWT tokens correctly embed roles and permissions
5. ✅ Permission checking works at both frontend and backend levels
6. ✅ RBAC system is fully functional and secure

---

**Ready to test?** Just run: `./run_rbac_tests.sh`
