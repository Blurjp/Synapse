# RBAC E2E Test Suite

Comprehensive Selenium-based UI tests for Role-Based Access Control (RBAC) system.

## Test Coverage

### Test Accounts

1. **Admin User**
   - Email: `test@example.com`
   - Password: `testpass123`
   - Role: `admin`
   - Permissions: ALL (6 permissions)

2. **Regular User**
   - Email: `regular@example.com`
   - Password: `regular123`
   - Role: `free_user`
   - Permissions: `view_templates` only

---

## Test Scenarios

### 1. Admin User Tests ✅

#### `test_admin_can_see_all_template_actions`
- **Purpose**: Verify admin sees delete/edit buttons for default templates
- **Steps**:
  1. Login as admin
  2. Navigate to templates page
  3. Check for delete buttons on default templates
  4. Check for edit buttons on default templates
- **Expected**: All action buttons visible

#### `test_admin_can_delete_default_template`
- **Purpose**: Verify admin can actually delete a default template
- **Steps**:
  1. Login as admin
  2. Navigate to templates page
  3. Click delete on a default template
  4. Confirm deletion
  5. Verify no 403 error
- **Expected**: Template deleted successfully, audit log created

#### `test_admin_can_edit_default_template`
- **Purpose**: Verify admin can edit a default template
- **Steps**:
  1. Login as admin
  2. Navigate to templates page
  3. Click edit on a default template
  4. Modify and save
  5. Verify no 403 error
- **Expected**: Template updated successfully, audit log created

#### `test_admin_jwt_contains_all_permissions`
- **Purpose**: Verify JWT token contains all permissions
- **Steps**:
  1. Login as admin
  2. Extract access_token from localStorage
  3. Decode JWT payload
  4. Verify permissions array
- **Expected**:
  - `is_superuser: true`
  - `roles: ["admin"]`
  - `permissions: ["*"]` or 6 permissions

#### `test_admin_succeeds_on_delete_default_template_api`
- **Purpose**: Test API-level permission check
- **Steps**:
  1. Login as admin
  2. Call DELETE API with admin token
  3. Verify response status
- **Expected**: 204 No Content (success)

---

### 2. Regular User Tests ✅

#### `test_regular_user_cannot_see_delete_default_template_buttons`
- **Purpose**: Verify UI hides delete buttons for default templates
- **Steps**:
  1. Login as regular user
  2. Navigate to templates page
  3. Check default templates for delete buttons
- **Expected**: Delete buttons hidden (via `hasPermission()` check)

#### `test_regular_user_cannot_see_edit_default_template_buttons`
- **Purpose**: Verify UI hides edit buttons for default templates
- **Steps**:
  1. Login as regular user
  2. Navigate to templates page
  3. Check default templates for edit buttons
- **Expected**: Edit buttons hidden

#### `test_regular_user_can_create_custom_templates`
- **Purpose**: Verify regular user can create own templates
- **Steps**:
  1. Login as regular user
  2. Navigate to templates page
  3. Click "Create Template"
  4. Fill form and save
- **Expected**: Template created successfully

#### `test_regular_user_can_delete_own_custom_templates`
- **Purpose**: Verify regular user can delete own templates
- **Steps**:
  1. Login as regular user
  2. Create a custom template
  3. Find the custom template
  4. Click delete
  5. Confirm deletion
- **Expected**: Custom template deleted (not default)

#### `test_regular_jwt_contains_limited_permissions`
- **Purpose**: Verify JWT token contains only limited permissions
- **Steps**:
  1. Login as regular user
  2. Extract access_token from localStorage
  3. Decode JWT payload
  4. Verify permissions array
- **Expected**:
  - `is_superuser: false`
  - `roles: ["free_user"]`
  - `permissions: ["view_templates"]` (exactly 1)

#### `test_regular_user_gets_403_on_delete_default_template_api`
- **Purpose**: Test API-level permission enforcement
- **Steps**:
  1. Login as regular user
  2. Call DELETE API with regular user token
  3. Verify response status
- **Expected**: 403 Forbidden with Chinese error message

---

## Running the Tests

### Prerequisites

1. **Start Backend**:
   ```bash
   cd qwen-local-chat/backend
   source venv/bin/activate  # or activate.bat on Windows
   uvicorn app.main:app --reload
   ```

2. **Start Frontend**:
   ```bash
   cd qwen-local-chat/frontend
   npm run dev
   ```

3. **Verify Services**:
   - Backend: http://localhost:8000/docs
   - Frontend: http://localhost:5173

### Run All Tests

```bash
cd qwen-local-chat/tests/e2e
./run_rbac_tests.sh
```

### Run Specific Tests

```bash
# Run only admin tests
pytest test_rbac_permissions.py::TestRBACPermissions::test_admin_can_see_all_template_actions -v

# Run only regular user tests
pytest test_rbac_permissions.py::TestRBACPermissions::test_regular_user_cannot_see_delete_default_template_buttons -v

# Run JWT validation tests
pytest test_rbac_permissions.py::TestRBACPermissions::test_admin_jwt_contains_all_permissions -v
pytest test_rbac_permissions.py::TestRBACPermissions::test_regular_jwt_contains_limited_permissions -v

# Run with verbose output
pytest test_rbac_permissions.py -v -s

# Run in headless mode (CI/CD)
CI=1 pytest test_rbac_permissions.py -v
```

