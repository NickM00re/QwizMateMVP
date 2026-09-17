import React from 'react';
import {NavigationContainer, DarkTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ProjectsListScreen} from '../screens/ProjectsListScreen';
import {ProjectDetailScreen} from '../screens/ProjectDetailScreen';
import {UploadNoteScreen} from '../screens/UploadNoteScreen';
import {QuizScreen} from '../screens/QuizScreen';
import {QuizResultsScreen} from '../screens/QuizResultsScreen';
import type {RootStackParamList} from './types';
import {colors} from '../theme/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.surface,
    primary: colors.primary,
    text: colors.text,
    border: colors.border,
  },
};

export function RootNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {backgroundColor: colors.surface},
          headerTintColor: colors.text,
        }}>
        <Stack.Screen
          name="ProjectsList"
          component={ProjectsListScreen}
          options={{title: 'QwizMate'}}
        />
        <Stack.Screen
          name="ProjectDetail"
          component={ProjectDetailScreen}
          options={({route}) => ({title: route.params.projectName})}
        />
        <Stack.Screen
          name="UploadNote"
          component={UploadNoteScreen}
          options={{title: 'Add Notes'}}
        />
        <Stack.Screen
          name="Quiz"
          component={QuizScreen}
          options={{title: 'Quiz', headerBackVisible: false}}
        />
        <Stack.Screen
          name="QuizResults"
          component={QuizResultsScreen}
          options={{title: 'Results', headerBackVisible: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
