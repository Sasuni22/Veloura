# ZaraStyle — Modern Online Clothing Store

A full-stack eCommerce web application for an online clothing store, built with React + Node.js.

---

## 🎨 Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| `primary` | `#EA7B7B` | Accents, hover states |
| `primary-dark` | `#D25353` | Buttons, CTAs |
| `primary-darker` | `#9E3B3B` | Dark hover states |
| `cream` | `#FFEAD3` | Backgrounds, cards |

---

## 📁 Project Structure

```
zarastyle/
├── frontend/                  # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Sticky responsive navbar
│   │   │   ├── Footer.jsx         # Footer with newsletter
│   │   │   ├── ProductCard.jsx    # Hover + quick-order card
│   │   │   └── ExitIntentPopup.jsx # Exit popup with offers
│   │   ├── pages/
│   │   │   ├── HomePage.jsx       # Hero + featured + categories
│   │   │   ├── ProductPage.jsx    # Product detail with images
│   │   │   ├── OrderPage.jsx      # Full checkout form
│   │   │   ├── OrderSuccessPage.jsx # Order confirmation
│   │   │   └── AdminOrdersPage.jsx  # Admin order management
│   │   ├── services/
│   │   │   └── api.js             # Axios API service
│   │   ├── data/
│   │   │   └── products.js        # Sample product data
│   │   ├── App.jsx                # Router + layout
│   │   └── main.jsx               # Entry point
│   ├── index.html
│   ├── tailwind.config.js         # Custom color tokens
│   ├── vite.config.js             # Proxy to backend
│   └── package.json
│
└── backend/                   # Node.js + Express
    ├── config/
    │   └── db.js               # MongoDB Atlas connection
    ├── controllers/
    │   └── orderController.js  # CRUD order logic
    ├── middleware/
    │   └── upload.js           # Multer receipt upload
    ├── models/
    │   └── Order.js            # Mongoose order schema
    ├── routes/
    │   └── orderRoutes.js      # Express routes
    ├── uploads/
    │   └── receipts/           # Uploaded receipt images
    ├── server.js               # Express entry point
    ├── .env                    # Environment variables
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)
- npm or yarn

---

### 1. Clone / Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user
4. Get your connection string (looks like: `mongodb+srv://user:password@cluster.mongodb.net/`)

---

### 2. Backend Setup

```bash
cd zarastyle/backend

# Install dependencies
npm install

# Edit .env file
nano .env
```

Update `.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/zarastyle?retryWrites=true&w=majority
NODE_ENV=development
```

```bash
# Start backend (development)
npm run dev

# Or start production
npm start
```

Backend runs on: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd zarastyle/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 🌐 Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | HomePage | Hero, categories, featured products |
| `/product/:id` | ProductPage | Product detail, size/color selector |
| `/order/:id` | OrderPage | Full checkout form |
| `/order-success` | OrderSuccessPage | Confirmation screen |
| `/admin/orders` | AdminOrdersPage | Admin dashboard + order table |

---

## 📡 API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| `POST` | `/api/orders` | Create new order (multipart/form-data) |
| `GET` | `/api/orders` | Get all orders |
| `GET` | `/api/orders/:id` | Get single order by MongoDB ID |
| `PATCH` | `/api/orders/:id/status` | Update order status |
| `GET` | `/api/health` | API health check |

### POST /api/orders — Request Body (multipart/form-data)

| Field | Type | Required |
|-------|------|----------|
| `name` | string | ✅ |
| `email` | string | ✅ |
| `address` | string | ✅ |
| `phone` | string | ✅ |
| `product` | string | ✅ |
| `quantity` | number | ✅ |
| `price` | number | ✅ |
| `totalAmount` | number | ✅ |
| `paymentMethod` | `cod` or `bank` | ✅ |
| `receiptImage` | file | Required if `bank` |
| `notes` | string | ❌ |

---

## 🗃️ MongoDB Schema

```js
{
  orderNumber: String,      // Auto: ORD-2026-0001
  name: String,
  email: String,
  address: String,
  phone: String,
  product: String,
  productId: String,
  quantity: Number,
  price: Number,
  totalAmount: Number,
  paymentMethod: 'cod' | 'bank',
  receiptImage: String,     // filename in uploads/receipts/
  notes: String,
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  createdAt: Date,
  updatedAt: Date,
}
```

---

## ✨ Features

- **Homepage**: Animated hero, category grid, featured products, newsletter
- **Product Page**: Image gallery, color/size picker, quantity selector
- **Order Form**: Full customer + payment form with COD / Bank Transfer
- **Receipt Upload**: Multer-powered file upload stored in `uploads/receipts/`
- **Exit Intent Popup**: Detects cursor leaving screen, shows 30% off offers
- **Admin Panel**: `/admin/orders` — table with search, status updates, receipt preview
- **Auto Order Number**: Format `ORD-2026-0001`, generated server-side
- **Animations**: Framer Motion on all pages, hover effects, page transitions
- **Toast Notifications**: react-hot-toast for success/error feedback
- **Responsive**: Mobile-first design with Tailwind CSS

---

## 🏗️ Build for Production

```bash
# Frontend build
cd frontend
npm run build

# Backend stays as Node process
cd backend
npm start
```

---

## 📦 Dependencies Summary

### Frontend
- `react` + `react-dom` — UI framework
- `react-router-dom` — Client-side routing
- `framer-motion` — Animations
- `axios` — HTTP client
- `react-hot-toast` — Toast notifications
- `tailwindcss` — Utility CSS

### Backend
- `express` — Web server
- `mongoose` — MongoDB ODM
- `multer` — File uploads
- `cors` — Cross-origin headers
- `dotenv` — Environment variables
