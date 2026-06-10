const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
// Note: We use process.env values, or fallback placeholders if they haven't been added yet
const getRazorpayInstance = () => {
  const key_id = (process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder').trim();
  const key_secret = (process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder').trim();
  
  console.log('Razorpay Init Key ID:', key_id);
  console.log('Razorpay Init Secret Length:', key_secret.length);
  console.log('Is valid test key format:', key_id.startsWith('rzp_test_'));

  return new Razorpay({
    key_id: key_id,
    key_secret: key_secret,
  });
};

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount is required' });
    }

    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };

    const instance = getRazorpayInstance();
    const order = await instance.orders.create(options);

    res.status(200).json({
      success: true,
      order,
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder'
    });
  } catch (error) {
    console.error('Razorpay Create Order Error:', error);
    res.status(500).json({ success: false, message: 'Could not create payment order' });
  }
};

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const secret = (process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder').trim();

    // Create HMAC to verify signature
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    res.status(200).json({ success: true, message: 'Payment verified successfully' });
  } catch (error) {
    console.error('Razorpay Verify Error:', error);
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
};
