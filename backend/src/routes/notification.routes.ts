import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

const router = Router();

// Protect all routes
router.use(requireAuth);

// User facing routes
router.get("/me", NotificationController.getUserNotifications);
router.put("/:id/read", NotificationController.markAsRead);
router.get("/announcements", NotificationController.getAnnouncements);

// Admin / Teacher routes
router.use(requireRole(["SUPER_ADMIN", "COACHING_ADMIN", "TEACHER"]));

router.post("/send", NotificationController.sendNotification);
router.post("/send-bulk", NotificationController.sendBulkNotification);
router.post("/send-batch", NotificationController.sendBatchNotification);
router.post("/announcements", NotificationController.createAnnouncement);

export default router;
