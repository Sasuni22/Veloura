const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    product: {
      type: String,
      required: [true, 'Product name is required'],
    },
    productId: {
      type: String,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: 1,
      default: 1,
    },
    price: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'bank'],
      required: [true, 'Payment method is required'],
    },
    receiptImage: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate order number before saving
orderSchema.pre('validate', async function (next) {
  if (!this.isNew) return next();
  
  const year = new Date().getFullYear();
  const count = await mongoose.model('Order').countDocuments();
  const padded = String(count + 1).padStart(4, '0');
  this.orderNumber = `ORD-${year}-${padded}`;
  next();
});

module.exports = mongoose.model('Order', orderSchema);
