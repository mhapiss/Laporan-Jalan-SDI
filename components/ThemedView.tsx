import React, { useMemo } from 'react';
import {
  Animated,
  View,
  type ViewProps,
  ViewStyle
} from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

// Modern theme variants with semantic meanings
export type ThemeVariant = 
  | 'default'
  | 'surface'
  | 'elevated'
  | 'card'
  | 'primary'
  | 'secondary' 
  | 'accent'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'muted'
  | 'inverse'
  | 'transparent'
  | 'glass'
  | 'gradient';

// Elevation levels for modern depth system
export type ElevationLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// Border radius presets
export type BorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

// Modern spacing system
export type Spacing = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

export type ThemedViewProps = ViewProps & {
  // Theme colors (legacy support)
  lightColor?: string;
  darkColor?: string;
  
  // Modern semantic variants
  variant?: ThemeVariant;
  
  // Elevation system for depth
  elevation?: ElevationLevel;
  
  // Border radius system
  radius?: BorderRadius;
  
  // Padding system
  padding?: Spacing;
  paddingHorizontal?: Spacing;
  paddingVertical?: Spacing;
  
  // Margin system
  margin?: Spacing;
  marginHorizontal?: Spacing;
  marginVertical?: Spacing;
  
  // Modern glass/blur effect
  blur?: boolean;
  
  // Animated value for transitions
  animatedValue?: Animated.Value;
  
  // Custom gradient colors (for gradient variant)
  gradientColors?: string[];
  gradientDirection?: 'horizontal' | 'vertical' | 'diagonal';
  
  // Border system
  borderWidth?: number;
  borderColor?: string;
  
  // Modern interaction states
  pressable?: boolean;
  disabled?: boolean;
  
  // Accessibility
  semanticRole?: 'card' | 'section' | 'surface' | 'container';
};

// Modern color palette system
const getVariantColors = (variant: ThemeVariant, isDark: boolean) => {
  const colors = {
    light: {
      default: '#FFFFFF',
      surface: '#F8FAFC',
      elevated: '#FFFFFF',
      card: '#FFFFFF',
      primary: '#3B82F6',
      secondary: '#6366F1',
      accent: '#8B5CF6',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#06B6D4',
      muted: '#F1F5F9',
      inverse: '#1F2937',
      transparent: 'transparent',
      glass: 'rgba(255, 255, 255, 0.8)',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    dark: {
      default: '#1F2937',
      surface: '#111827',
      elevated: '#374151',
      card: '#1F2937',
      primary: '#60A5FA',
      secondary: '#818CF8',
      accent: '#A78BFA',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      info: '#22D3EE',
      muted: '#374151',
      inverse: '#F9FAFB',
      transparent: 'transparent',
      glass: 'rgba(31, 41, 55, 0.8)',
      gradient: 'linear-gradient(135deg, #4c1d95 0%, #1e1b4b 100%)'
    }
  };
  
  return colors[isDark ? 'dark' : 'light'][variant] || colors[isDark ? 'dark' : 'light'].default;
};

// Elevation shadow system
const getElevationStyle = (level: ElevationLevel, isDark: boolean): ViewStyle => {
  if (level === 0) return {};
  
  const shadowColor = isDark ? '#000000' : '#000000';
  const shadowOpacity = isDark ? 0.5 : 0.15;
  
  const elevationStyles: Record<ElevationLevel, ViewStyle> = {
    0: {},
    1: {
      elevation: 2,
      shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: shadowOpacity * 0.7,
      shadowRadius: 2,
    },
    2: {
      elevation: 4,
      shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity,
      shadowRadius: 4,
    },
    3: {
      elevation: 6,
      shadowColor,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: shadowOpacity * 1.2,
      shadowRadius: 6,
    },
    4: {
      elevation: 8,
      shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: shadowOpacity * 1.4,
      shadowRadius: 8,
    },
    5: {
      elevation: 12,
      shadowColor,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: shadowOpacity * 1.6,
      shadowRadius: 12,
    },
    6: {
      elevation: 16,
      shadowColor,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: shadowOpacity * 1.8,
      shadowRadius: 16,
    },
  };
  
  return elevationStyles[level];
};

// Border radius system
const getBorderRadius = (radius: BorderRadius): number => {
  const radii = {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    full: 9999,
  };
  return radii[radius];
};

// Spacing system
const getSpacing = (spacing: Spacing): number => {
  const spacings = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  };
  return spacings[spacing];
};

