import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Animated,
} from 'react-native';
import { ActionButton } from '@repo/ui';
import { trpc } from '../../../lib/trpc';

export default function SupportScreen() {
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingCount, setBreathingCount] = useState(0);
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [groundingItems, setGroundingItems] = useState<string[]>([]);
  const [groundingStep, setGroundingStep] = useState(0);

  const { data: profile } = trpc.users.getProfile.useQuery();
  const { data: sponsorRelationship } = trpc.sponsor.getRelationship.useQuery();

  const breathingAnimation = new Animated.Value(1);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isBreathingActive) {
      interval = setInterval(() => {
        setBreathingCount(prev => {
          const newCount = prev + 1;
          
          // 4-7-8 breathing pattern
          if (newCount <= 4) {
            setBreathingPhase('inhale');
            Animated.timing(breathingAnimation, {
              toValue: 1.2,
              duration: 1000,
              useNativeDriver: true,
            }).start();
          } else if (newCount <= 11) {
            setBreathingPhase('hold');
            Animated.timing(breathingAnimation, {
              toValue: 1.2,
              duration: 1000,
              useNativeDriver: true,
            }).start();
          } else if (newCount <= 19) {
            setBreathingPhase('exhale');
            Animated.timing(breathingAnimation, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }).start();
          } else {
            setBreathingCount(0);
          }
          
          return newCount;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBreathingActive, breathingAnimation]);

  const handleStartBreathing = () => {
    setIsBreathingActive(true);
    setBreathingCount(0);
  };

  const handleStopBreathing = () => {
    setIsBreathingActive(false);
    setBreathingCount(0);
    setBreathingPhase('inhale');
    breathingAnimation.setValue(1);
  };

  const handleGroundingStart = () => {
    setGroundingStep(0);
    setGroundingItems([]);
  };

  const handleGroundingNext = () => {
    if (groundingStep < 5) {
      setGroundingStep(prev => prev + 1);
    }
  };

  const handleCallSponsor = () => {
    if (sponsorRelationship) {
      Alert.alert(
        'Call Sponsor',
        'This would open your phone to call your sponsor. Feature coming soon!',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'No Sponsor Connected',
        'You need to connect with a sponsor first. Go to Settings > Sponsor Management.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleCrisisResources = () => {
    Alert.alert(
      'Crisis Resources',
      'If you\'re in immediate danger, call 911 or your local emergency number.\n\nCrisis hotlines:\n• National Suicide Prevention Lifeline: 988\n• Crisis Text Line: Text HOME to 741741\n• SAMHSA National Helpline: 1-800-662-4357',
      [
        { text: 'Call 988', onPress: () => Linking.openURL('tel:988') },
        { text: 'Text Crisis Line', onPress: () => Linking.openURL('sms:741741&body=HOME') },
        { text: 'Close' }
      ]
    );
  };

  const getBreathingInstruction = () => {
    switch (breathingPhase) {
      case 'inhale': return 'Breathe in slowly...';
      case 'hold': return 'Hold your breath...';
      case 'exhale': return 'Breathe out slowly...';
      default: return 'Ready to begin';
    }
  };

  const getGroundingInstruction = (step: number) => {
    const instructions = [
      'Look around and name 5 things you can see',
      'Name 4 things you can touch',
      'Name 3 things you can hear',
      'Name 2 things you can smell',
      'Name 1 thing you can taste'
    ];
    return instructions[step] || 'Grounding complete!';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Support Tools</Text>
          <Text style={styles.subtitle}>
            Immediate support when you need it most
          </Text>
        </View>

        {/* Breathing Exercise */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Breathing Exercise</Text>
          <Text style={styles.cardDescription}>
            4-7-8 breathing technique to help calm your mind and body
          </Text>
          
          <View style={styles.breathingContainer}>
            <Animated.View
              style={[
                styles.breathingCircle,
                {
                  transform: [{ scale: breathingAnimation }],
                },
              ]}
            >
              <Text style={styles.breathingText}>
                {isBreathingActive ? breathingCount : '∞'}
              </Text>
            </Animated.View>
            
            <Text style={styles.breathingInstruction}>
              {isBreathingActive ? getBreathingInstruction() : 'Tap start to begin'}
            </Text>
            
            <View style={styles.breathingActions}>
              {!isBreathingActive ? (
                <ActionButton
                  title="Start Breathing"
                  onPress={handleStartBreathing}
                  fullWidth
                  accessibilityLabel="Start breathing exercise"
                  accessibilityHint="Begin 4-7-8 breathing technique"
                />
              ) : (
                <ActionButton
                  title="Stop"
                  variant="secondary"
                  onPress={handleStopBreathing}
                  fullWidth
                  accessibilityLabel="Stop breathing exercise"
                />
              )}
            </View>
          </View>
        </View>

        {/* 5-4-3-2-1 Grounding */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>5-4-3-2-1 Grounding</Text>
          <Text style={styles.cardDescription}>
            Ground yourself in the present moment using your senses
          </Text>
          
          <View style={styles.groundingContainer}>
            <Text style={styles.groundingInstruction}>
              {getGroundingInstruction(groundingStep)}
            </Text>
            
            {groundingStep < 5 && (
              <View style={styles.groundingActions}>
                <ActionButton
                  title={groundingStep === 0 ? 'Start Grounding' : 'Next Step'}
                  onPress={handleGroundingNext}
                  fullWidth
                  accessibilityLabel={`Grounding step ${groundingStep + 1}`}
                  accessibilityHint="Complete the current grounding step"
                />
              </View>
            )}
            
            {groundingStep === 5 && (
              <View style={styles.groundingComplete}>
                <Text style={styles.completeText}>Grounding Complete!</Text>
                <ActionButton
                  title="Start Over"
                  variant="secondary"
                  onPress={handleGroundingStart}
                  accessibilityLabel="Start grounding exercise over"
                />
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          
          <View style={styles.quickActions}>
            <ActionButton
              title="Call Sponsor"
              variant="primary"
              onPress={handleCallSponsor}
              disabled={!sponsorRelationship}
              fullWidth
              accessibilityLabel="Call your sponsor"
              accessibilityHint="Open phone to call your sponsor"
            />
            
            <ActionButton
              title="Crisis Resources"
              variant="danger"
              onPress={handleCrisisResources}
              fullWidth
              accessibilityLabel="View crisis resources"
              accessibilityHint="Show crisis hotlines and emergency resources"
            />
          </View>
        </View>

        {/* Recovery Resources */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recovery Resources</Text>
          
          <View style={styles.resourceLinks}>
            <TouchableOpacity
              style={styles.resourceLink}
              onPress={() => Linking.openURL('https://www.na.org')}
              accessibilityLabel="Visit NA website"
            >
              <Text style={styles.resourceLinkText}>Narcotics Anonymous</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.resourceLink}
              onPress={() => Linking.openURL('https://www.aa.org')}
              accessibilityLabel="Visit AA website"
            >
              <Text style={styles.resourceLinkText}>Alcoholics Anonymous</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.resourceLink}
              onPress={() => Linking.openURL('https://www.samhsa.gov')}
              accessibilityLabel="Visit SAMHSA website"
            >
              <Text style={styles.resourceLinkText}>SAMHSA Resources</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Emergency Information */}
        <View style={styles.emergencyCard}>
          <Text style={styles.emergencyTitle}>In Case of Emergency</Text>
          <Text style={styles.emergencyText}>
            If you're having thoughts of self-harm or suicide, please reach out for help immediately:
          </Text>
          <Text style={styles.emergencyNumber}>988</Text>
          <Text style={styles.emergencySubtext}>
            National Suicide Prevention Lifeline
          </Text>
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
  card: {
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
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  breathingContainer: {
    alignItems: 'center',
  },
  breathingCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  breathingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  breathingInstruction: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 16,
  },
  breathingActions: {
    width: '100%',
  },
  groundingContainer: {
    alignItems: 'center',
  },
  groundingInstruction: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  groundingActions: {
    width: '100%',
  },
  groundingComplete: {
    alignItems: 'center',
  },
  completeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 16,
  },
  quickActions: {
    gap: 12,
  },
  resourceLinks: {
    gap: 12,
  },
  resourceLink: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  resourceLinkText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  emergencyCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
    alignItems: 'center',
  },
  emergencyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 12,
  },
  emergencyText: {
    fontSize: 14,
    color: '#991b1b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  emergencyNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 8,
  },
  emergencySubtext: {
    fontSize: 16,
    color: '#991b1b',
    fontWeight: '500',
  },
});
