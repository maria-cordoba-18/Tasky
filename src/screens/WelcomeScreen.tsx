import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

type Props = {
  onFinish: () => void;
};

const WelcomeScreen = ({ onFinish }: Props) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 3000); // 3 segundos

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido</Text>
      <Text style={styles.title}>ADSO 3145650</Text>
      <Text style={styles.subtitle}>Creado por</Text>
      <Text style={styles.name}>Maria Gladys Córdoba Gómez</Text>
      <ActivityIndicator
        size="large"
        color="#ffffff"
        style={styles.loader}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  welcome: {
    fontSize: 22,
    color: '#CBD5E1',
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#F1F5F9',
    marginBottom: 32,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#CBD5E1',
    marginBottom: 6,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#A5B4FC',
    textAlign: 'center',
  },
  loader: {
    marginTop: 48,
  },
});

export default WelcomeScreen;