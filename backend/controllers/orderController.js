const Order = require('../models/Order');
const path = require('path');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res) => {
  try {
    const {
      name,
      email,
      address,
      phone,
      product,
      productId,
      quantity,
      price,
      totalAmount,
      paymentMethod,
      notes,
    } = req.body;

    // Validate required fields
    if (!name || !email || !address || !phone || !product || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields',
      });
    }

    // If bank deposit, receipt is required
    if (paymentMethod === 'bank' && !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Bank receipt is required for bank deposit payment',
      });
    }

    const orderData = {
      name,
      email,
      address,
      phone,
      product,
      productId: productId || '',
      quantity: parseInt(quantity) || 1,
      price: parseFloat(price) || 0,
      totalAmount: parseFloat(totalAmount) || 0,
      paymentMethod,
      notes: notes || '',
      receiptImage: req.file ? req.file.filename : null,
    };

    const order = new Order(orderData);
    await order.save();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: order,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Public (in production, add auth middleware)
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Public
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }
    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus };
