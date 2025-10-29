
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// This is a stub function. In a real application, you would implement a notification
// system (e.g., using Firebase Cloud Messaging, SendGrid for emails, etc.).
export const notifyOnReview = functions.firestore
  .document("reviews/{reviewId}")
  .onCreate(async (snap, context) => {
    const review = snap.data();
    const reviewId = context.params.reviewId;

    functions.logger.log(`New review created with ID: ${reviewId}`, review);

    try {
      // 1. Get the response document to find the participant's user ID
      const responseRef = admin.firestore().collection("responses").doc(review.responseId);
      const responseSnap = await responseRef.get();
      if (!responseSnap.exists) {
        functions.logger.error("Response document not found for review:", reviewId);
        return;
      }
      const participantId = responseSnap.data()?.userId;

      // 2. Get the participant's user document to get their notification token or email
      const userRef = admin.firestore().collection("users").doc(participantId);
      const userSnap = await userRef.get();
      if (!userSnap.exists) {
        functions.logger.error("Participant user document not found:", participantId);
        return;
      }
      const participant = userSnap.data();

      // 3. Send the notification
      functions.logger.log(`Notifying user ${participant?.email} about a new review from sponsor ${review.sponsorId}.`);

      // Example payload for FCM (Firebase Cloud Messaging)
      // const payload = {
      //   notification: {
      //     title: "New Sponsor Feedback",
      //     body: `Your sponsor has left a comment on one of your responses.`,
      //   }
      // };
      // await admin.messaging().sendToDevice(participant.fcmToken, payload);
    } catch (error) {
      functions.logger.error("Error sending notification for review:", reviewId, error);
    }
  });
