# Backend Issues & Fixes

## Critical Issues Found

### 1. ✅ **FIXED: server.js Syntax Error**

- **Error**: `SyntaxError: Identifier 'authenticationRouter' has already been declared`
- **Cause**: Duplicate route imports and improper indentation
- **Solution**: Recreated `server.js` with clean code and proper structure

### 2. ⚠️ **CRITICAL: MongoDB Authentication Failed**

- **Error**: `MongoServerError: bad auth : authentication failed`
- **Cause**: Invalid MongoDB credentials in `.env`

**Fix**: Update `server/.env` with correct credentials:

```
MONGODB_URI=mongodb+srv://[username]:[password]@[cluster].mongodb.net/[dbname]?retryWrites=true&w=majority
```

**Steps**:

1. Go to MongoDB Atlas: https://www.mongodb.com/cloud/atlas
2. Get your connection string from "Connect" button
3. Replace `[username]`, `[password]`, `[cluster]`, `[dbname]`
4. Paste into `.env`

### 3. ⚠️ **Frontend: Token is Null**

- **Error**: `token null` in browser console
- **Cause**: User is not authenticated
- **Solution**: Login with valid credentials

### 4. ⚠️ **Frontend: 401 Unauthorized on Notifications**

- **Error**: `GET /api/get-notifications: 401 (Unauthorized)`
- **Cause**: Missing or invalid JWT token in headers
- **Solution**: Should resolve after fixing MongoDB and logging in

### 5. ⚠️ **Frontend: 500 Error on Blogs & Categories**

- **Error**: `GET /blog/all-blogs: 500 (Internal Server Error)`
- **Cause**: Backend crashed due to:
  - MongoDB connection failure
  - Missing route handlers
- **Solution**: Fix MongoDB connection first, then restart server

---

## Step-by-Step Fix Guide

### Step 1: Verify MongoDB Connection

```bash
cd server
# Edit .env with correct MongoDB URI
notepad .env

# Test connection
npm run dev
```

**Expected Output**:

```
Database connection successful
Server is running at PORT 5000
```

### Step 2: Check Backend Routes

Verify all routers are properly imported in `server.js`:

- ✅ authentication.router
- ✅ blog.router
- ✅ category.router
- ✅ comment.router
- ✅ contact.router
- ✅ events.router
- ✅ password.recovery.router
- ✅ signauth.router
- ✅ subscription.router
- ✅ queries.router
- ✅ videos.router

### Step 3: Restart Frontend

```bash
cd client
npm run dev
```

### Step 4: Test Login Flow

1. Register new account
2. Verify email with OTP
3. Login
4. Check browser console for token

---

## Debugging Checklist

| Issue             | Command                                    | Expected                         |
| ----------------- | ------------------------------------------ | -------------------------------- |
| Server running?   | `npm run dev` in server folder             | `Server is running at PORT 5000` |
| DB connected?     | Check server logs                          | `Database connection successful` |
| Frontend running? | `npm run dev` in client folder             | `Local: http://localhost:5173`   |
| Token stored?     | F12 → Application → localStorage → `token` | Should have value                |
| API responsive?   | `curl http://localhost:5000/health`        | `{"status":"Server is running"}` |

---

## Common 500 Error Causes

### A. MongoDB Connection

```bash
# Check .env file exists with MONGODB_URI
ls server/.env
cat server/.env | grep MONGODB
```

### B. Missing Controllers/Models

```bash
# Verify all controller imports work
node -e "require('./server/controllers/blog.controller.js')"
```

### C. Invalid Route Paths

Check `blog.router.js`:

```javascript
// Correct format:
router.route("/all-blogs").get(getAllBlogs);

// NOT:
router.get("/all-blogs", getAllBlogs);
```

---

## Environment Variables Checklist

### `server/.env` Must Have:

```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname
PORT=5000
NODE_ENV=local
JWT_SECRET_KEY=your_secret_key
SESSION_SECRET_KEY=your_session_secret
FRONTEND_CLIENT_URL=http://localhost:5173
```

### `client/.env` Must Have:

```
VITE_SERVER_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
```

---

## Testing Backend Endpoints

### Health Check:

```bash
curl http://localhost:5000/health
# Expected: {"status":"Server is running"}
```

### Get All Blogs (No Auth):

```bash
curl http://localhost:5000/blog/all-blogs
# Expected: {"blogs":[...]} or empty array
```

### Get Notifications (With Auth):

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/get-notifications
# Expected: Array of notifications
```

---

## Next Steps

1. **Fix MongoDB**: Update `.env` with correct credentials
2. **Restart Backend**: `npm run dev` in server folder
3. **Check Logs**: Look for "Database connection successful"
4. **Restart Frontend**: `npm run dev` in client folder
5. **Test Login**: Register → Verify → Login
6. **Check Console**: Should show token and user data

---

**Last Updated**: January 29, 2026
