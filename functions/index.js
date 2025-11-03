
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")(functions.config().stripe.secret);
const cors = require("cors")({ origin: true });

admin.initializeApp();

exports.createPaymentIntent = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { amount, currency } = req.body;

    if (!amount || !currency) {
      return res.status(400).send({ error: "Missing 'amount' and 'currency' in request body." });
    }

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
      });

      return res.status(200).send({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      console.error("Error creating PaymentIntent:", error);
      return res.status(500).send({ error: "An error occurred while creating the PaymentIntent." });
    }
  });
});

exports.applyCoupon = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { couponCode } = req.body;

    if (!couponCode) {
      return res.status(400).send({ error: "Missing 'couponCode' in request body." });
    }

    try {
      // Corrected query: Search for the coupon by the 'code' field
      const couponsRef = admin.firestore().collection("coupons");
      const snapshot = await couponsRef.where("code", "==", couponCode).limit(1).get();

      if (snapshot.empty) {
        return res.status(404).send({ error: "El código de cupón no es válido." });
      }

      const couponDoc = snapshot.docs[0];

      // Optionally, you can add more validation logic here, e.g., check isActive flag, expiry date, etc.
      if (!couponDoc.data().isActive) {
        return res.status(400).send({ error: "Este cupón ya no está activo." });
      }

      return res.status(200).send({ data: couponDoc.data() });

    } catch (error) {
      console.error("Error applying coupon:", error);
      return res.status(500).send({ error: "Ocurrió un error al aplicar el cupón." });
    }
  });
});
