import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  RefreshControl,
} from 'react-native';
import { ActionButton, FormInput } from '@repo/ui';
import { trpc } from '../../../lib/trpc';
import { format, addDays } from 'date-fns';

export default function MeetingsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchRadius, setSearchRadius] = useState(10);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const { data: profile } = trpc.users.getProfile.useQuery();
  const { data: meetings, isLoading, refetch } = trpc.meetings.search.useQuery(
    {
      query: searchQuery,
      radius: searchRadius,
      lat: userLocation?.lat || 0,
      lng: userLocation?.lng || 0,
    },
    {
      enabled: !!userLocation,
    }
  );

  useEffect(() => {
    // In a real app, you'd get the user's current location here
    // For now, we'll use a default location
    setUserLocation({ lat: 40.7128, lng: -74.0060 }); // New York City
  }, []);

  const handleSearch = () => {
    if (!userLocation) {
      Alert.alert('Location Required', 'Please enable location services to search for meetings.');
      return;
    }
    refetch();
  };

  const handleOpenMeeting = async (meeting: any) => {
    try {
      // For NA meetings, use BMLT deep link
      if (profile?.program === 'NA') {
        const bmltUrl = `https://bmlt.app/meetings/?latitude=${meeting.lat}&longitude=${meeting.lng}&radius=${searchRadius}`;
        await Linking.openURL(bmltUrl);
      } else {
        // For AA meetings, use Meeting Guide app or website
        const meetingGuideUrl = `https://meetingguide.org/meetings?lat=${meeting.lat}&lng=${meeting.lng}&radius=${searchRadius}`;
        await Linking.openURL(meetingGuideUrl);
      }
    } catch (error) {
      console.error('Error opening meeting:', error);
      Alert.alert('Error', 'Unable to open meeting details.');
    }
  };

  const handleExportToCalendar = async (meeting: any) => {
    try {
      // In a real app, you'd generate an .ics file and open it
      Alert.alert(
        'Export to Calendar',
        'This would export the meeting to your calendar. Feature coming soon!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error exporting to calendar:', error);
      Alert.alert('Error', 'Unable to export to calendar.');
    }
  };

  const getMeetingStatus = (meeting: any) => {
    const now = new Date();
    const meetingTime = new Date(meeting.time);
    const timeDiff = meetingTime.getTime() - now.getTime();
    const hoursUntil = timeDiff / (1000 * 60 * 60);

    if (hoursUntil < 0) return 'past';
    if (hoursUntil <= 1) return 'starting-soon';
    if (hoursUntil <= 24) return 'today';
    return 'upcoming';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'starting-soon': return '#dc2626';
      case 'today': return '#f59e0b';
      case 'upcoming': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'starting-soon': return 'Starting Soon';
      case 'today': return 'Today';
      case 'upcoming': return 'Upcoming';
      default: return 'Past';
    }
  };

  const formatMeetingTime = (meeting: any) => {
    const meetingTime = new Date(meeting.time);
    return format(meetingTime, 'h:mm a, EEE MMM d');
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}mi`;
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Meeting Finder</Text>
          <Text style={styles.subtitle}>
            Find nearby {profile?.program} meetings
          </Text>
        </View>

        {/* Search Form */}
        <View style={styles.searchCard}>
          <FormInput
            label="Search Location"
            placeholder="Enter city, address, or zip code"
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="Search location for meetings"
            accessibilityHint="Enter a location to search for nearby meetings"
          />
          
          <View style={styles.radiusContainer}>
            <Text style={styles.radiusLabel}>Search Radius: {searchRadius} miles</Text>
            <ActionButton
              title="Search"
              onPress={handleSearch}
              disabled={!userLocation}
              fullWidth
              accessibilityLabel="Search for meetings"
              accessibilityHint="Tap to search for meetings near the specified location"
            />
          </View>
        </View>

        {/* Meetings List */}
        {meetings && meetings.length > 0 ? (
          <View style={styles.meetingsList}>
            <Text style={styles.resultsTitle}>
              Found {meetings.length} meetings
            </Text>
            
            {meetings.map((meeting, index) => {
              const status = getMeetingStatus(meeting);
              
              return (
                <View key={index} style={styles.meetingCard}>
                  <View style={styles.meetingHeader}>
                    <View style={styles.meetingInfo}>
                      <Text style={styles.meetingName}>{meeting.name}</Text>
                      <Text style={styles.meetingTime}>
                        {formatMeetingTime(meeting)}
                      </Text>
                      <Text style={styles.meetingAddress}>
                        {meeting.address}
                      </Text>
                      {meeting.distance && (
                        <Text style={styles.meetingDistance}>
                          {formatDistance(meeting.distance)} away
                        </Text>
                      )}
                    </View>
                    <View style={styles.meetingStatus}>
                      <View
                        style={[
                          styles.statusIndicator,
                          { backgroundColor: getStatusColor(status) }
                        ]}
                      />
                      <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
                        {getStatusText(status)}
                      </Text>
                    </View>
                  </View>

                  {meeting.notes && (
                    <Text style={styles.meetingNotes}>{meeting.notes}</Text>
                  )}

                  <View style={styles.meetingActions}>
                    <ActionButton
                      title="Open in App"
                      variant="primary"
                      size="small"
                      onPress={() => handleOpenMeeting(meeting)}
                      accessibilityLabel={`Open ${meeting.name} in meeting app`}
                    />
                    <ActionButton
                      title="Add to Calendar"
                      variant="secondary"
                      size="small"
                      onPress={() => handleExportToCalendar(meeting)}
                      accessibilityLabel={`Add ${meeting.name} to calendar`}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        ) : meetings && meetings.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No Meetings Found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your search location or radius to find more meetings.
            </Text>
          </View>
        ) : (
          <View style={styles.placeholderState}>
            <Text style={styles.placeholderText}>
              Enter a location and tap search to find meetings
            </Text>
          </View>
        )}

        {/* Help Section */}
        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>How to Use</Text>
          <Text style={styles.helpText}>
            • Enter your location or a city name{'\n'}
            • Adjust the search radius as needed{'\n'}
            • Tap "Open in App" to view meeting details{'\n'}
            • Use "Add to Calendar" to save meetings{'\n'}
            • Meetings are updated in real-time
          </Text>
        </View>

        {/* Resources */}
        <View style={styles.resourcesCard}>
          <Text style={styles.resourcesTitle}>Additional Resources</Text>
          <View style={styles.resourceLinks}>
            <TouchableOpacity
              style={styles.resourceLink}
              onPress={() => Linking.openURL('https://www.na.org')}
              accessibilityLabel="Visit NA website"
            >
              <Text style={styles.resourceLinkText}>NA.org</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.resourceLink}
              onPress={() => Linking.openURL('https://www.aa.org')}
              accessibilityLabel="Visit AA website"
            >
              <Text style={styles.resourceLinkText}>AA.org</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.resourceLink}
              onPress={() => Linking.openURL('https://bmlt.app')}
              accessibilityLabel="Visit BMLT website"
            >
              <Text style={styles.resourceLinkText}>BMLT.app</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  searchCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  radiusContainer: {
    marginTop: 16,
  },
  radiusLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  meetingsList: {
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  meetingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  meetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  meetingInfo: {
    flex: 1,
    marginRight: 12,
  },
  meetingName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  meetingTime: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 4,
  },
  meetingAddress: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  meetingDistance: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  meetingStatus: {
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  meetingNotes: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  meetingActions: {
    flexDirection: 'row',
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  placeholderState: {
    alignItems: 'center',
    paddingVertical: 48,
    marginBottom: 24,
  },
  placeholderText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  helpCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  resourcesCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  resourcesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  resourceLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  resourceLink: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
  },
  resourceLinkText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
});
