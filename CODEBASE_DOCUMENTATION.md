# Nguvunation Blog - Codebase Documentation

**Status**: Full-stack web application in development, transitioning from microservices to monolithic architecture.

---

## 🏗️ Project Overview

**Nguvunation Blog** is an NGO-focused blogging platform with:

- User authentication & profile management
- Blog creation, editing, and categorization
- Event management and gallery
- Comment system with notifications
- Video hosting integration
- Admin dashboard for content management

**Tech Stack**:

- **Frontend**: React 18 + Vite, Tailwind CSS, Firebase Auth
- **Backend**: Node.js + Express.js, MongoDB (NoSQL), Socket.IO
- **Storage**: Cloudinary (media), GCP Cloud Storage
- **Authentication**: JWT, Firebase (OAuth: Google, Twitter, Facebook)

---

## 📁 Project Structure

```
nguvunationBlog/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components (Home, Blog, Admin, etc.)
│   │   ├── store/          # Context API (Authentication)
│   │   ├── config/         # Firebase configuration
│   │   ├── data/           # Static data (BlogData, Categories)
│   │   └── helper/         # Utility functions
│   └── public/             # Static assets
│
└── server/                 # Express.js backend
    ├── controllers/        # Business logic for routes
    ├── models/             # MongoDB schemas
    ├── routers/            # API route definitions
    ├── middlewares/        # Authentication, validation
    ├── config/             # Cloudinary, Multer setup
    ├── utils/              # DB connection, OTP, Email
    ├── validations/        # Zod schemas for validation
    ├── gcp/                # GCP Cloud Storage integration
    └── server.js           # Main Express app
```

---

## 🗂️ Core Database Models

### 1. **User Model** (`server/models/user.model.js`)

Fields:

- **Basic**: name, username, email, phone, password
- **Profile**: profileImg, bannerImg, city, state, country, dob, gender, age, headline, summary
- **Preferences**: theme (light/dark), language
- **Relations**:
  - savedPosts: [ObjectId → Blog]
  - likedPosts: [ObjectId → Blog]
  - following: [ObjectId → User]
  - followers: [ObjectId → User]
  - socialMedia: ObjectId → SocialMedia
- **Verification**: otp, isVerified, resetCode, resetCodeExpires
- **Tracking**: recentlyViewed, createdAt
- **Methods**: Password hashing (bcrypt), JWT generation
- **Security**: Password hashed via bcrypt on save

### 2. **Blog Model** (`server/models/blog.model.js`)

Fields:

- **Content**: title, content (HTML), category (ObjectId → Category)
- **Media**: coverImage (URL), coverImagePublicId (for Cloudinary), imageHash
- **Author**: author (ObjectId → User)
- **Engagement**:
  - likes: [ObjectId → User]
  - views: Number
  - comments: (referenced via Comment model)
- **Status**: isDraft, isFeatured, publishedDate
- **Timestamps**: createdAt, updatedAt

### 3. **Category Model** (`server/models/category.model.js`)

Fields:

- name: String (unique)
- description: String
- blogs: [ObjectId → Blog]

### 4. **Comment Model** (`server/models/comment.model.js`)

Fields:

- blog: ObjectId → Blog
- user: ObjectId → User
- content: String
- likes: [ObjectId → User]
- timestamp: Date

### 5. **Additional Models**

- **EventSchema**: Event creation, date, location, image
- **GallerySchema**: Image/video storage metadata
- **NotificationModel**: User notifications (likes, comments, follows)
- **SubscriptionModel**: Newsletter subscriptions
- **SocialMediaModel**: User social links
- **QuerySchema**: Track user queries
- **UsageSchema**: Storage/usage monitoring
- **StorageSchema**: File metadata
- **ReplyModel**: Nested replies on comments

---

## 🔌 API Routes

### Authentication (`/auth`, `/api/auth`)

| Method | Endpoint         | Purpose                               |
| ------ | ---------------- | ------------------------------------- |
| POST   | `/auth/register` | Create new user account               |
| POST   | `/auth/login`    | Login with credentials                |
| POST   | `/auth/google`   | Firebase Google OAuth                 |
| POST   | `/auth/logout`   | Clear session                         |
| GET    | `/api/user`      | Get current user data (JWT protected) |

### Blog Management (`/blog`)

