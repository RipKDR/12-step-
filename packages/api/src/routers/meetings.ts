import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

// BMLT API client
// BMLT uses a semantic API that can be configured with different root URLs
async function searchBMLTMeetings(params: {
  lat: number;
  lng: number;
  radius: number;
  rootUrl?: string;
}) {
  const rootUrl = params.rootUrl || process.env.BMLT_ROOT_URL || 'https://bmlt.sezf.org/main_server';
  
  try {
    // BMLT semantic API endpoint for meeting search
    const url = `${rootUrl}/client_interface/json/?switcher=GetSearchResults&geo_width_km=${params.radius}&long_val=${params.lng}&lat_val=${params.lat}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`BMLT API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform BMLT response to our format
    return (Array.isArray(data) ? data : []).map((meeting: any) => ({
      id: meeting.id_bigint || meeting.id,
      name: meeting.meeting_name || 'NA Meeting',
      address: meeting.location_street || '',
      city: meeting.location_municipality || '',
      state: meeting.location_province || '',
      zip: meeting.location_postal_code_1 || '',
      lat: parseFloat(meeting.latitude) || params.lat,
      lng: parseFloat(meeting.longitude) || params.lng,
      time: meeting.start_time || '',
      day: meeting.weekday_tinyint || 0, // 0-6, Sunday-Saturday
      format: meeting.formats || '',
      distance: meeting.distance_in_miles || 0,
      virtual: meeting.format_shared_id_list?.includes('VM') || false,
    }));
  } catch (error) {
    console.error('BMLT API error:', error);
    throw new Error('Failed to search BMLT meetings');
  }
}

// AA Meeting Guide API (when available)
async function searchAAMeetings(params: {
  lat: number;
  lng: number;
  radius: number;
}) {
  // AA Meeting Guide API endpoint
  // This is a placeholder - actual implementation depends on available API
  const url = `https://meetingguide.org/api/v1/meetings?lat=${params.lat}&lng=${params.lng}&radius=${params.radius}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      // If API is not available, return empty array
      return [];
    }

    const data = await response.json();
    
    return (Array.isArray(data.meetings) ? data.meetings : []).map((meeting: any) => ({
      id: meeting.id,
      name: meeting.name || 'AA Meeting',
      address: meeting.address || '',
      city: meeting.city || '',
      state: meeting.state || '',
      zip: meeting.zip || '',
      lat: parseFloat(meeting.latitude) || params.lat,
      lng: parseFloat(meeting.longitude) || params.lng,
      time: meeting.time || '',
      day: meeting.day || 0,
      format: meeting.format || '',
      distance: meeting.distance || 0,
      virtual: meeting.virtual || false,
    }));
  } catch (error) {
    console.error('AA Meeting Guide API error:', error);
    // Return empty array if API is unavailable
    return [];
  }
}

export const meetingsRouter = router({
  // Search for meetings (NA via BMLT, AA via Meeting Guide)
  search: protectedProcedure
    .input(z.object({
      query: z.string().optional(),
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
      radius: z.number().min(1).max(100).default(10), // km
      program: z.enum(['NA', 'AA']).optional(),
      bmltRootUrl: z.string().url().optional(),
    }))
    .query(async ({ input, ctx }) => {
      // Get user's program preference
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: profile } = await supabase
        .from('profiles')
        .select('program')
        .eq('user_id', ctx.user.id)
        .single();

      const program = input.program || profile?.program || 'NA';

      let meetings: any[] = [];

      if (program === 'NA') {
        meetings = await searchBMLTMeetings({
          lat: input.lat,
          lng: input.lng,
          radius: input.radius,
          rootUrl: input.bmltRootUrl,
        });
      } else if (program === 'AA') {
        meetings = await searchAAMeetings({
          lat: input.lat,
          lng: input.lng,
          radius: input.radius,
        });
      }

      // Filter by query if provided
      if (input.query) {
        const queryLower = input.query.toLowerCase();
        meetings = meetings.filter(
          (meeting) =>
            meeting.name.toLowerCase().includes(queryLower) ||
            meeting.address.toLowerCase().includes(queryLower) ||
            meeting.city.toLowerCase().includes(queryLower)
        );
      }

      // Sort by distance
      meetings.sort((a, b) => (a.distance || 0) - (b.distance || 0));

      // Add status information
      const now = new Date();
      meetings = meetings.map((meeting) => {
        // Determine if meeting is starting soon (within 60 minutes)
        const meetingDate = new Date();
        const [hours, minutes] = meeting.time.split(':').map(Number);
        meetingDate.setHours(hours, minutes, 0, 0);
        
        // Adjust for day of week
        const dayDiff = meeting.day - meetingDate.getDay();
        if (dayDiff !== 0) {
          meetingDate.setDate(meetingDate.getDate() + dayDiff);
        }

        const timeUntilMeeting = meetingDate.getTime() - now.getTime();
        const hoursUntil = timeUntilMeeting / (1000 * 60 * 60);

        return {
          ...meeting,
          starts_soon: hoursUntil >= 0 && hoursUntil <= 1,
          status: hoursUntil < 0 ? 'past' : hoursUntil <= 1 ? 'starting-soon' : hoursUntil <= 24 ? 'today' : 'upcoming',
        };
      });

      return meetings;
    }),

  // Get meeting details (for calendar export)
  getDetails: protectedProcedure
    .input(z.object({
      meetingId: z.string(),
      program: z.enum(['NA', 'AA']),
    }))
    .query(async ({ input }) => {
      // This would fetch detailed meeting information
      // For now, return a placeholder structure
      return {
        id: input.meetingId,
        name: 'Meeting Details',
        address: '',
        time: '',
        day: 0,
        format: '',
        notes: '',
        contact: '',
      };
    }),
});

