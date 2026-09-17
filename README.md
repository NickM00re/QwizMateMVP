# QwizMate

QwizMate is an AI-powered study assistant. Students create a **project** per
course, add **notes** (typed text, documents, or photos of handwritten
notes), and QwizMate generates multiple-choice **quizzes** grounded strictly
in that material. As students answer questions, an adaptive engine tracks a
per-question mastery score so weak topics resurface more often and mastered
ones fade out — a lightweight, on-device alternative to full spaced
repetition.

This repo is the MVP scaffold: a [React Native](https://reactnative.dev)
app bootstrapped with [`@react-native-community/cli`](https://github.com/react-native-community/cli),
extended with the project-specific architecture described below.

## Architecture

```
src/
  types/models.ts        Domain model: Project, Note, Question, QuizAttempt
  services/
    storage/              Offline-first repositories (AsyncStorage-backed)
    ai/                    AiService interface + MockAiService (swap-in point
                           for a real backend/LLM integration)
    adaptive/              Adaptive quiz-selection & mastery-tracking engine
  state/                  Zustand stores (per-feature) that orchestrate the
                           services above for screens to consume
  navigation/             React Navigation stack + route param types
  screens/                ProjectsList, ProjectDetail, UploadNote, Quiz,
                           QuizResults
  components/             Shared UI primitives (Button, Card, EmptyState)
  theme/                  Centralized colors/spacing/typography
```

Key decisions for the MVP, and why:

- **Offline-first storage.** Every entity is persisted locally via
  `AsyncStorageRepository` (see `src/services/storage`). Previously
  generated notes, questions, and quiz history remain available with no
  network connection, since mobile connectivity can't be assumed.
- **AI is an interface, not a hardwired call.** `src/services/ai/AiService.ts`
  defines the contract (`generateQuestions`, `extractText`). The MVP ships
  with `MockAiService`, a deterministic local implementation so the full
  app flow (upload → generate → quiz → adapt) works without a backend.
  When a real backend exists, add a `RemoteAiService implements AiService`
  that calls it — **never call an LLM provider's API directly from the
  client**; proxy through a server so provider API keys are never bundled
  into the mobile app.
- **Adaptive learning is isolated.** `src/services/adaptive/adaptiveEngine.ts`
  implements weighted question selection (unseen/weak questions favored)
  and an exponential-moving-average mastery score, independent of any
  screen or storage code, so the algorithm can be swapped for something
  like SM-2 later without ripple effects.
- **State layer:** [Zustand](https://github.com/pmndrs/zustand) stores
  (`src/state`) call into the repositories/services and expose simple hooks
  to screens — no Redux boilerplate needed for an MVP this size.

## Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.

## Next steps for the MVP

The current build is a fully working, offline-capable app using a **mock**
AI service so the entire user flow can be demoed today. To move toward a
real product:

1. Stand up a backend (e.g. a small Node/Express or serverless API) that
   holds the LLM provider key and exposes endpoints matching `AiService`
   (`POST /projects/:id/questions`, `POST /notes/extract`).
2. Add a `RemoteAiService` in `src/services/ai/` implementing that contract
   and swap it in via `src/services/ai/index.ts`.
3. Add authentication + per-user sync (e.g. push/pull against the backend
   on top of the existing local repositories) so a student's projects
   follow them across devices.
4. Wire up `@react-native-documents/picker` and `react-native-image-picker`
   natively (`pod install` on iOS, Gradle autolinking on Android — already
   installed as dependencies) and test OCR quality on real handwritten
   notes.

