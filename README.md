# 🛍️ VendorSphere

> **A multi-vendor marketplace platform with an agentic AI Business Copilot — combining secure authentication, asynchronous background processing, real-time notifications, LLM-powered merchant analytics, and online payment integration.**

VendorSphere is a full-stack marketplace platform that enables **Customers**, **Sellers**, and **Super Admins** to seamlessly manage products, orders, payments, and notifications through a secure and intuitive interface.

Unlike a traditional CRUD application, VendorSphere incorporates production-oriented backend concepts such as **JWT Authentication**, **Redis**, **BullMQ**, **Firebase Cloud Messaging (FCM)**, **MongoDB Aggregation Pipelines**, **Cloudinary**, **Razorpay**, and an **agentic AI layer built on LlamaIndex and Google Gemini** to improve reliability, responsiveness, and merchant decision-making.

---

## 🚀 Key Highlights

- 🛒 Multi-Vendor Marketplace
- 🔐 JWT Authentication (Access & Refresh Tokens)
- 👥 Role-Based Access Control (RBAC)
- 🤖 **Agentic AI Business Copilot** — natural-language sales, profitability, and inventory insights for sellers and admins
- 📦 **Bulk Product Import from Excel**(100+) — processed asynchronously via BullMQ, no UI blocking
- ✍️ **AI Product Description Optimizer and tags generation** — Gemini-powered catalog copy generation
- ⚡ Redis Caching
- 🔄 BullMQ Background Job Processing
- 🔔 Firebase Cloud Messaging (FCM) — real-time order, approval, and stock alerts
- 💳 Razorpay Payment Gateway Integration
- ☁️ Cloudinary Media Management
- 📊 Seller & Admin Analytics Dashboards
- 📈 MongoDB Aggregation Pipelines
- 🌐 RESTful API Architecture
- 📱 Responsive React User Interface

---

## 🤖 Business Copilot — Agentic AI Layer

VendorSphere's Business Copilot lets sellers and super admins ask plain-language questions about their business and get answers grounded in real, live database data — not canned reports.

**How it works:**
- Built with a **ReAct (Reasoning + Acting) agent** via **LlamaIndex**, powered by **Google Gemini**.
- The agent has access to a set of scoped analytics tools (sales trends, profitability analysis, top-selling products, inventory status, category breakdowns, customer insights) and decides autonomously which tools to call — including chaining multiple tool calls together for compound questions like *"Am I profitable this month, and if not, which product should I drop?"*
- **Strict tenant isolation**: a seller's identity is bound server-side to their tools before the agent ever runs — the LLM never receives or controls whose data it's querying, so one seller can never see another seller's numbers.
- Super Admins get a separate tool set with platform-wide visibility — revenue, seller leaderboards, coupon effectiveness, and pending seller approvals.
- Conversation history is persisted per user so the Copilot maintains context across a session.

# **System Architecture**

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

1. Seller/admin sends a natural-language question through the chat UI.
2. Auth middleware verifies the JWT and extracts `userId` and `role` — never trusted from the request body.
3. The controller loads the last N turns of conversation history from MongoDB.
4. The query and history are handed to the ReAct agent, along with a **role-specific tool set** (seller tools vs. admin tools). 
5. The agent reasons about which tool(s) it needs,
6. The tool executes a MongoDB aggregation — with `sellerId` bound server-side, not supplied by the LLM.
7. Results flow back to the agent,
8. Which may call additional tools for compound, multi-part questions.
9. The agent synthesizes a final natural-language answer
10. The answer is returned to the client immediately.
11. In parallel, the turn is queued via BullMQ
12. Saved to MongoDB asynchronously — the user never waits on this write.

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

## 🌐 Live Demo

https://vendor-sphere-seven.vercel.app/

---

### 👨‍💻 Author: **Gopal Trimbak Wagh**

---

## 🙌 Support & Contribution

If you want to contribute, you’re most welcome!  
Also, don’t forget to ⭐ star this repo to show your support.
