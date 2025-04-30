# CompCode

CompCode is a web application designed to help you prepare for coding interviews by solving commonly asked LeetCode problems from various popular companies. The app provides a user-friendly interface to browse, solve, and track your progress.

---

## 🔥 Features

- **Company-Specific Problems** – View and solve questions by company.
- **Submission Reports** – Track which problems you've completed.
- **Progress Tracking** – Lessons, quizzes, and coding tasks are auto-tracked.
- **Stripe Payments** – Premium subscription with checkout and customer portal.
- **User Authentication** – Google login powered by Passport.js and JWT.
- **Dark/Light Mode** – Theme adapts to system or manual preference.
- **Responsive Design** – Mobile-first and fully responsive.

---

## 🚀 Tech Stack

- **Frontend**: React + Vite + React Router + Tailwind CSS
- **Backend**: Express.js + MongoDB + Mongoose
- **Auth**: Google OAuth 2.0 with Passport.js + JWT
- **Payments**: Stripe Checkout and Webhooks
- **Hosting**:
  - Frontend: [Vercel](https://vercel.com/)
  - Backend: [Vercel](https://vercel.com/)

---

## 🛠 Getting Started

### Prerequisites

- Node.js v16+
- MongoDB Atlas (or local MongoDB)
- Stripe Account
- Google Cloud OAuth Client
- Vercel Account

---

### 🔧 Server Setup

1. **Clone the project and set up server directory**:

   ```bash
   git clone https://github.com/ahmad-masud/CompCode.git
   cd CompCode/server
   npm install
   ```

2. **Create a `.env` file**:

   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   STRIPE_SECRET=your_stripe_secret_key
   STRIPE_WEBHOOK_SIGNING_SECRET=your_stripe_webhook_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   CLIENT_URL=http://localhost:3000
   SERVER_URL=http://localhost:4000
   ```

3. **Run the server**:

   ```bash
   npm start
   ```

---

### 💻 Client Setup

1. **Navigate to client**:

   ```bash
   cd ../client
   npm install
   ```

2. **Add a `.env` file**:

   ```env
   REACT_APP_SERVER_URL=http://localhost:4000
   REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

3. **Run the client**:

   ```bash
   npm run dev
   ```

---

## 🔄 Deployment Notes

- Deploy the **client** (React) to [Vercel](https://vercel.com/)
- Deploy the **server** (Express) to [Vercel](https://vercel.com/)
- Set up your Stripe Webhook URL to:
  ```
  https://your-backend-host.com/api/payment/webhook
  ```

---

## 📜 License

Distributed under the CC BY-NC-ND 4.0 License. See [LICENSE](LICENSE) for more information.