export function ThemedView({ 
  style, 
  lightColor, 
  darkColor,
  variant = 'default',
  elevation = 0,
  radius = 'none',
  padding,
  paddingHorizontal,
  paddingVertical,
  margin,
  marginHorizontal,
  marginVertical,
  blur = false,
  animatedValue,
  gradientColors,
  gradientDirection = 'vertical',
  borderWidth,
  borderColor,
  pressable = false,
  disabled = false,
  semanticRole = 'container',
  ...otherProps 
}: ThemedViewProps) {
  // Get theme-aware background color
  const themeBackgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor }, 
    'background'
  );
  
  // Determine if dark mode (this would need to be implemented based on your theme system)
  const isDark = false; // You'll need to get this from your theme context
  
  // Get variant-specific styling
  const variantColor = useMemo(() => {
    if (lightColor || darkColor) {
      return themeBackgroundColor;
    }
    return getVariantColors(variant, isDark);
  }, [variant, lightColor, darkColor, themeBackgroundColor, isDark]);
  
  // Build the complete style object
  const computedStyle = useMemo((): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: blur ? 'transparent' : variantColor,
    };
    
    // Add border radius
    if (radius !== 'none') {
      baseStyle.borderRadius = getBorderRadius(radius);
    }
    
    // Add padding
    if (padding) baseStyle.padding = getSpacing(padding);
    if (paddingHorizontal) baseStyle.paddingHorizontal = getSpacing(paddingHorizontal);
    if (paddingVertical) baseStyle.paddingVertical = getSpacing(paddingVertical);
    
    // Add margin
    if (margin) baseStyle.margin = getSpacing(margin);
    if (marginHorizontal) baseStyle.marginHorizontal = getSpacing(marginHorizontal);
    if (marginVertical) baseStyle.marginVertical = getSpacing(marginVertical);
    
    // Add border
    if (borderWidth) baseStyle.borderWidth = borderWidth;
    if (borderColor) baseStyle.borderColor = borderColor;
    
    // Add elevation/shadow
    Object.assign(baseStyle, getElevationStyle(elevation, isDark));
    
    // Glass effect
    if (blur) {
      baseStyle.backgroundColor = variantColor;
      baseStyle.opacity = 0.9;
    }
    
    // Gradient effect (simplified - you might want to use react-native-linear-gradient)
    if (variant === 'gradient' && gradientColors) {
      // This is a placeholder - you'd implement actual gradient logic here
      baseStyle.backgroundColor = gradientColors[0];
    }
    
    // Disabled state
    if (disabled) {
      baseStyle.opacity = 0.6;
    }
    
    // Pressable state preparation
    if (pressable) {
      baseStyle.transform = [{ scale: 1 }];
    }
    
    return baseStyle;
  }, [
    variantColor, 
    radius, 
    padding, 
    paddingHorizontal, 
    paddingVertical,
    margin,
    marginHorizontal,
    marginVertical,
    elevation,
    borderWidth,
    borderColor,
    blur,
    variant,
    gradientColors,
    disabled,
    pressable,
    isDark
  ]);
  
  // Accessibility props based on semantic role
  const accessibilityProps = useMemo(() => {
    const props: any = {};
    
    if (semanticRole === 'card') {
      props.accessible = true;
      props.accessibilityRole = 'button';
    } else if (semanticRole === 'section') {
      props.accessibilityRole = 'header';
    }
    
    return props;
  }, [semanticRole]);
  
  // If animated, use Animated.View
  if (animatedValue) {
    return (
      <Animated.View 
        style={[
          computedStyle,
          style,
          animatedValue && {
            opacity: animatedValue,
            transform: [{ scale: animatedValue }]
          }
        ]}
        {...accessibilityProps}
        {...otherProps} 
      />
    );
  }
  
  // Regular View
  return (
    <View 
      style={[computedStyle, style]}
      {...accessibilityProps}
      {...otherProps} 
    />
  );
}

// Preset component variants for common use cases
export const ThemedCard = (props: Omit<ThemedViewProps, 'variant' | 'elevation' | 'radius'>) => (
  <ThemedView variant="card" elevation={2} radius="lg" {...props} />
);

export const ThemedSurface = (props: Omit<ThemedViewProps, 'variant'>) => (
  <ThemedView variant="surface" {...props} />
);

export const ThemedContainer = (props: Omit<ThemedViewProps, 'variant' | 'padding'>) => (
  <ThemedView variant="default" padding="md" {...props} />
);

export const ThemedGlassView = (props: Omit<ThemedViewProps, 'variant' | 'blur'>) => (
  <ThemedView variant="glass" blur={true} radius="lg" {...props} />
);

// Usage examples and documentation
/*
// Basic usage with variants
<ThemedView variant="card" elevation={2} radius="lg">
  <Text>Card content</Text>
</ThemedView>

// With spacing system
<ThemedView 
  variant="surface" 
  padding="lg" 
  margin="md"
  radius="xl"
>
  <Text>Spaced content</Text>
</ThemedView>

// Glass/blur effect
<ThemedGlassView>
  <Text>Glassmorphism content</Text>
</ThemedGlassView>

// With animation
const fadeAnim = new Animated.Value(0);
<ThemedView 
  variant="primary"
  animatedValue={fadeAnim}
  radius="2xl"
>
  <Text>Animated content</Text>
</ThemedView>

// Preset components
<ThemedCard>
  <Text>Auto-styled card</Text>
</ThemedCard>
*/