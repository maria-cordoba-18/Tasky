import React, { useState, useEffect } from 'react';
import Toast from 'react-native-root-toast';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from './src/store/useAuthStore';
import LoginScreen from './src/features/auth/screens/LoginScreen';
import RegisterScreen from './src/features/auth/screens/RegisterScreen';
import { DashboardScreen } from './src/features/tasks/screens/DashboardScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const currentUser = useAuthStore((state) => state.currentUser);

  useEffect(() => {
    // prueba rápida para verificar que los toasts se renderizan
    const toast = Toast.show('Prueba: toasts activos', { duration: Toast.durations.SHORT, position: Toast.positions.BOTTOM });
    const t = setTimeout(() => Toast.hide(toast), 1500);
    return () => clearTimeout(t);
  }, []);

  if (showWelcome) {
    return <WelcomeScreen onFinish={() => setShowWelcome(false)} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {currentUser === null ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
        )}
      </Stack.Navigator>
      {/* react-native-root-toast no necesita provider */}
    </NavigationContainer>
  );
};

export default App;