| Method | Endpoint             | Purpose                         |
| ------ | -------------------- | ------------------------------- |
| GET    | `/blog/get-all`      | Fetch all published blogs       |
| GET    | `/blog/:blogId`      | Get single blog details         |
| POST   | `/blog/create`       | Create new blog (authenticated) |
| PUT    | `/blog/:blogId`      | Update blog (author only)       |
| DELETE | `/blog/:blogId`      | Delete blog (author only)       |
| POST   | `/blog/:blogId/like` | Like/unlike blog                |

### Categories (`/blog/category`)

| Method | Endpoint                     | Purpose                 |
| ------ | ---------------------------- | ----------------------- |
| GET    | `/blog/category/get-all`     | Fetch all categories    |
| POST   | `/blog/category/create`      | Create category (admin) |
| GET    | `/blog/category/:categoryId` | Get blogs by category   |

### Comments (`/blog/comment`)

| Method | Endpoint                   | Purpose                      |
| ------ | -------------------------- | ---------------------------- |
| GET    | `/blog/comment/:blogId`    | Get blog comments            |
| POST   | `/blog/comment/create`     | Add comment (authenticated)  |
| DELETE | `/blog/comment/:commentId` | Delete comment (author only) |

### Events (`/events`)

| Method | Endpoint          | Purpose                      |
| ------ | ----------------- | ---------------------------- |
| GET    | `/events/get-all` | Fetch all events             |
| POST   | `/events/create`  | Create event (authenticated) |

### Contact & Subscription (`/api`)

| Method | Endpoint         | Purpose                 |
| ------ | ---------------- | ----------------------- |
| POST   | `/api/contact`   | Submit contact form     |
| POST   | `/api/subscribe` | Newsletter subscription |

### Password Recovery (`/password`)

| Method | Endpoint           | Purpose                |
| ------ | ------------------ | ---------------------- |
| POST   | `/password/forgot` | Request password reset |
| POST   | `/password/reset`  | Reset with token/OTP   |

---

## 🎨 Frontend Components

### Pages

- **Home**: Landing page with featured posts
- **BlogDetails**: Single blog view with comments
- **Category/CategoryPosts**: Browse by category
- **Profile**: User profile & saved posts
- **Login/Register**: Authentication pages
- **ForgotPassword/ResetPassword**: Password recovery flow
- **Contact**: Contact form
- **EventList/EventGallery**: Event management
- **Admin Dashboard**: Content management hub

### Admin Pages

- **AdminHome**: Dashboard overview
- **PostList**: Manage all blogs
- **CreateBlogPost**: WYSIWYG editor (Markdown + syntax highlighting)
- **UpdateBlogPost**: Edit existing blogs
- **CategoryPage**: Manage categories
- **UserProfile**: Admin user management
- **EditProfile**: User profile editing
- **Setting**: Admin settings
- **Notification**: Real-time notifications

### Core Components

| Component           | Purpose                         |
| ------------------- | ------------------------------- |
| `Navbar`            | Site navigation, user menu      |
| `Footer`            | Footer with links               |
| `LatestPostSection` | Featured blog carousel          |
| `CommentSection`    | Blog comments display           |
| `SignAuth`          | OAuth authentication (Firebase) |
| `VerifyCode`        | OTP verification                |
| `uploadForm`        | File upload to Cloudinary       |
| `UserGallery`       | User media gallery              |
| `videoPlayer`       | Video playback wrapper          |
| `Loader`            | Loading spinner                 |

---

## 🔐 Authentication Flow

### Email/Password Authentication

1. User registers → `AuthController.register()`
2. Email verified via OTP → `VerifyCode` component
3. Login → JWT token generated
4. Token stored in localStorage
5. `AuthContext` manages user state globally

### OAuth (Google/Twitter/Facebook)

1. Firebase Auth popup triggered
2. `signauth.router.js` handles callback
3. User created/linked in MongoDB
4. JWT issued for session

**Protected Routes**: Middleware `authenticateToken` validates JWT on protected endpoints.

---

## 🎯 Key Features

### 1. Blog Management

- **Editor**: Markdown + rich HTML support (rehype + remark)
- **Syntax Highlighting**: Code blocks with Shiki
- **Images**: Cloudinary integration with URL storage
- **Status**: Draft/Published, Featured blog selection
- **View Tracking**: Increment views, track recently viewed

### 2. User Engagement

