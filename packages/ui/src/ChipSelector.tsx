import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  AccessibilityInfo,
} from 'react-native';

interface ChipOption {
  id: string;
  label: string;
  value: string;
}

interface ChipSelectorProps {
  options: ChipOption[];
  selectedValues: string[];
  onSelectionChange: (selectedValues: string[]) => void;
  label?: string;
  multiSelect?: boolean;
  disabled?: boolean;
  maxSelections?: number;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const ChipSelector: React.FC<ChipSelectorProps> = ({
  options,
  selectedValues,
  onSelectionChange,
  label,
  multiSelect = true,
  disabled = false,
  maxSelections,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const handlePress = (option: ChipOption) => {
    if (disabled) return;

    if (multiSelect) {
      const isSelected = selectedValues.includes(option.value);
      
      if (isSelected) {
        // Remove from selection
        onSelectionChange(selectedValues.filter(value => value !== option.value));
      } else {
        // Add to selection if under max limit
        if (!maxSelections || selectedValues.length < maxSelections) {
          onSelectionChange([...selectedValues, option.value]);
        }
      }
    } else {
      // Single select
      onSelectionChange([option.value]);
    }
  };

  const isSelected = (option: ChipOption) => selectedValues.includes(option.value);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        accessible={true}
        accessibilityLabel={accessibilityLabel || label}
        accessibilityHint={accessibilityHint}
        accessibilityRole="radiogroup"
      >
        {options.map((option) => {
          const selected = isSelected(option);
          const isDisabled = disabled || (multiSelect && maxSelections && selectedValues.length >= maxSelections && !selected);
          
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.chip,
                selected && styles.chipSelected,
                isDisabled && styles.chipDisabled,
              ]}
              onPress={() => handlePress(option)}
              disabled={isDisabled}
              accessible={true}
              accessibilityLabel={option.label}
              accessibilityRole={multiSelect ? "checkbox" : "radio"}
              accessibilityState={{
                checked: selected,
                disabled: isDisabled,
              }}
              accessibilityHint={multiSelect ? "Double tap to select or deselect" : "Double tap to select"}
            >
              <Text
                style={[
                  styles.chipText,
                  selected && styles.chipTextSelected,
                  isDisabled && styles.chipTextDisabled,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      
      {maxSelections && multiSelect && (
        <Text style={styles.counter}>
          {selectedValues.length} / {maxSelections} selected
        </Text>
      )}
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
  scrollContainer: {
    paddingRight: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    minHeight: 44, // WCAG AA minimum touch target
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  chipDisabled: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  chipTextSelected: {
    color: '#ffffff',
  },
  chipTextDisabled: {
    color: '#9ca3af',
  },
  counter: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
});
