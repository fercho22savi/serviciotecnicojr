const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")(functions.config().stripe.secret);
const cors = require("cors");

admin.initializeApp();

const corsHandler = cors({ origin: true });

exports.createPaymentIntent = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    const { amount, currency } = req.body;

    if (amount === undefined || !currency) {
      functions.logger.error("Request body missing amount or currency", { body: req.body });
      return res.status(400).send({ error: "Missing 'amount' and/or 'currency' in request body." });
    }

    // --- Stripe Amount Logic ---
    // Stripe expects the amount in the smallest currency unit.
    // For USD, this is cents. For COP, it's the base unit.
    let finalAmount;
    if (currency.toLowerCase() === 'usd') {
      // Convert dollars to cents and ensure it's an integer
      finalAmount = Math.round(amount * 100);
    } else {
      finalAmount = Math.round(amount); // For COP, just ensure it's an integer
    }
    
    functions.logger.info(`Processing payment: Amount=${amount}, Currency=${currency}, FinalAmountForStripe=${finalAmount}`);

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: finalAmount,
        currency: currency,
        payment_method_types: ['card'],
      });

      return res.status(200).send({ clientSecret: paymentIntent.client_secret });

    } catch (error) {
      functions.logger.error("Error creating Stripe PaymentIntent:", { 
        errorMessage: error.message,
        currency: currency,
        originalAmount: amount,
        finalAmount: finalAmount
      });
      return res.status(500).send({ error: `An error occurred while creating the PaymentIntent: ${error.message}` });
    }
  });
});

exports.applyCoupon = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  const { couponCode } = req.body;

  if (!couponCode) {
    return res.status(400).send({ error: "Missing 'couponCode' in request body." });
  }

  try {
    const couponsRef = admin.firestore().collection("coupons");
    const snapshot = await couponsRef.where("code", "==", couponCode).limit(1).get();

    if (snapshot.empty) {
      return res.status(404).send({ error: "El código de cupón no es válido." });
    }

    const couponDoc = snapshot.docs[0];
    const couponData = couponDoc.data();

    if (!couponData.isActive) {
      return res.status(400).send({ error: "Este cupón ya no está activo." });
    }

    return res.status(200).send({ data: couponData });

  } catch (error) {
    console.error("Error applying coupon:", error);
    return res.status(500).send({ error: "Ocurrió un error al aplicar el cupón." });
  }
});
