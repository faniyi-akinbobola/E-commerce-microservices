# Testing Guide for Fixed Authentication Flows

## All Fixed Issues:

1. ✅ **Refresh Token** - Now works properly with random hex tokens
2. ✅ **Reset Password** - Token validation fixed (no userId required)
3. ✅ **Deleted User Protection** - Deleted users cannot access any protected routes

---

## 1. Test Refresh Token Flow

### Step 1: Login

```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "YourPassword123!"
}
```

**Expected Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a1b2c3d4e5f6..." // Random hex string
  "user": {
    "id": "uuid",
    "username": "testuser",
    "email": "test@example.com",
    "role": "user"
  }
}
```

### Step 2: Use Refresh Token

```http
POST http://localhost:3000/auth/refreshtoken
Content-Type: application/json

{
  "refreshToken": "a1b2c3d4e5f6..." // Use the refreshToken from login
}
```

**Expected Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // New access token
  "refreshToken": "x9y8z7w6v5u4...", // New refresh token
  "user": {
    "id": "uuid",
    "username": "testuser",
    "email": "test@example.com",
    "role": "user"
  }
}
```

**✅ Success Criteria:**

- No 500 error
- Returns new accessToken and new refreshToken
- Old refreshToken is now invalid

---

## 2. Test Reset Password Flow (FIXED - No userId Required!)

### Step 1: Request Reset Token

```http
POST http://localhost:3000/auth/forgotpassword
Content-Type: application/json

{
  "email": "test@example.com"
}
```

**Expected Response:**

```json
{
  "message": "Password reset link sent"
}
```

**Note:** Check your email or logs for the reset token. The token is sent via email.

### Step 2: Reset Password (ONLY token and newPassword required!)

```http
POST http://localhost:3000/auth/resetpassword
Content-Type: application/json

{
  "token": "the-token-from-email",
  "newPassword": "NewPassword123!"
}
```

**Expected Response:**

```json
{
  "message": "Password has been reset successfully"
}
```

**✅ Success Criteria:**

- No 500 error about "Invalid or expired reset token"
- Password is successfully changed
- Can login with new password

**❌ Previous Issue (FIXED):**

- Previously required userId in the payload
- Token comparison was failing due to userId mismatch

---

## 3. Test Deleted User Protection

### Step 1: Login as a User

```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "deletetest@example.com",
  "password": "Password123!"
}
```

**Save the accessToken from the response.**

### Step 2: Access a Protected Route (Should Work)

```http
GET http://localhost:3000/auth/getprofile
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Expected Response:** User profile data (200 OK)

### Step 3: Delete Your Account

```http
DELETE http://localhost:3000/users/deleteuser
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Expected Response:**

```json
{
  "id": "uuid",
  "username": "deletetest"
  // ... other user data
}
```

### Step 4: Try to Access Protected Route Again (Should Fail)

```http
GET http://localhost:3000/auth/getprofile
Authorization: Bearer YOUR_ACCESS_TOKEN // Same token as before
```

**Expected Response:**

```json
{
  "statusCode": 401,
  "message": "User no longer exists"
}
```

**✅ Success Criteria:**

- Token is blacklisted immediately upon deletion
- User existence is checked on every protected route
- Cannot access ANY protected route after deletion

**Protected Routes That Should All Return 401:**

- GET `/auth/getprofile`
- POST `/auth/changepassword`
- POST `/auth/signout`
- GET `/users/getusers`
- GET `/users/getuser/:id`
- PATCH `/users/updateuser`
- POST `/users-address/createuseraddress`
- GET `/users-address/getuseraddresses`
- PATCH `/users-address/updateuseraddress/:id`
- DELETE `/users-address/deleteuseraddress/:id`
- GET `/users-address/getuseraddressbyid/:id`

---

## 4. Test Complete Auth Flow (All Features Together)

### Scenario: Complete User Journey

1. **Signup**

```http
POST http://localhost:3000/auth/signup
Content-Type: application/json

{
  "username": "fulltest",
  "email": "fulltest@example.com",
  "password": "Password123!",
  "role": "user"
}
```

2. **Login** (Get tokens)

```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "fulltest@example.com",
  "password": "Password123!"
}
```

3. **Access Profile** (Using accessToken)

```http
GET http://localhost:3000/auth/getprofile
Authorization: Bearer YOUR_ACCESS_TOKEN
```

4. **Refresh Tokens** (When accessToken expires)

```http
POST http://localhost:3000/auth/refreshtoken
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

5. **Change Password** (Using new accessToken)

```http
POST http://localhost:3000/auth/changepassword
Authorization: Bearer YOUR_NEW_ACCESS_TOKEN
Content-Type: application/json

{
  "oldPassword": "Password123!",
  "newPassword": "NewPassword456!"
}
```

6. **Signout** (Blacklist token)

```http
POST http://localhost:3000/auth/signout
Authorization: Bearer YOUR_ACCESS_TOKEN
```

7. **Try to Access After Signout** (Should fail with 401)

```http
GET http://localhost:3000/auth/getprofile
Authorization: Bearer YOUR_ACCESS_TOKEN // Same token from step 6
```

**Expected:** 401 Unauthorized - "Token has been revoked"

---

## Common Issues and Solutions

### Issue 1: "Invalid or expired refresh token"

**Solution:** Make sure you're using the `refreshToken` (random hex) from login, NOT the accessToken (JWT).

### Issue 2: "Invalid or expired reset token" (Previous 500 Error)

**Solution:** ✅ FIXED! Now only requires `token` and `newPassword` in the payload. Do NOT include `userId`.

### Issue 3: Deleted user still accessing routes

**Solution:** ✅ FIXED! All protected routes now check both:

- If token is blacklisted
- If user still exists in database

### Issue 4: Token not being blacklisted on signout

**Solution:** Ensure you're passing the token in the Authorization header. The guard extracts it automatically.

---

## Testing Checklist

- [ ] Refresh token works (no 500 error)
- [ ] Reset password works without userId
- [ ] Deleted user gets 401 on all protected routes
- [ ] Signout blacklists token
- [ ] Blacklisted token returns 401
- [ ] Email notifications sent for all auth events
- [ ] Change password works
- [ ] Forgot password sends email with reset link

---

## Notes

1. **Refresh Token Format:** Random 32-byte hex string (e.g., `a1b2c3d4e5f6...`)
2. **Access Token Format:** JWT (e.g., `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
3. **Reset Token:** Random 32-byte hex string sent via email
4. **Token Expiry:**
   - Access Token: 1 hour
   - Reset Token: 15 minutes

## Quick Test Commands (cURL)

```bash
# 1. Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!"}'

# 2. Refresh Token
curl -X POST http://localhost:3000/auth/refreshtoken \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'

# 3. Reset Password (NO userId needed!)
curl -X POST http://localhost:3000/auth/resetpassword \
  -H "Content-Type: application/json" \
  -d '{"token":"RESET_TOKEN_FROM_EMAIL","newPassword":"NewPassword123!"}'

# 4. Delete User
curl -X DELETE http://localhost:3000/users/deleteuser \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 5. Try to access after deletion (should fail)
curl -X GET http://localhost:3000/auth/getprofile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
