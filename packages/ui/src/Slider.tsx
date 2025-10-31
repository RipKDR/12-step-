import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  GestureResponderEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  label?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  onValueChange,
  minimumValue = 0,
  maximumValue = 10,
  step = 1,
  label,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const [sliderWidth, setSliderWidth] = useState(0);
  const translateX = useSharedValue(0);
  
  const range = maximumValue - minimumValue;
  const stepSize = sliderWidth / range;

  const updateValue = (newValue: number) => {
    const clampedValue = Math.max(
      minimumValue,
      Math.min(maximumValue, Math.round(newValue / step) * step)
    );
    onValueChange(clampedValue);
  };

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: (_, context: any) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      if (disabled) return;
      
      const newTranslateX = context.startX + event.translationX;
      const clampedTranslateX = Math.max(0, Math.min(sliderWidth, newTranslateX));
      translateX.value = clampedTranslateX;
      
      const newValue = minimumValue + (clampedTranslateX / sliderWidth) * range;
      runOnJS(updateValue)(newValue);
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    const progress = translateX.value / sliderWidth;
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const trackStyle = useAnimatedStyle(() => {
    const progress = translateX.value / sliderWidth;
    return {
      width: `${progress * 100}%`,
    };
  });

  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setSliderWidth(width);
    
    // Initialize position based on current value
    const progress = (value - minimumValue) / range;
    translateX.value = progress * width;
  };

  const handlePress = (event: GestureResponderEvent) => {
    if (disabled) return;
    
    const { locationX } = event.nativeEvent;
    const progress = locationX / sliderWidth;
    const newValue = minimumValue + progress * range;
    updateValue(newValue);
    
    // Update animation
    translateX.value = locationX;
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.sliderContainer}>
        <View
          style={[styles.track, disabled && styles.trackDisabled]}
          onLayout={handleLayout}
          onTouchEnd={handlePress}
          accessible={true}
          accessibilityLabel={accessibilityLabel || label}
          accessibilityHint={accessibilityHint}
          accessibilityRole="adjustable"
          accessibilityValue={{
            min: minimumValue,
            max: maximumValue,
            now: value,
          }}
        >
          <Animated.View style={[styles.trackFill, trackStyle]} />
          <Animated.View style={[styles.thumb, animatedStyle]} />
        </View>
        
        <View style={styles.labels}>
          <Text style={[styles.labelText, disabled && styles.labelDisabled]}>
            {minimumValue}
          </Text>
          <Text style={[styles.labelText, disabled && styles.labelDisabled]}>
            {maximumValue}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.valueText, disabled && styles.valueDisabled]}>
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  sliderContainer: {
    position: 'relative',
  },
  track: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    position: 'relative',
    marginBottom: 8,
  },
  trackDisabled: {
    backgroundColor: '#f3f4f6',
  },
  trackFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    top: -10,
    left: -12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labelText: {
    fontSize: 12,
    color: '#6b7280',
  },
  labelDisabled: {
    color: '#9ca3af',
  },
  valueText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginTop: 8,
  },
  valueDisabled: {
    color: '#9ca3af',
  },
});
