import { createClient } from "@supabase/supabase-js";
import { simulateGeofenceTrigger, checkGeofenceTriggers, processGeofenceEvents } from "./geofence";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface SimulatorLocation {
  id: string;
  label: string;
  lat: number;
  lng: number;
  radius_m: number;
  user_id: string;
}

export interface SimulatorTest {
  id: string;
  name: string;
  description: string;
  test_lat: number;
  test_lng: number;
  expected_triggers: string[];
  created_at: Date;
}

/**
 * Get all trigger locations for a user
 */
export async function getTriggerLocations(userId: string): Promise<SimulatorLocation[]> {
  try {
    const { data, error } = await supabase
      .from("trigger_locations")
      .select("*")
      .eq("user_id", userId)
      .eq("active", true);

    if (error) {
      console.error("Error fetching trigger locations:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching trigger locations:", error);
    return [];
  }
}

/**
 * Create a test location for simulation
 */
export async function createTestLocation(
  userId: string,
  label: string,
  lat: number,
  lng: number,
  radius_m: number = 100
): Promise<SimulatorLocation | null> {
  try {
    const { data, error } = await supabase
      .from("trigger_locations")
      .insert({
        user_id: userId,
        label: `[TEST] ${label}`,
        lat,
        lng,
        radius_m,
        on_enter: ["Open action plan", "Send notification to sponsor"],
        on_exit: ["Log exit event"],
        active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating test location:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error creating test location:", error);
    return null;
  }
}

/**
 * Test geofence triggers at a specific location
 */
export async function testGeofenceAtLocation(
  userId: string,
  testLat: number,
  testLng: number
): Promise<{
  triggered: boolean;
  events: any[];
  locations: SimulatorLocation[];
}> {
  try {
    // Get all trigger locations
    const locations = await getTriggerLocations(userId);
    
    // Check for triggers
    const events = await checkGeofenceTriggers(userId, testLat, testLng);
    
    // Process events
    if (events.length > 0) {
      await processGeofenceEvents(events);
    }

    return {
      triggered: events.length > 0,
      events,
      locations,
    };
  } catch (error) {
    console.error("Error testing geofence:", error);
    return {
      triggered: false,
      events: [],
      locations: [],
    };
  }
}

/**
 * Simulate entering a trigger location
 */
export async function simulateEnterLocation(
  userId: string,
  locationId: string
): Promise<boolean> {
  try {
    const event = await simulateGeofenceTrigger(userId, locationId, 'enter');
    return event !== null;
  } catch (error) {
    console.error("Error simulating enter location:", error);
    return false;
  }
}

/**
 * Simulate exiting a trigger location
 */
export async function simulateExitLocation(
  userId: string,
  locationId: string
): Promise<boolean> {
  try {
    const event = await simulateGeofenceTrigger(userId, locationId, 'exit');
    return event !== null;
  } catch (error) {
    console.error("Error simulating exit location:", error);
    return false;
  }
}

/**
 * Create a comprehensive test suite
 */
export async function createTestSuite(userId: string): Promise<SimulatorTest[]> {
  const testSuite: SimulatorTest[] = [
    {
      id: "test-1",
      name: "Nearby Trigger Test",
      description: "Test location very close to a trigger location",
      test_lat: 37.7749,
      test_lng: -122.4194,
      expected_triggers: ["Nearby location"],
      created_at: new Date(),
    },
    {
      id: "test-2", 
      name: "Far Away Test",
      description: "Test location far from any trigger locations",
      test_lat: 40.7128,
      test_lng: -74.0060,
      expected_triggers: [],
      created_at: new Date(),
    },
    {
      id: "test-3",
      name: "Edge Case Test",
      description: "Test location exactly at the edge of a trigger radius",
      test_lat: 37.7750,
      test_lng: -122.4200,
      expected_triggers: ["Edge case location"],
      created_at: new Date(),
    },
  ];

  return testSuite;
}

/**
 * Run a specific test
 */
export async function runTest(
  userId: string,
  test: SimulatorTest
): Promise<{
  passed: boolean;
  actual_triggers: string[];
  expected_triggers: string[];
  events: any[];
}> {
  try {
    const result = await testGeofenceAtLocation(
      userId,
      test.test_lat,
      test.test_lng
    );

    const actual_triggers = result.events.map(event => 
      result.locations.find(loc => loc.id === event.location_id)?.label || 'Unknown'
    );

    const passed = actual_triggers.length === test.expected_triggers.length &&
      actual_triggers.every(trigger => test.expected_triggers.includes(trigger));

    return {
      passed,
      actual_triggers,
      expected_triggers: test.expected_triggers,
      events: result.events,
    };
  } catch (error) {
    console.error("Error running test:", error);
    return {
      passed: false,
      actual_triggers: [],
      expected_triggers: test.expected_triggers,
      events: [],
    };
  }
}

/**
 * Clean up test locations
 */
export async function cleanupTestLocations(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("trigger_locations")
      .delete()
      .eq("user_id", userId)
      .like("label", "[TEST]%");

    if (error) {
      console.error("Error cleaning up test locations:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error cleaning up test locations:", error);
    return false;
  }
}

/**
 * Get geofence event history for debugging
 */
export async function getGeofenceEventHistory(
  userId: string,
  limit: number = 20
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("geofence_events")
      .select(`
        *,
        trigger_locations!inner(label, lat, lng)
      `)
      .eq("user_id", userId)
      .order("triggered_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching geofence event history:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching geofence event history:", error);
    return [];
  }
}

/**
 * Generate test report
 */
export async function generateTestReport(userId: string): Promise<{
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  test_results: any[];
  recent_events: any[];
}> {
  try {
    const testSuite = await createTestSuite(userId);
    const testResults = [];

    for (const test of testSuite) {
      const result = await runTest(userId, test);
      testResults.push({
        test,
        result,
      });
    }

    const passed_tests = testResults.filter(tr => tr.result.passed).length;
    const failed_tests = testResults.length - passed_tests;
    const recent_events = await getGeofenceEventHistory(userId, 10);

    return {
      total_tests: testResults.length,
      passed_tests,
      failed_tests,
      test_results: testResults,
      recent_events,
    };
  } catch (error) {
    console.error("Error generating test report:", error);
    return {
      total_tests: 0,
      passed_tests: 0,
      failed_tests: 0,
      test_results: [],
      recent_events: [],
    };
  }
}
