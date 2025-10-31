"use client";

import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { trpc } from "@/lib/trpc/client";
import { format, parseISO } from "date-fns";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function SponseeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sponseeId = params.id as string;

  const { data: sharedContent, isLoading } = trpc.sponsor.getSharedContent.useQuery({
    sponseeId,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!sharedContent) {
    return (
      <DashboardLayout>
        <EmptyState
          title="No Shared Content"
          description="This sponsee hasn't shared any content with you yet."
          action={
            <button
              onClick={() => router.push("/sponsees")}
              className="btn btn-primary"
            >
              Back to Sponsees
            </button>
          }
        />
      </DashboardLayout>
    );
  }

  // Process daily entries for charts
  const cravingsData = sharedContent.daily_entries
    .map(entry => ({
      date: format(parseISO(entry.entry_date), "MMM d"),
      intensity: entry.cravings_intensity,
    }))
    .reverse();

  const feelingsData = sharedContent.daily_entries.reduce((acc: Record<string, number>, entry) => {
    entry.feelings.forEach((feeling: string) => {
      acc[feeling] = (acc[feeling] || 0) + 1;
    });
    return acc;
  }, {});

  const feelingsChartData = Object.entries(feelingsData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const triggersData = sharedContent.daily_entries.reduce((acc: Record<string, number>, entry) => {
    entry.triggers.forEach((trigger: string) => {
      acc[trigger] = (acc[trigger] || 0) + 1;
    });
    return acc;
  }, {});

  const triggersChartData = Object.entries(triggersData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => router.push("/sponsees")}
              className="text-sm text-gray-600 hover:text-gray-900 mb-2 flex items-center"
            >
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Sponsees
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Sponsee Details</h1>
            <p className="text-gray-600">Review shared recovery content and progress</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Step Entries</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {sharedContent.step_entries.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-success-100 rounded-lg">
                  <svg className="h-6 w-6 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Daily Entries</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {sharedContent.daily_entries.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-warning-100 rounded-lg">
                  <svg className="h-6 w-6 text-warning-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Action Plans</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {sharedContent.action_plans.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        {sharedContent.daily_entries.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cravings Trend */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900">Cravings Intensity Trend</h3>
                <p className="text-sm text-gray-600">Daily cravings intensity over time</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={cravingsData}>
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

            {/* Feelings Distribution */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900">Top Feelings</h3>
                <p className="text-sm text-gray-600">Most frequently reported feelings</p>
              </CardHeader>
              <CardContent>
                {feelingsChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={feelingsChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#22c55e" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">No feelings data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Triggers Chart */}
        {sharedContent.daily_entries.length > 0 && triggersChartData.length > 0 && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">Top Triggers</h3>
              <p className="text-sm text-gray-600">Most frequently reported triggers</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={triggersChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Step Work Entries */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">Step Work</h3>
            <p className="text-sm text-gray-600">Shared step entries from recovery work</p>
          </CardHeader>
          <CardContent>
            {sharedContent.step_entries.length > 0 ? (
              <div className="space-y-4">
                {sharedContent.step_entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="primary">
                            Step {entry.steps?.step_number || '?'}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {entry.steps?.title || 'Unknown Step'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Version {entry.version} • Updated {format(parseISO(entry.updated_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-700">
                      <p className="font-medium mb-2">Content:</p>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <pre className="whitespace-pre-wrap text-sm">
                          {JSON.stringify(entry.content, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No Step Work Shared"
                description="This sponsee hasn't shared any step work entries yet."
              />
            )}
          </CardContent>
        </Card>

        {/* Daily Entries */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">Daily Logs</h3>
            <p className="text-sm text-gray-600">Shared daily recovery entries</p>
          </CardHeader>
          <CardContent>
            {sharedContent.daily_entries.length > 0 ? (
              <div className="space-y-4">
                {sharedContent.daily_entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {format(parseISO(entry.entry_date), "MMMM d, yyyy")}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={entry.cravings_intensity >= 7 ? "danger" : entry.cravings_intensity >= 4 ? "warning" : "success"}>
                            Cravings: {entry.cravings_intensity}/10
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {entry.feelings.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-1">Feelings</p>
                          <div className="flex flex-wrap gap-1">
                            {entry.feelings.map((feeling: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {feeling}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {entry.triggers.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-1">Triggers</p>
                          <div className="flex flex-wrap gap-1">
                            {entry.triggers.map((trigger: string, idx: number) => (
                              <Badge key={idx} variant="warning" className="text-xs">
                                {trigger}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {entry.coping_actions.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-1">Coping Actions</p>
                          <div className="flex flex-wrap gap-1">
                            {entry.coping_actions.map((action: string, idx: number) => (
                              <Badge key={idx} variant="success" className="text-xs">
                                {action}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {entry.gratitude && (
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-1">Gratitude</p>
                          <p className="text-sm text-gray-700">{entry.gratitude}</p>
                        </div>
                      )}
                    </div>

                    {entry.notes && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs font-medium text-gray-600 mb-1">Notes</p>
                        <p className="text-sm text-gray-700">{entry.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No Daily Logs Shared"
                description="This sponsee hasn't shared any daily log entries yet."
              />
            )}
          </CardContent>
        </Card>

        {/* Action Plans */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">Action Plans</h3>
            <p className="text-sm text-gray-600">Shared action plans for managing triggers</p>
          </CardHeader>
          <CardContent>
            {sharedContent.action_plans.length > 0 ? (
              <div className="space-y-4">
                {sharedContent.action_plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{plan.title}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Updated {format(parseISO(plan.updated_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>

                    {plan.situation && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-600 mb-1">Situation</p>
                        <p className="text-sm text-gray-700">{plan.situation}</p>
                      </div>
                    )}

                    {plan.if_then && plan.if_then.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-medium text-gray-600 mb-2">If-Then Plans</p>
                        <div className="space-y-2">
                          {plan.if_then.map((item: any, idx: number) => (
                            <div key={idx} className="bg-gray-50 p-3 rounded-md">
                              <p className="text-sm font-medium text-gray-900">If: {item.condition}</p>
                              <p className="text-sm text-gray-700 mt-1">Then: {item.action}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {plan.emergency_contacts && plan.emergency_contacts.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-medium text-gray-600 mb-2">Emergency Contacts</p>
                        <div className="space-y-1">
                          {plan.emergency_contacts.map((contact: any, idx: number) => (
                            <div key={idx} className="text-sm text-gray-700">
                              <span className="font-medium">{contact.name}</span> - {contact.phone} ({contact.relationship})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No Action Plans Shared"
                description="This sponsee hasn't shared any action plans yet."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