- **Likes**: Track blog/comment likes
- **Comments**: Nested comment system with replies
- **Following**: User-to-user follow system
- **Notifications**: Real-time alerts (Socket.IO)

### 3. Media Handling

- **Cloudinary**: Blog covers, profile images
- **GCP Cloud Storage**: Video storage
- **Multer**: File upload middleware
- **Sharp**: Image optimization

### 4. Admin Dashboard

- Create/edit/delete blogs
- Manage categories
- Approve comments
- User management
- Event management
- Real-time notifications

---

## ⚙️ Key Utilities & Services

### Backend Utilities

| File              | Purpose                               |
| ----------------- | ------------------------------------- |
| `db_connect.js`   | MongoDB connection setup              |
| `send_email.js`   | Nodemailer SMTP integration           |
| `generate_otp.js` | OTP generation for email verification |
| `rate_limit.js`   | Express rate limiting middleware      |

### Frontend Utilities

| File                 | Purpose                   |
| -------------------- | ------------------------- |
| `like.handler.js`    | Handle blog/comment likes |
| `firebase.config.js` | Firebase initialization   |

### Validations

- `user.validation.schema.js`: Zod schema for user registration/login

---

## 🔌 External Integrations

| Service                 | Purpose                 | Config                     |
| ----------------------- | ----------------------- | -------------------------- |
| **MongoDB**             | Primary database        | `MONGODB_URI`              |
| **Cloudinary**          | Image hosting           | `CLOUDINARY_*` keys        |
| **Firebase**            | Auth & OAuth            | `FIREBASE_*` credentials   |
| **GCP Cloud Storage**   | Video/file storage      | `service-account-key.json` |
| **SendGrid/Gmail SMTP** | Email service           | `SMTP_*` variables         |
| **Socket.IO**           | Real-time notifications | `socket.js`                |

---

## 📋 Environment Variables Setup

### Backend (.env)

```
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# Server
PORT=5000
NODE_ENV=local

# Authentication
JWT_SECRET_KEY=your_secret_key
SESSION_SECRET_KEY=your_session_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Firebase (Admin)
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...

# Frontend URL
FRONTEND_CLIENT_URL=http://localhost:5173

# GCP
GCP_BUCKET_NAME=your_bucket_name
```

### Frontend (.env)

```
# Firebase (Client)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# Server URL
VITE_SERVER_URL=http://localhost:5000
```

---

## 🚀 Running the Application

### Frontend

```bash
cd client
pnpm install
pnpm run dev          # Dev server on :5173
pnpm run build        # Production build
```

### Backend

```bash
cd server
pnpm install
pnpm run dev          # With nodemon (auto-reload)
pnpm start            # Production server on :5000
```

---

## 📊 Data Flow Example: Creating a Blog Post

1. **Frontend**: User fills form → `CreateBlogPost` component
2. **Validation**: Zod schema validation
3. **Upload**: Image to Cloudinary via `uploadForm` component
4. **Submit**: POST `/blog/create` with JWT token
5. **Backend**: `blog.controller.js` validates & saves to MongoDB
6. **Response**: Blog ID returned → Navigate to blog details
7. **Display**: Blog fetched & rendered on `BlogDetails` page
8. **Real-time**: WebSocket notifies followers (Socket.IO)

---

## 🛑 Common Issue Areas

| Issue                 | Location                             | Fix                          |
| --------------------- | ------------------------------------ | ---------------------------- |
| JWT token expired     | `AuthContext.jsx`                    | Implement token refresh      |
| Image upload fails    | `uploadForm.jsx`, Cloudinary config  | Verify API keys              |
| Email not sending     | `send_email.js`                      | Check SMTP credentials       |
| DB connection fails   | `db_connect.js`                      | Verify MongoDB URI           |
| Comments not showing  | `Comment model`, `comment.router.js` | Check blog reference         |
| WebSocket not working | `socket.js`                          | Ensure Socket.IO initialized |

---

## 👥 Team & Credits

- **yokas**: Full-stack development
- **milqan**: Logo redesign
- **custer'ed**: Frontend
- **rukundo rolex**: UI/UX & graphics
- **Base template**: https://github.com/pawantech12
- **Microservices template**: https://github.com/NemroNeno/CloudProject

---

**Last Updated**: January 2026
**Deployment**: https://nguvunationblog.onrender.com (frontend error - WIP)
