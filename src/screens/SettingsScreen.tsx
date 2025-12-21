/**
 * Settings Screen
 * User preferences and app settings
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { ThemeMode } from '../theme';

export default function SettingsScreen() {
  const { theme, themeMode, setThemeMode } = useTheme();
  const { colors } = theme;

  const themeOptions: { value: ThemeMode; label: string; icon: string }[] = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'auto', label: 'Auto', icon: '🔄' },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Settings
          </Text>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            APPEARANCE
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Theme
            </Text>
            <Text
              style={[styles.cardDescription, { color: colors.textSecondary }]}
            >
              Choose your preferred color theme
            </Text>

            {/* Theme Options */}
            <View style={styles.themeOptions}>
              {themeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.themeOption,
                    {
                      backgroundColor:
                        themeMode === option.value
                          ? colors.primary
                          : colors.backgroundSecondary,
                      borderColor:
                        themeMode === option.value
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                  onPress={() => setThemeMode(option.value)}
                >
                  <Text style={styles.themeIcon}>{option.icon}</Text>
                  <Text
                    style={[
                      styles.themeLabel,
                      {
                        color:
                          themeMode === option.value
                            ? colors.textInverse
                            : colors.text,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                  {themeMode === option.value && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Current Theme Info */}
            <View
              style={[
                styles.infoBox,
                { backgroundColor: colors.backgroundSecondary },
              ]}
            >
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                {themeMode === 'auto'
                  ? `Auto mode: Currently using ${theme.isDark ? 'dark' : 'light'} theme based on your system settings`
                  : `Using ${themeMode} theme`}
              </Text>
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            ABOUT
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.aboutRow}>
              <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>
                Version
              </Text>
              <Text style={[styles.aboutValue, { color: colors.text }]}>
                1.0.0
              </Text>
            </View>
            <View style={styles.aboutRow}>
              <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>
                Build
              </Text>
              <Text style={[styles.aboutValue, { color: colors.text }]}>
                Phase 1 MVP + Dark Mode
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    borderWidth: 2,
    position: 'relative',
  },
  themeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  themeLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoBox: {
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  aboutLabel: {
    fontSize: 16,
  },
  aboutValue: {
    fontSize: 16,
    fontWeight: '500',
  },
});
