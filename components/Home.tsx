import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export default function HomeScreen({ navigation }: { navigation: any }) {
  const gradientProgress = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      gradientProgress.value,
      [0, 1],
      ['#FF5722', '#FFB02E'] // Gradient colors
    ),
  }));

  const handlePress = () => {
    gradientProgress.value = withTiming(gradientProgress.value === 0 ? 1 : 0, { duration: 1000 });
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Image
        source={require('../assets/campus.jpg')} // Replace with your logo path
        style={styles.logo}
      />
      <Text style={styles.title}>Campus Bites</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          handlePress();
          navigation.navigate('Admin');
        }}
      >
        <Text style={styles.buttonText}>Admin</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          handlePress();
          navigation.navigate('User');
        }}
      >
        <Text style={styles.buttonText}>User</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 100, // Adjust the width of your logo
    height: 100, // Adjust the height of your logo
    marginBottom: 20,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 15,
    margin: 10,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    elevation: 5,
  },
  buttonText: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
