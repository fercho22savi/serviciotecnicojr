const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// ✅ Asignar rol de administrador a un usuario
exports.setAdminRole = functions.https.onCall(async (data, context) => {
  // Verificar que quien llama sea administrador
  // Esto es CRUCIAL para la seguridad. Solo los admins pueden asignar roles.
  if (context.auth?.token?.role !== "admin") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Solo los administradores pueden cambiar roles."
    );
  }

  // Obtener el UID del usuario y el rol a asignar desde la app cliente
  const { uid, role } = data;

  try {
    // Usar el Admin SDK para establecer la "custom claim" (rol) en el usuario
    await admin.auth().setCustomUserClaims(uid, { role });
    // Devolver un mensaje de éxito
    return { message: `Rol '${role}' asignado correctamente al usuario ${uid}` };
  } catch (error) {
    // Manejar cualquier error que pueda ocurrir
    throw new functions.https.HttpsError(
      "unknown", 
      "Error al asignar el rol.", 
      error
    );
  }
});
