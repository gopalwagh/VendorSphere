# 🛍️ VendorSphere
 
> **A Production-Grade Multi-Vendor Marketplace Powered by an Agentic AI Business Copilot**
> *Transforming raw e-commerce data into actionable seller insights through real-time database aggregations, async background queues, and server-enforced tenant isolation.*
 
[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vendor-sphere-seven.vercel.app/)
[![Source Code](https://img.shields.io/badge/Source_Code-GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/gopalwagh/VendorSphere)

---

## 🎯 The Product Vision
 
Traditional e-commerce platforms overwhelm sellers with static tables, complex filters, and disjointed analytics dashboards. Small business owners often struggle to extract actionable insights — like identifying loss-making products, spotting low stock in time, or understanding profitability trends.
 
**VendorSphere solves this by replacing static dashboards with an Agentic AI Business Copilot.** Instead of manually digging through numbers, merchants can ask plain-language questions and get instant, data-backed answers grounded directly in live MongoDB aggregation pipelines — not canned reports.
 
---
 
## 💡 Traditional Marketplace vs. VendorSphere
 
| Feature | Traditional Marketplaces | VendorSphere Architecture |
| :--- | :--- | :--- |
| **Merchant Analytics** | Static tables & pre-baked charts | **ReAct Agent AI Copilot** executing live database queries on demand |
| **Data Security** | Client-side filtering or basic queries | **Server-Enforced Tenant Isolation** — the LLM never sees or controls tenant IDs |
| **Product Onboarding** | Synchronous bulk uploads causing UI freezes | **Asynchronous Job Queues (BullMQ + Redis)** for non-blocking ingestion |
| **Content Creation** | Manual product copywriting | **AI Description Optimizer** powered by Google Gemini |
| **Event Alerts** | Email-only or polling-based | **Real-time Push Notifications** via Firebase Cloud Messaging |
 
---
 
## 🔑 Platform Features
 
### 🏪 For Sellers — Merchant Empowerment
- **AI Business Copilot** — Ask plain-language questions about sales, profitability, and inventory and get instant, data-grounded answers.
- **Async Bulk Product Import** — Upload an Excel sheet of products; it's processed in the background via BullMQ without blocking the UI.
- **AI Catalog Optimizer** — Auto-generate product descriptions using Google Gemini.
- **FCM Real-Time Alerts** — Instant notifications for new orders, low-stock warnings, and store approval status.
- **Seller Analytics Dashboard** — Sales trends, top products, and category performance via MongoDB aggregation.
### 🛡️ For Super Admins — Platform Governance
- **Platform-Wide Copilot** — Query system-level metrics: total platform revenue, seller leaderboards, coupon effectiveness, and pending vendor approvals — all in plain language.
- **Merchant Approval Pipeline** — Review and approve/reject seller store applications.
- **Coupon Management** — Create and manage platform-wide discount coupons.
- **Role-Based Access Control (RBAC)** — Strict JWT-based session security separating Admin, Seller, and Customer scopes.
### 🛒 For Customers — Seamless Shopping
- **Multi-Vendor Browsing** — Category filtering, product search, reviews, and ratings across sellers.
- **Cart & Order Management** — Persistent cart, order history, and real-time order status tracking.
- **Secure Checkout** — Razorpay-integrated payment gateway with coupon support.

---

## 🤖 Business Copilot — Architecture & Security
 
The Business Copilot uses a **ReAct (Reasoning + Acting)** agent pattern built on **LlamaIndex** and **Google Gemini**. 
It dynamically selects and executes database tools based on natural-language queries, chaining multiple tool calls together for compound questions.
 
### 🔒 Server-Side Tenant Isolation
A critical vulnerability in LLM-powered systems is data leakage across tenants. VendorSphere enforces **zero-trust tenant isolation**:
1. The user's `userId` and `role` are extracted strictly from the verified JWT — never trusted from the request body.
2. When the ReAct Agent triggers a tool (e.g. `getSalesTrend`), the backend binds the authenticated `sellerId` into the MongoDB aggregation **server-side**, before the tool ever runs.
3. The LLM never receives, sees, or controls tenant identifiers — a seller can never see another seller's data, and prompt injection attempts to access another vendor's data have no identifier to inject.
Super Admins get a completely separate tool registry with platform-wide visibility, gated by role at the controller level.
 
### 🏗️ System Architecture

Below is the execution flow when a seller or admin sends a message to the Copilot:

```mermaid
flowchart TD
    A[Seller/Admin sends message] -->|1. POST /api/copilot/chat| B[Auth Middleware]
    B -->|2. Extract userId + role from JWT| C[Copilot Controller]
    C -->|3. Load recent history| D[(MongoDB: Conversation)]
    C -->|4. Pass query + history| E[ReAct Agent<br/>LlamaIndex + Gemini]
    E -->|5. Select tool based on query| F[Role-Scoped Tool Registry]
    F -->|6. Execute aggregation<br/>sellerId bound server-side| G[(MongoDB: Orders / Products)]
    G -->|7. Return raw data| E
    E -->|8. Loop for compound questions| F
    E -->|9. Synthesize final answer| C
    C -->|10. Respond to client| A
    C -.->|11. Queue chat log async| H[[BullMQ + Redis]]
    H -.->|12. Save turn| D
```

**Example questions it can answer:**
- "Compare my sales to last month — am I profitable?"
- "What's my best-selling product?"
- "Which products should I stop selling?"
- "How can I increase my sales?" *(for admins: "Which sellers are driving the most platform revenue?")*

---

## 🛠️ Tech Stack

| Category            | Technologies                                |
| -------------------- | -------------------------------------------- |
| **Frontend**         | React.js, CSS                                |
| **Backend**          | Node.js, Express.js                          |
| **Database**         | MongoDB, MongoDB Aggregation Pipelines       |
| **AI / Agentic Layer** | LlamaIndex (ReAct Agent), Google Gemini API |
| **Caching**           | Redis                                       |
| **Background Jobs**   | BullMQ                                      |
| **Authentication**    | JWT, HTTP-only Cookies, RBAC                |
| **Notifications**     | Firebase Cloud Messaging (FCM)              |
| **Media Storage**     | Cloudinary                                  |
| **Payments**          | Razorpay                                    |
| **API Testing**       | Postman                                     |
| **Version Control**   | Git, GitHub                                 |
| **Deployment**        | Vercel, Render                              |

---

## ⚙️ Getting Started

Follow these steps to run VendorSphere locally.

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local instance or Atlas)
- Redis (local instance or a hosted provider)
- A [Google Gemini API key](https://ai.google.dev/) (for the Business Copilot & AI description optimizer)
- Razorpay, Cloudinary, and Firebase project credentials

### 1. Clone the repository
```bash
git clone https://github.com/gopalwagh/VendorSphere.git
cd VendorSphere
```

### 2. Backend setup
```bash
cd server
npm install
```

Create a `.env` file inside `/server` with the following variables (values below are dummy placeholders — replace with your own):
```env
CLIENT_URL=http://localhost:5173
PORT=5000
MONGO_URI=mongodb+srv://dummyuser:dummypassword@cluster0.example.mongodb.net/vendorsphere?retryWrites=true&w=majority
JWT_SECRET=replace_with_a_strong_random_secret
JWT_REFRESH_SECRET=replace_with_a_different_strong_random_secret
JWT_EXPIRES_IN=7d
REDIS_URL=redis://localhost:6379
REDIS_PORT=6379
REDIS_HOST=localhost
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_app_password
SUPERADMIN_EMAIL=admin@example.com
SUPERADMIN_PASSWORD=replace_with_a_strong_password
GEMINI_API_KEY=your_gemini_api_key
GEMINI_API_KEY_DESCRIPTIONS=your_second_gemini_api_key_for_description_optimizer
```

Run the backend:
```bash
npm run dev
```

### 3. Frontend setup
Open a new terminal:
```bash
cd client
npm install
```

Create a `.env` file inside `/client` with the following variables:
```env
VITE_API_BASE_URL=http://localhost:5000/api/
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_FIREBASE_VAPID_KEY=your_firebase_vapid_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

Run the frontend:
```bash
npm run dev
```

### 4. Open the app
Visit `http://localhost:5173` in your browser.

---

## 🚀 Future Improvements

VendorSphere is actively evolving, with several advanced features planned for future releases.

### Real-Time Features
- 💬 Real-time buyer-seller chat for customer support and order-related queries (WebSockets)
- 📦 Live order status tracking

### Engineering Improvements
- 🐳 Docker containerization
- ⚖️ Horizontal scaling support

---

### 👨‍💻 Author: **Gopal Trimbak Wagh**

---

## 🙌 Support & Contribution

If you want to contribute, you’re most welcome!  
Also, don’t forget to ⭐ star this repo to show your support.
