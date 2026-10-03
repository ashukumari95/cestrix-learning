import prisma from "../config/prisma";

export class NotificationService {
  // Send a notification to a specific user
  static async sendNotification(senderId: string | null, receiverId: string, title: string, body: string) {
    return prisma.notification.create({
      data: {
        senderId,
        receiverId,
        title,
        body,
        isRead: false
      }
    });
  }

  // Send a notification to multiple users
  static async sendBulkNotification(senderId: string | null, receiverIds: string[], title: string, body: string) {
    const data = receiverIds.map(id => ({
      senderId,
      receiverId: id,
      title,
      body,
      isRead: false
    }));

    return prisma.notification.createMany({
      data
    });
  }

  // Send notification to a specific batch
  static async sendBatchNotification(senderId: string | null, batchId: string, title: string, body: string) {
    const studentBatches = await prisma.studentBatch.findMany({
      where: { batchId },
      include: {
        student: {
          select: { userId: true }
        }
      }
    });

    const receiverIds = studentBatches.map(sb => sb.student.userId);

    if (receiverIds.length === 0) {
      return { count: 0 };
    }

    const data = receiverIds.map(id => ({
      senderId,
      receiverId: id,
      title,
      body,
      isRead: false
    }));

    return prisma.notification.createMany({
      data
    });
  }

  // Create an announcement (broadcast)
  static async createAnnouncement(title: string, content: string) {
    return prisma.announcement.create({
      data: {
        title,
        content
      }
    });
  }

  // Get notifications for a user
  static async getUserNotifications(userId: string) {
    return prisma.notification.findMany({
      where: {
        receiverId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // Mark notification as read
  static async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: {
        id: notificationId,
        receiverId: userId
      },
      data: {
        isRead: true
      }
    });
  }

  // Get announcements
  static async getAnnouncements() {
    return prisma.announcement.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
}
