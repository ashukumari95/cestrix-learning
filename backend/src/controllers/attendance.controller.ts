import { Request, Response } from 'express';
import { AttendanceService } from '../services/attendance.service';

const attendanceService = new AttendanceService();

export const getBatchAttendance = async (req: Request, res: Response) => {
  try {
    const { batchId } = req.params;
    const { date } = req.query; // expect YYYY-MM-DD
    
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const records = await attendanceService.getBatchAttendance(String(batchId), String(date));
    res.json(records);
  } catch (error) {
    console.error('Error in getBatchAttendance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markBatchAttendance = async (req: Request, res: Response) => {
  try {
    const { batchId } = req.params;
    const { date, records } = req.body;
    
    if (!date || !records) {
      return res.status(400).json({ error: 'Date and records are required' });
    }

    const updated = await attendanceService.markBatchAttendance(String(batchId), String(date), records);
    res.json({ success: true, updatedCount: updated.length });
  } catch (error) {
    console.error('Error in markBatchAttendance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAttendanceStats = async (req: Request, res: Response) => {
  try {
    const organizationId = (req as any).user?.organizationId;
    const { date } = req.query; // expect YYYY-MM-DD

    if (!organizationId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const stats = await attendanceService.getAttendanceStats(organizationId, String(date));
    res.json(stats);
  } catch (error) {
    console.error('Error in getAttendanceStats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
