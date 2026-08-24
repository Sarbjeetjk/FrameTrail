# 🎬 FrameTrail - Cinematic Media Gallery & Digital Asset Vault

FrameTrail is a full-stack media gallery and digital asset management web application. Built with React, TypeScript, Node.js, Express, MongoDB Atlas, and Cloudinary Cloud Storage, FrameTrail provides high-performance photo showcases, video streaming, cinematic movie displays, and a secure Admin Management Dashboard.

---

## ✨ Features

- 🎥 **Multi-Media Asset Management**: Dedicated, high-speed galleries for High-Res Photography, Short Videos, and Cinematic Movies.
- 🎨 **Rich Glassmorphic Aesthetics**: Modern dark mode UI built with Tailwind CSS, custom ambient background glows, and responsive typography.
- ⚡ **Cinematic Intro Splash Animation**: Glassmorphic splash loader featuring brand logo, progress counter, and automatic unmount.
- 🔍 **4x Multi-Level Zoom & Drag-to-Explore**: Image viewer supporting magnification up to 400% (4x) with interactive mouse drag-to-pan exploration.
- 🖼️ **Custom Cover/Poster Image File Upload**: Upload custom cover poster images per item during batch media uploads.
- 🛡️ **Admin Management & Hidden Vault**:
  - Independent subsystem loading (Stats, Media, Trash, Hidden Vault, Inquiries).
  - Amber `Unhide` action controls and real-time category privacy board.
  - Rate limiting & JWT Role-Based Access Control (RBAC).
- ✉️ **Contact Us & Email Notifications**: Nodemailer SMTP integration for inquiry emails.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript & Vite
- **Styling**: Tailwind CSS & Vanilla CSS Design Tokens
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js & Express.js (TypeScript)
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Cloud Storage**: Cloudinary Cloud Storage & Cloudflare R2
- **Email Service**: Nodemailer (Gmail SMTP)
- **Authentication & Security**: JSON Web Tokens (JWT), Bcrypt.js, Express Rate Limiter, Helmet

---

## 🚀 Environment Variables Configuration

Create a `.env` file in the `server/` directory using the following placeholder template:

```env
# Server Port Configuration
PORT=5000

# Database Configuration
MONGODB_URI=your_mongodb_atlas_connection_string_here

# JWT Authentication Secret
JWT_SECRET=your_jwt_secret_key_here

# Cloudinary Cloud Storage Credentials
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Gmail SMTP Email Configuration (For Contact Inquiries)
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
```

> ⚠️ **Security Notice**: Never commit real passwords, secret keys, or database URIs to public version control repositories.

---

## 💻 Local Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Sarbjeetjk/FrameTrail.git
   cd FrameTrail
   ```

2. **Install Server Dependencies & Run Backend**:
   ```bash
   cd server
   npm install
   npm run dev
   ```

3. **Install Client Dependencies & Run Frontend**:
   ```bash
   cd ../client
   npm install
   npm run dev
   ```

4. **Access Application**:
   - Frontend Application: `http://localhost:5173`
   - Backend API Health: `http://localhost:5000/health`

---

## 🛡️ License & Credits

Designed and developed for high-performance cinematic asset streaming and digital gallery management. Built with ❤️ using modern web standards.
