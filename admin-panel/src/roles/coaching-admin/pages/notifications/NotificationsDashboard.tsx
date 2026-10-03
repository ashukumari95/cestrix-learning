import React, { useState, useEffect } from "react";
import api from "../../../../api";
import { Bell, Send, CheckCircle, Clock, AlertCircle, Plus, Users, LayoutDashboard } from "lucide-react";

export default function NotificationsDashboard() {
  const [activeTab, setActiveTab] = useState<"compose" | "history">("compose");
  const [recipientType, setRecipientType] = useState<"all" | "batch" | "student">("all");
  
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  // To simulate fetching
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    fetchAnnouncements();
    if (recipientType === "student") {
      fetchStudents();
    }
    if (recipientType === "batch") {
      fetchBatches();
    }
  }, [recipientType]);

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get("/coaching/notifications/announcements");
      if (response.data.success) {
        setAnnouncements(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get("/coaching/users/students");
      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await api.get("/coaching/academic/batches");
      if (response.data.success) {
        setBatches(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch batches:", error);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;
    
    setIsSending(true);
    
    try {
      if (recipientType === "all") {
        await api.post("/coaching/notifications/announcements", { title, content: body });
      } else if (recipientType === "student" && selectedStudent) {
        await api.post("/coaching/notifications/send", { receiverId: selectedStudent, title, body });
      } else if (recipientType === "batch" && selectedBatch) {
        await api.post("/coaching/notifications/send-batch", { batchId: selectedBatch, title, body });
      }
      
      setTitle("");
      setBody("");
      alert("Notification sent successfully!");
      if (recipientType === "all") fetchAnnouncements();
    } catch (error) {
      console.error("Failed to send notification:", error);
      alert("Failed to send notification.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 ">Notifications Center</h1>
          <p className="text-slate-500 ">Broadcast announcements or message students directly</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100  p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("compose")}
          className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-colors ${
            activeTab === "compose"
              ? "bg-white  text-indigo-600  shadow-sm"
              : "text-slate-500  hover:text-slate-700 hover:bg-slate-200"
          }`}
        >
          <Send className="w-4 h-4" />
          Compose
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-colors ${
            activeTab === "history"
              ? "bg-white  text-indigo-600  shadow-sm"
              : "text-slate-500  hover:text-slate-700 hover:bg-slate-200"
          }`}
        >
          <Bell className="w-4 h-4" />
          History
        </button>
      </div>

      {activeTab === "compose" && (
        <div className="bg-white  rounded-xl border border-slate-200  shadow-sm p-6">
          <form onSubmit={handleSend} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Type Selection */}
              <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-700  mb-2">
                  Send To
                </label>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-slate-200  rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="radio"
                      name="recipientType"
                      value="all"
                      checked={recipientType === "all"}
                      onChange={(e) => setRecipientType(e.target.value as any)}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="ml-3">
                      <span className="block text-sm font-medium text-slate-900 ">All Students</span>
                      <span className="block text-xs text-slate-500 ">Broadcast announcement to everyone</span>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-3 border border-slate-200  rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="radio"
                      name="recipientType"
                      value="batch"
                      checked={recipientType === "batch"}
                      onChange={(e) => setRecipientType(e.target.value as any)}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="ml-3">
                      <span className="block text-sm font-medium text-slate-900 ">Specific Batch</span>
                      <span className="block text-xs text-slate-500 ">Send to a specific class or batch</span>
                    </div>
                  </label>

                  <label className="flex items-center p-3 border border-slate-200  rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="radio"
                      name="recipientType"
                      value="student"
                      checked={recipientType === "student"}
                      onChange={(e) => setRecipientType(e.target.value as any)}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="ml-3">
                      <span className="block text-sm font-medium text-slate-900 ">Single Student</span>
                      <span className="block text-xs text-slate-500 ">Direct message to a student</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Compose Area */}
              <div className="col-span-1 md:col-span-2 space-y-4">
                {recipientType === "student" && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700  mb-1">
                      Select Student
                    </label>
                    <select
                      value={selectedStudent}
                      onChange={(e) => setSelectedStudent(e.target.value)}
                      className="w-full bg-white  border border-slate-200  rounded-lg px-4 py-2.5 text-slate-900  focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select a student...</option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.user?.firstName} {s.user?.lastName} ({s.user?.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {recipientType === "batch" && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700  mb-1">
                      Select Batch
                    </label>
                    <select
                      value={selectedBatch}
                      onChange={(e) => setSelectedBatch(e.target.value)}
                      className="w-full bg-white  border border-slate-200  rounded-lg px-4 py-2.5 text-slate-900  focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select a batch...</option>
                      {batches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700  mb-1">
                    Subject / Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="E.g., Holiday Notice, Fee Reminder"
                    className="w-full bg-white  border border-slate-200  rounded-lg px-4 py-2.5 text-slate-900  focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700  mb-1">
                    Message Content
                  </label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={6}
                    placeholder="Type your message here..."
                    className="w-full bg-white  border border-slate-200  rounded-lg px-4 py-2.5 text-slate-900  focus:ring-2 focus:ring-indigo-500 resize-none"
                    required
                  ></textarea>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={
                      isSending || 
                      (recipientType === "student" && !selectedStudent) ||
                      (recipientType === "batch" && !selectedBatch)
                    }
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSending ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Send {recipientType === "all" ? "Announcement" : "Notification"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {activeTab === "history" && (
        <div className="bg-white  rounded-xl border border-slate-200  shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 ">
            <h2 className="text-lg font-semibold text-slate-900 ">Recent Announcements</h2>
            <p className="text-sm text-slate-500 ">Broadcasts sent to all students</p>
          </div>
          <div className="divide-y divide-slate-200 ">
            {announcements.length > 0 ? (
              announcements.map((announcement) => (
                <div key={announcement.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-slate-900 ">{announcement.title}</h3>
                    <span className="text-xs text-slate-500  flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600  whitespace-pre-wrap">{announcement.content}</p>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <div className="w-12 h-12 bg-slate-100  rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900  mb-1">No announcements yet</h3>
                <p className="text-slate-500 ">Create one from the Compose tab</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
