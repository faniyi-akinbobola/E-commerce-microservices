# API Routes Documentation

Base URL: `http://localhost:3000`

## Auth Routes (`/auth`)

### 1. POST /auth/signup

**Description**: Register a new user  
**Authentication**: None  
**Body**:

```json
{
  "username": "testuser",
  "email": "testuser@example.com",
  "password": "Test@1234",
  "role": "CUSTOMER"
}
```

**Note**: Role must be one of: `CUSTOMER`, `ADMIN`, or `INVENTORY_MANAGER` (uppercase)
**Response**:

```json
{
  "access_token": "...",
  "refresh_token": "..."
}
```

---

### 2. POST /auth/login

**Description**: Login with email and password  
**Authentication**: None  
**Body**:

```json
{
  "email": "testuser@example.com",
  "password": "Test@1234"
}
```

**Response**:

```json
{
  "access_token": "...",
  "refresh_token": "..."
}
```

---

### 3. GET /auth/getprofile

**Description**: Get current user profile  
**Authentication**: **Bearer Token Required**  
**Headers**:

```
Authorization: Bearer <access_token>
```

**Response**:

```json
{
  "id": "...",
  "username": "testuser",
  "email": "testuser@example.com",
  "role": "customer",
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

### 4. POST /auth/refreshtoken

**Description**: Refresh access token  
**Authentication**: None  
**Body**:

```json
{
  "refreshToken": "..."
}
```

**Response**:

```json
{
  "access_token": "...",
  "refresh_token": "..."
}
```

---

### 5. POST /auth/changepassword

**Description**: Change user password  
**Authentication**: **Bearer Token Required**  
**Headers**:

```
Authorization: Bearer <access_token>
```

**Body**:

```json
{
  "oldPassword": "Test@1234",
  "newPassword": "NewTest@1234"
}
```

**Response**:

```json
{
  "message": "Password changed successfully"
}
```

---

### 6. POST /auth/forgotpassword

**Description**: Request password reset token  
**Authentication**: None  
**Body**:

```json
{
  "email": "testuser@example.com"
}
```

**Response**:

```json
{
  "message": "Password reset instructions sent to email"
}
```

---

### 7. POST /auth/resetpassword

**Description**: Reset password using token  
**Authentication**: None  
**Body**:

```json
{
  "userId": "...",
  "token": "...",
  "newPassword": "NewPassword@123"
}
```

**Response**:

```json
{
  "message": "Password has been reset successfully"
}
```

---

### 8. POST /auth/signout

**Description**: Sign out (logout)  
**Authentication**: **Bearer Token Required**  
**Headers**:

```
Authorization: Bearer <access_token>
```

**Response**:

```json
{
  "message": "Successfully signed out"
}
```

---

## Users Routes (`/users`)

**All routes require Bearer Token**

### 9. GET /users/getusers

**Description**: Get all users  
**Authentication**: **Bearer Token Required**  
**Headers**:

```
Authorization: Bearer <access_token>
```

**Response**:

```json
[
  {
    "id": "...",
    "username": "user1",
    "email": "user1@example.com",
    "role": "customer"
  }
]
```

---

### 10. GET /users/getuser/:id

**Description**: Get user by ID  
**Authentication**: **Bearer Token Required**  
**Headers**:

```
Authorization: Bearer <access_token>
```

**URL Params**: `id` (user ID)  
**Response**:

```json
{
  "id": "...",
  "username": "testuser",
  "email": "testuser@example.com",
  "role": "customer"
}
```

---

### 11. PATCH /users/updateuser

**Description**: Update current user  
**Authentication**: **Bearer Token Required**  
**Headers**:

```
Authorization: Bearer <access_token>
```

**Body**:

```json
{
  "username": "updatedusername"
}
```

**Response**:

```json
{
  "message": "User updated successfully"
}
```

---

### 12. DELETE /users/deleteuser

**Description**: Delete current user  
**Authentication**: **Bearer Token Required**  
**Headers**:

```
Authorization: Bearer <access_token>
```

**Response**:

```json
{
  "message": "User deleted successfully"
}
```

---

## User Address Routes (`/users-address`)

**All routes require Bearer Token**

### 13. POST /users-address/createuseraddress

**Description**: Create a new address for current user  
**Authentication**: **Bearer Token Required**  
**Headers**:

```
Authorization: Bearer <access_token>
```

**Body**:

```json
{
  "street": "123 Main St",
  "city": "New York",
  "state": "NY",
  "country": "USA",
  "zipCode": "10001"
}
```

**Response**:

```json
{
  "id": "...",
  "street": "123 Main St",
  "city": "New York",
  "state": "NY",
  "country": "USA",
  "zipCode": "10001"
}
```

---

### 14. GET /users-address/getuseraddresses

**Description**: Get all addresses for current user  
**Authentication**: **Bearer Token Required**  
**Headers**:

```
Authorization: Bearer <access_token>
```

**Response**:

```json
[
  {
    "id": "...",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "zipCode": "10001"
  }
]
```

---

### 15. GET /users-address/getuseraddressbyid/:id

**Description**: Get address by ID  
**Authentication**: **Bearer Token Required**  
**Headers**:

```
Authorization: Bearer <access_token>
```

**URL Params**: `id` (address ID)  
**Response**:

```json
{
  "id": "...",
  "street": "123 Main St",
  "city": "New York",
  "state": "NY",
  "country": "USA",
  "zipCode": "10001"
}
```

---

### 16. PATCH /users-address/updateuseraddress/:id

**Description**: Update address by ID  
**Authentication**: **Bearer Token Required**  
**Headers**:

```
Authorization: Bearer <access_token>
```

**URL Params**: `id` (address ID)  
**Body**:

```json
{
  "street": "456 Updated St"
}
```

**Response**:

```json
{
  "message": "Address updated successfully"
}
```

---

### 17. DELETE /users-address/deleteuseraddress/:id

**Description**: Delete address by ID  
**Authentication**: **Bearer Token Required**  
**Headers**:

```
Authorization: Bearer <access_token>
```

**URL Params**: `id` (address ID)  
**Response**:

```json
{
  "message": "Address deleted successfully"
}
```

---

## Summary of Routes Requiring Bearer Token

### Auth Routes with Bearer Token:

- `GET /auth/getprofile`
- `POST /auth/changepassword`
- `POST /auth/signout`

### All Users Routes:

- `GET /users/getusers`
- `GET /users/getuser/:id`
- `PATCH /users/updateuser`
- `DELETE /users/deleteuser`

### All Users Address Routes:

- `POST /users-address/createuseraddress`
- `GET /users-address/getuseraddresses`
- `GET /users-address/getuseraddressbyid/:id`
- `PATCH /users-address/updateuseraddress/:id`
- `DELETE /users-address/deleteuseraddress/:id`

---

## Testing with curl

Get access token:

```bash
ACCESS_TOKEN=$(curl -s -X POST "http://localhost:3000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "testuser@example.com", "password": "Test@1234"}' | jq -r '.access_token')
```

Use with protected routes:

```bash
curl -X GET "http://localhost:3000/auth/getprofile" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

---

## Running the Test Script

Run all tests:

```bash
./test-all-routes.sh
```
