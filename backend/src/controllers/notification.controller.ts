import { Request, Response } from "express";
import { NotificationService } from "../services/notification.service";

export class NotificationController {
  
  // Send notification to a specific user
  static async sendNotification(req: Request, res: Response): Promise<void> {
    try {
      const { receiverId, title, body } = req.body;
      const senderId = (req as any).user?.id || null;

      if (!receiverId || !title || !body) {
        res.status(400).json({ error: "Receiver ID, title, and body are required" });
        return;
      }

      const notification = await NotificationService.sendNotification(senderId, receiverId, title, body);
      
      res.status(201).json({
        success: true,
        message: "Notification sent successfully",
        data: notification
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Send notification to multiple users
  static async sendBulkNotification(req: Request, res: Response): Promise<void> {
    try {
      const { receiverIds, title, body } = req.body;
      const senderId = (req as any).user?.id || null;

      if (!receiverIds || !Array.isArray(receiverIds) || receiverIds.length === 0 || !title || !body) {
        res.status(400).json({ error: "Receiver IDs array, title, and body are required" });
        return;
      }

      const result = await NotificationService.sendBulkNotification(senderId, receiverIds, title, body);
      
      res.status(201).json({
        success: true,
        message: `${result.count} notifications sent successfully`
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Send notification to a specific batch
  static async sendBatchNotification(req: Request, res: Response): Promise<void> {
    try {
      const { batchId, title, body } = req.body;
      const senderId = (req as any).user?.id || null;

      if (!batchId || !title || !body) {
        res.status(400).json({ error: "Batch ID, title, and body are required" });
        return;
      }

      const result = await NotificationService.sendBatchNotification(senderId, batchId, title, body);
      
      res.status(201).json({
        success: true,
        message: `${result.count} notifications sent successfully`
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Create an announcement
  static async createAnnouncement(req: Request, res: Response): Promise<void> {
    try {
      const { title, content } = req.body;

      if (!title || !content) {
        res.status(400).json({ error: "Title and content are required" });
        return;
      }

      const announcement = await NotificationService.createAnnouncement(title, content);
      
      res.status(201).json({
        success: true,
        message: "Announcement created successfully",
        data: announcement
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Get user's notifications
  static async getUserNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const notifications = await NotificationService.getUserNotifications(userId);
      
      res.status(200).json({
        success: true,
        data: notifications
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Mark notification as read
  static async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      await NotificationService.markAsRead(id, userId);
      
      res.status(200).json({
        success: true,
        message: "Notification marked as read"
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Get announcements
  static async getAnnouncements(req: Request, res: Response): Promise<void> {
    try {
      const announcements = await NotificationService.getAnnouncements();
      
      res.status(200).json({
        success: true,
        data: announcements
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
