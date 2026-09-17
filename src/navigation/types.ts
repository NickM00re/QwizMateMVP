import type {NativeStackScreenProps} from '@react-navigation/native-stack';

export type RootStackParamList = {
  ProjectsList: undefined;
  ProjectDetail: {projectId: string; projectName: string};
  UploadNote: {projectId: string};
  Quiz: {projectId: string};
  QuizResults: {attemptId: string};
};

export type ScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
