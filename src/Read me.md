# 📚 BookNook – A Small Online Library

BookNook is a modern online library management platform where users can explore books, add new books, borrow available books, and manage their borrowed books. It provides a simple and convenient way to manage a small digital library.

## 🌐 Live Website

**Live Site:** [Add Your Live Website URL Here](https://book-nook-frontend-one.vercel.app)

**Frontend Repository:** [GitHub Repository](https://github.com/shourikhoqueshommridho/book-nook-frontend)

**Backend Repository:** [GitHub Repository](https://github.com/shourikhoqueshommridho/book-nook-backend)

## ✨ Key Features

- **User Authentication:** Secure registration and login using Better Auth with email/password and Google authentication.
- **Browse Books:** Explore all available books with search, category filtering, sorting, and pagination.
- **Add New Books:** Logged-in users can add books with a title, author, category, image, description, and total copies.
- **Book Details:** View detailed information about each book before borrowing.
- **Borrow Books:** Borrow available books with a simple confirmation process.
- **My Books:** Manage your own uploaded books with edit and delete functionality.
- **My Borrows:** View borrowed books, check borrowing and return dates, and return books.
- **Available Copies:** Automatically update available copies when books are borrowed or returned.
- **No Double Borrowing:** Prevent users from borrowing the same book multiple times simultaneously.
- **Responsive Design:** Optimized for mobile, tablet, and desktop devices.
- **Dark/Light Theme:** Switch between dark and light modes.
- **Loading & Notifications:** User-friendly loading states, success messages, and error notifications.

## 🛠️ Technologies Used

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Better Auth
- Swiper.js

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication

### Authentication & Authorization
- Better Auth
- MongoDB Adapter
- Google OAuth
- JWT Token Validation

### Deployment
- Vercel

## 📂 Project Structure

```text
BookNook/
├── book-nook-frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── README.md
│
└── book-nook-backend/
    ├── src/
    ├── package.json
    └── README.md
```

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites

- Node.js
- npm
- MongoDB Database
- Git

### 1. Clone the Frontend Repository

```bash
git clone YOUR_FRONTEND_REPOSITORY_URL
cd book-nook-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the frontend root directory.

```env
MONGODB_URI=your_mongodb_connection_string
BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
BACKEND_API_URL=http://localhost:5000
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Add any additional environment variables required by your implementation.

### 4. Run the Frontend

```bash
npm run dev
```

Frontend will run at:

```text
http://localhost:3000
```

### 5. Run the Backend

Clone the backend repository separately:

```bash
git clone YOUR_BACKEND_REPOSITORY_URL
cd book-nook-backend
npm install
```

Create a `.env` file in the backend root directory and configure:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWKS_URL=your_better_auth_jwks_url
CORS_ORIGIN=http://localhost:3000
IMGBB_API_KEY=your_imgbb_api_key
```

Add any other environment variables required by your backend implementation.

Run the backend:

```bash
npm run dev
```

Backend will run at:

```text
http://localhost:5000
```

## 🔐 Authentication

BookNook uses Better Auth for authentication.

- Email and password registration.
- Email and password login.
- Google social authentication.
- Protected routes for authenticated users.
- JWT-based API authorization.
- Users can access their own books and borrowing records.

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/books` | Get all books |
| GET | `/api/books/:id` | Get a single book |
| POST | `/api/books` | Add a new book |
| PATCH | `/api/books/:id` | Update a book |
| DELETE | `/api/books/:id` | Delete a book |
| POST | `/api/borrows` | Borrow a book |
| GET | `/api/borrows` | Get logged-in user's borrowed books |
| DELETE | `/api/borrows/:id` | Return a borrowed book |

Additional endpoints include book categories, image uploads, and health checks.

## 📖 Borrowing System

- Users can borrow books only when copies are available.
- Available copies decrease automatically after borrowing.
- Available copies increase after returning a book.
- Users cannot borrow the same book twice while an active borrow exists.
- Books with zero available copies cannot be borrowed.

## 🎨 UI & User Experience

- Clean and modern library-themed interface.
- Consistent typography, spacing, and button styles.
- Responsive book cards and layouts.
- Interactive navigation and dropdown menus.
- Custom confirmation dialogs.
- Toast notifications for success and errors.
- Custom not-found page.

## 👨‍💻 Author

**Name:** Your Name

**Project:** BookNook – A Small Online Library

## 📄 License

This project was created for educational purposes as part of a programming assignment.