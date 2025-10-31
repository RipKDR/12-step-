"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { trpc } from "@/lib/trpc/client";
import { format } from "date-fns";

export default function SponseesPage() {
  const { data: session } = useSession();

  const { data: relationships, isLoading } = trpc.sponsor.listRelationships.useQuery({
    asSponsor: true,
    asSponsee: false,
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

  const activeRelationships = relationships?.filter(r => r.status === "active") || [];
  const pendingRelationships = relationships?.filter(r => r.status === "pending") || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Sponsees</h1>
          <p className="text-gray-600">View and support your sponsees' recovery journeys</p>
        </div>

        {/* Pending Relationships */}
        {pendingRelationships.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Pending Requests</h2>
              <p className="text-sm text-gray-600">Sponsor relationships waiting for activation</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingRelationships.map((relationship) => (
                  <div
                    key={relationship.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 bg-warning-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-warning-600">P</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Pending Connection</p>
                          <p className="text-sm text-gray-500">
                            Requested {format(new Date(relationship.created_at || new Date()), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                    <Badge variant="warning">Pending</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Sponsees */}
        {activeRelationships.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeRelationships.map((relationship) => (
              <Link
                key={relationship.id}
                href={`/sponsees/${relationship.sponsee_id}`}
                className="block"
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-lg font-medium text-primary-600">
                          {relationship.sponsee?.handle?.charAt(0).toUpperCase() || "?"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {relationship.sponsee?.handle || "Unknown"}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Connected {format(new Date(relationship.created_at || new Date()), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Status</span>
                        <Badge variant="success">Active</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Last Activity</span>
                        <span className="text-gray-900 font-medium">Recent</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-primary-600 font-medium">
                        View Details →
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent>
              <EmptyState
                icon={
                  <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                }
                title="No Active Sponsees"
                description="When sponsees connect with you using your sponsor code, they will appear here."
              />
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
