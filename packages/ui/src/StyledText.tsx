import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

export function StyledText(props: TextProps) {
  return <Text {...props} style={[props.style, styles.text]} />;
}

const styles = StyleSheet.create({
    text: {
        // Default text styles can go here
        fontSize: 16,
        color: '#333',
    }
})
