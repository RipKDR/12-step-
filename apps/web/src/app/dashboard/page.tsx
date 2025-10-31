"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";

// Mock data - in real app, this would come from tRPC
const mockData = {
  sponsees: [
    { id: "1", name: "Alex", program: "NA", lastActive: "2 hours ago", status: "active" },
    { id: "2", name: "Jordan", program: "AA", lastActive: "1 day ago", status: "active" },
    { id: "3", name: "Casey", program: "NA", lastActive: "3 days ago", status: "needs_attention" },
  ],
  recentActivity: [
    { id: "1", sponsee: "Alex", type: "step_entry", step: "Step 3", timestamp: "2 hours ago" },
    { id: "2", sponsee: "Jordan", type: "daily_log", timestamp: "4 hours ago" },
    { id: "3", sponsee: "Casey", type: "action_plan", plan: "Coping with stress", timestamp: "1 day ago" },
  ],
  cravingsData: [
    { date: "Mon", intensity: 3 },
    { date: "Tue", intensity: 5 },
    { date: "Wed", intensity: 2 },
    { date: "Thu", intensity: 4 },
    { date: "Fri", intensity: 1 },
    { date: "Sat", intensity: 3 },
    { date: "Sun", intensity: 2 },
  ],
  programDistribution: [
    { name: "NA", value: 2, color: "#0ea5e9" },
    { name: "AA", value: 1, color: "#22c55e" },
  ],
  weeklyProgress: [
    { day: "Mon", stepEntries: 3, dailyLogs: 2 },
    { day: "Tue", stepEntries: 1, dailyLogs: 4 },
    { day: "Wed", stepEntries: 2, dailyLogs: 3 },
    { day: "Thu", stepEntries: 4, dailyLogs: 1 },
    { day: "Fri", stepEntries: 2, dailyLogs: 3 },
    { day: "Sat", stepEntries: 1, dailyLogs: 2 },
    { day: "Sun", stepEntries: 3, dailyLogs: 4 },
  ],
};

export default function Dashboard() {
  const { data: session } = useSession();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {session?.user?.email}
          </h1>
          <p className="text-gray-600">Here's what's happening with your sponsees today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Sponsees</p>
                  <p className="text-2xl font-bold text-gray-900">{mockData.sponsees.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-success-100 rounded-lg">
                  <svg className="h-6 w-6 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Step Entries This Week</p>
                  <p className="text-2xl font-bold text-gray-900">16</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-warning-100 rounded-lg">
                  <svg className="h-6 w-6 text-warning-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Daily Logs This Week</p>
                  <p className="text-2xl font-bold text-gray-900">19</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-danger-100 rounded-lg">
                  <svg className="h-6 w-6 text-danger-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Needs Attention</p>
                  <p className="text-2xl font-bold text-gray-900">1</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cravings Trend */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">Cravings Intensity Trend</h3>
              <p className="text-sm text-gray-600">Average daily cravings intensity across all sponsees</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockData.cravingsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="intensity" 
                    stroke="#0ea5e9" 
                    strokeWidth={2}
                    dot={{ fill: "#0ea5e9", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Program Distribution */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">Program Distribution</h3>
              <p className="text-sm text-gray-600">Sponsees by recovery program</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mockData.programDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {mockData.programDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            <p className="text-sm text-gray-600">Latest updates from your sponsees</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <svg className="h-4 w-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      <span className="font-semibold">{activity.sponsee}</span> completed{" "}
                      {activity.type === "step_entry" && `Step ${activity.step}`}
                      {activity.type === "daily_log" && "daily log"}
                      {activity.type === "action_plan" && `action plan: ${activity.plan}`}
                    </p>
                    <p className="text-sm text-gray-500">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sponsees Overview */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">Your Sponsees</h3>
            <p className="text-sm text-gray-600">Overview of all your sponsees and their progress</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.sponsees.map((sponsee) => (
                <div key={sponsee.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">
                        {sponsee.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{sponsee.name}</p>
                      <p className="text-sm text-gray-500">{sponsee.program} • Last active {sponsee.lastActive}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={sponsee.status === "active" ? "success" : "warning"}
                    >
                      {sponsee.status === "active" ? "Active" : "Needs Attention"}
                    </Badge>
                    <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
