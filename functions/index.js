const admin = require("firebase-admin");
const functions = require("firebase-functions");

admin.initializeApp();

// Helper function to check for Admin role
const ensureAdmin = (context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }
  // You might want to enable this check in production
  // if (context.auth.token.role !== 'Admin') {
  //   throw new functions.https.HttpsError('permission-denied', 'Must be an administrative user to perform this action.');
  // }
};

// --- User Management Functions ---
exports.createUser = functions.https.onCall(async (data, context) => {
  ensureAdmin(context);
  if (!data.email || !data.password || !data.displayName) {
    throw new functions.https.HttpsError("invalid-argument", "Missing required fields.");
  }
  try {
    const userRecord = await admin.auth().createUser({ email: data.email, password: data.password, displayName: data.displayName, emailVerified: true });
    const role = data.role || "Miembro";
    await admin.auth().setCustomUserClaims(userRecord.uid, { role });
    return { uid: userRecord.uid };
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      throw new functions.https.HttpsError('already-exists', 'Email is already in use.');
    }
    throw new functions.https.HttpsError("internal", error.message, error);
  }
});

exports.listUsers = functions.https.onCall(async (data, context) => {
  ensureAdmin(context);
  try {
    const listUsersResult = await admin.auth().listUsers(1000);
    return { users: listUsersResult.users.map(u => ({ uid: u.uid, email: u.email, displayName: u.displayName, customClaims: u.customClaims, disabled: u.disabled })) };
  } catch (error) {
    throw new functions.https.HttpsError("internal", "Error listing users.", error);
  }
});

exports.updateUserRole = functions.https.onCall(async (data, context) => {
  ensureAdmin(context);
  if (!data.uid || !data.role) {
    throw new functions.https.HttpsError("invalid-argument", "UID and role are required.");
  }
  try {
    await admin.auth().setCustomUserClaims(data.uid, { role: data.role });
    return { message: `Role updated for user ${data.uid}` };
  } catch (error) {
    throw new functions.https.HttpsError("internal", "Error updating user role.", error);
  }
});

exports.deleteUser = functions.https.onCall(async (data, context) => {
  ensureAdmin(context);
  if (!data.uid) {
    throw new functions.https.HttpsError("invalid-argument", "UID is required.");
  }
  try {
    await admin.auth().deleteUser(data.uid);
    return { message: `Successfully deleted user ${data.uid}` };
  } catch (error) {
    throw new functions.https.HttpsError("internal", "Error deleting user.", error);
  }
});

// --- Coupon Management Functions ---
const db = admin.firestore();

exports.listCoupons = functions.https.onCall(async (data, context) => {
    ensureAdmin(context);
    try {
        const snapshot = await db.collection('coupons').orderBy('createdAt', 'desc').get();
        const coupons = snapshot.docs.map(doc => {
            const docData = doc.data();
            // Convert Firestore Timestamps to ISO strings
            return {
                id: doc.id,
                ...docData,
                expiresAt: docData.expiresAt ? docData.expiresAt.toDate().toISOString() : null,
                createdAt: docData.createdAt ? docData.createdAt.toDate().toISOString() : null,
            };
        });
        return { coupons };
    } catch (error) {
        console.error("Error listing coupons:", error);
        throw new functions.https.HttpsError("internal", "Failed to list coupons.");
    }
});

exports.createCoupon = functions.https.onCall(async (data, context) => {
    ensureAdmin(context);
    try {
        const { code, discountType, discountValue, expiresAt } = data;
        const newCoupon = {
            code,
            discountType,
            discountValue: Number(discountValue),
            expiresAt: expiresAt ? admin.firestore.Timestamp.fromDate(new Date(expiresAt)) : null,
            isActive: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        const docRef = await db.collection('coupons').add(newCoupon);
        return { id: docRef.id };
    } catch (error) {
        console.error("Error creating coupon:", error);
        throw new functions.https.HttpsError("internal", "Failed to create coupon.");
    }
});

exports.updateCoupon = functions.https.onCall(async (data, context) => {
    ensureAdmin(context);
    const { id, ...updateData } = data;
    if (!id) {
        throw new functions.https.HttpsError("invalid-argument", "Coupon ID is required.");
    }
    try {
        const couponRef = db.collection('coupons').doc(id);
        // Handle date conversion if expiresAt is passed
        if (updateData.expiresAt) {
            updateData.expiresAt = admin.firestore.Timestamp.fromDate(new Date(updateData.expiresAt));
        }
         if (typeof updateData.discountValue !== 'undefined') {
            updateData.discountValue = Number(updateData.discountValue);
        }

        await couponRef.update(updateData);
        return { message: "Coupon updated successfully." };
    } catch (error) {
        console.error("Error updating coupon:", error);
        throw new functions.https.HttpsError("internal", "Failed to update coupon.");
    }
});
