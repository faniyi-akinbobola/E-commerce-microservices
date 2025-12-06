# Quick Postman Test Reference

## 🔧 All Issues Fixed!

✅ **Refresh Token** - Now works perfectly  
✅ **Reset Password** - No more 500 errors (no userId needed!)  
✅ **Deleted User** - Cannot access any routes after deletion

---

## 🚀 Quick Tests (Copy & Paste to Postman)

### 1. Test Refresh Token

**Step 1: Login**

```
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Password123!"
}
```

**Step 2: Refresh Token (Use refreshToken from Step 1)**

```
POST http://localhost:3000/auth/refreshtoken
Content-Type: application/json

{
  "refreshToken": "PASTE_REFRESH_TOKEN_HERE"
}
```

**✅ Expected:** New accessToken + new refreshToken (no 500 error!)

---

### 2. Test Reset Password (FIXED - No userId!)

**Step 1: Request Reset**

```
POST http://localhost:3000/auth/forgotpassword
Content-Type: application/json

{
  "email": "test@example.com"
}
```

**Step 2: Reset Password (Token is returned in response for testing)**

```
POST http://localhost:3000/auth/resetpassword
Content-Type: application/json

{
  "token": "PASTE_TOKEN_FROM_STEP_1_RESPONSE",
  "newPassword": "NewPassword123!"
}
```

**✅ Expected:** "Password has been reset successfully" (no 500 error!)

**Note:** The token is now included in the forgot password response for testing purposes. In production, it should only be sent via email.

---

### 3. Test Deleted User Protection

**Step 1: Login**

```
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "deletetest@example.com",
  "password": "Password123!"
}
```

**Save the accessToken!**

**Step 2: Test Access (Should Work)**

```
GET http://localhost:3000/auth/getprofile
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Step 3: Delete Account**

```
DELETE http://localhost:3000/users/deleteuser
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Step 4: Try Access Again (Should Fail with 401)**

```
GET http://localhost:3000/auth/getprofile
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**✅ Expected:** 401 Unauthorized - "User no longer exists"

---

## 📋 Important Notes

### Refresh Token vs Access Token

- **Access Token (JWT):** Starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Refresh Token:** Random hex like `a1b2c3d4e5f6789...`
- ⚠️ Use the **refreshToken** field for `/auth/refreshtoken`, NOT accessToken!

### Reset Password Token

- Sent via email (check notifications service logs if email not configured)
- Expires in 15 minutes
- Random hex string
- **No userId needed in the request!**

### Authorization Header Format

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🐛 Troubleshooting

### "Invalid or expired refresh token"

- Make sure you're using the **refreshToken** (hex), not accessToken (JWT)
- Check if you've already used this refresh token (single-use)

### "Invalid or expired reset token"

- ✅ FIXED! Make sure you removed `userId` from the request body
- Token expires after 15 minutes
- Get fresh token with forgot password

### Deleted user still accessing routes

- ✅ FIXED! User existence now checked on every request
- Token is blacklisted on deletion
- Clear your Authorization header and login again to test

### 500 Error on any endpoint

```bash
# Check logs
docker logs ecommerce-auth-service-1 --tail 50
docker logs ecommerce-api-gateway-1 --tail 50
```

---

## 🎯 Complete Test Flow (5 minutes)

```
1. Signup       → POST /auth/signup
2. Login        → POST /auth/login (save accessToken + refreshToken)
3. Get Profile  → GET /auth/getprofile (use accessToken)
4. Refresh      → POST /auth/refreshtoken (use refreshToken)
5. Reset Pwd    → POST /auth/forgotpassword + /auth/resetpassword
6. Login again  → POST /auth/login (with new password)
7. Delete User  → DELETE /users/deleteuser (use accessToken)
8. Try Profile  → GET /auth/getprofile (should get 401)
```

---

## 📊 Success Criteria

✅ All requests return proper status codes (200, 201, 401)  
✅ No 500 Internal Server Errors  
✅ Refresh token works and rotates  
✅ Reset password works without userId  
✅ Deleted users get 401 on all protected routes  
✅ Email notifications sent for all auth events

---

**Services Running:**

- API Gateway: http://localhost:3000
- Auth Service: http://localhost:3001 (internal)
- PostgreSQL: localhost:5432
- RabbitMQ: localhost:5672 (AMQP), localhost:15672 (Management UI)

**Need Help?**

1. Check TESTING_GUIDE.md for detailed scenarios
2. Check FIXES_SUMMARY.md for technical details
3. Review Docker logs for errors

---

**All systems ready for testing! 🚀**
