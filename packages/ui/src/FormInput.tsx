import React from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  AccessibilityInfo,
} from 'react-native';

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  required = false,
  helperText,
  style,
  ...props
}) => {
  const inputId = `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <View style={styles.container}>
      <Text style={styles.label} nativeID={`${inputId}-label`}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          style,
        ]}
        accessibilityLabel={label}
        accessibilityRequired={required}
        accessibilityInvalid={!!error}
        accessibilityDescribedBy={error ? errorId : helperId}
        aria-describedby={error ? errorId : helperId}
        {...props}
      />
      
      {error && (
        <Text style={styles.errorText} nativeID={errorId} accessibilityRole="alert">
          {error}
        </Text>
      )}
      
      {helperText && !error && (
        <Text style={styles.helperText} nativeID={helperId}>
          {helperText}
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
  required: {
    color: '#dc2626',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    minHeight: 48, // WCAG AA minimum touch target
  },
  inputError: {
    borderColor: '#dc2626',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginTop: 4,
  },
  helperText: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 4,
  },
});