---

## Test Architecture

### Helper Methods

#### `login_as(driver, email, password)`
- Logs in as specified user
- Clears existing session first
- Waits for login completion
- Returns True on success

#### `navigate_to_templates(driver)`
- Navigates to templates page
- Handles multiple navigation methods
- Returns True on success

#### `element_exists(driver, by, value, timeout=3)`
- Checks if element exists without raising exception
- Returns True/False

#### `element_visible(driver, by, value, timeout=3)`
- Checks if element is visible
- Returns True/False

### Fixtures

#### `logout`
- Function-scoped fixture
- Runs after each test
- Clears localStorage and logs out
- Ensures clean state between tests

---

## Test Data

### Default Templates
Tests assume default templates exist with:
- `is_default: true` flag
- Chinese text markers like "默认"
- Unique identifiers like `char_default_001`

### Custom Templates
Tests create temporary templates:
- `is_default: false`
- Created by test user
- Deleted after test completion

---

## Expected Test Results

### All Tests Pass Scenario ✅

```
test_rbac_permissions.py::TestRBACPermissions::test_admin_can_see_all_template_actions PASSED
test_rbac_permissions.py::TestRBACPermissions::test_admin_can_delete_default_template PASSED
test_rbac_permissions.py::TestRBACPermissions::test_admin_can_edit_default_template PASSED
test_rbac_permissions.py::TestRBACPermissions::test_admin_jwt_contains_all_permissions PASSED
test_rbac_permissions.py::TestRBACPermissions::test_admin_succeeds_on_delete_default_template_api PASSED
test_rbac_permissions.py::TestRBACPermissions::test_regular_user_cannot_see_delete_default_template_buttons PASSED
test_rbac_permissions.py::TestRBACPermissions::test_regular_user_cannot_see_edit_default_template_buttons PASSED
test_rbac_permissions.py::TestRBACPermissions::test_regular_user_can_create_custom_templates PASSED
test_rbac_permissions.py::TestRBACPermissions::test_regular_user_can_delete_own_custom_templates PASSED
test_rbac_permissions.py::TestRBACPermissions::test_regular_jwt_contains_limited_permissions PASSED
test_rbac_permissions.py::TestRBACPermissions::test_regular_user_gets_403_on_delete_default_template_api PASSED

==================== 11 passed in 120.45s ====================
```

---

## Troubleshooting

### Backend Not Running
```
Error: Backend is not running on localhost:8000
Solution: Start backend with `uvicorn app.main:app --reload`
```

### Frontend Not Running
```
Error: Frontend is not running on localhost:5173
Solution: Start frontend with `npm run dev`
```

### ChromeDriver Issues
```
Error: ChromeDriver not found
Solution: Tests auto-install ChromeDriver via webdriver-manager
```

### Login Failed
```
Error: Admin/Regular login failed
Solution:
1. Check TEST_ACCOUNTS.md for correct credentials
2. Verify database has test users
3. Run: cd backend && venv/bin/python create_test_user.py
```

### Element Not Found
```
Error: Element not found
Solution:
1. Check if frontend UI has changed
2. Update XPath selectors in test file
3. Increase wait timeouts if needed
```

### 403 Errors for Admin
```
Error: Admin getting 403 on delete
Solution:
1. Verify RBAC migration ran: backend/migrations/002_add_rbac.sql
2. Check admin user has admin role: SELECT * FROM user_roles WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com');
3. Verify permissions: SELECT * FROM role_permissions WHERE role_id = (SELECT id FROM roles WHERE name = 'admin');
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: RBAC E2E Tests

on: [push, pull_request]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install backend dependencies
        run: |
          cd qwen-local-chat/backend
          pip install -r requirements.txt

      - name: Run migrations
        run: |
          cd qwen-local-chat/backend
          python -c "import psycopg; ..."

      - name: Start backend
        run: |
          cd qwen-local-chat/backend
          uvicorn app.main:app &
          sleep 5

      - name: Set up Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install frontend dependencies
        run: |
          cd qwen-local-chat/frontend
          npm install

      - name: Start frontend
        run: |
          cd qwen-local-chat/frontend
          npm run dev &
          sleep 10

      - name: Run E2E tests
        run: |
          cd qwen-local-chat/tests/e2e
          CI=1 pytest test_rbac_permissions.py -v
```

---

## Test Maintenance

### When to Update Tests

1. **UI Changes**: Update XPath selectors if component structure changes
2. **New Permissions**: Add test cases for new permissions
3. **New Roles**: Add test cases for new user roles
4. **API Changes**: Update API endpoint tests if routes change

### Adding New Test Cases

```python
def test_new_permission_check(self, driver, logout):
    """Test description"""

    # Login
    assert self.login_as(driver, "test@example.com", "testpass123")

    # Navigate
    assert self.navigate_to_templates(driver)

    # Test logic
    # ...

    # Assertions
    assert condition, "Error message"

    print("✅ Test passed")
```

---

## References

- **Main Documentation**: `/TEST_ACCOUNTS.md`
- **Implementation Report**: `/codex_reviews/rbac_implementation_complete.md`
- **Backend Auth**: `backend/app/auth.py`
- **Frontend Context**: `frontend/src/contexts/AuthContext.tsx`
- **Database Migration**: `backend/migrations/002_add_rbac.sql`
