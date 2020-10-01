# COVID Tracker Ireland

## Getting Started

Following these instructions will allow you to run and build the project on your local machine for development and testing purposes.

### Prerequisites

Follow the official guide "[Setting up the development environment](https://reactnative.dev/docs/environment-setup)" to set up your local machine to develop iOS and Android applications with React Native.

Install an xCode version that supports iOS 13.5, required by the [ExposureNotification framework](https://developer.apple.com/documentation/exposurenotification) used by the app.

Install `yarn` globally:

```bash
npm install -g yarn
```

For other installation methods, follow the official [Installation guide](https://classic.yarnpkg.com/en/docs/install).

### Installing

Clone this repository.

Before installing the npm dependencies, you will need to authenticate to GitHub packages so that private packages can be installed. See [Authenticating to GitHub Packages](https://docs.github.com/en/packages/using-github-packages-with-your-projects-ecosystem/configuring-npm-for-use-with-github-packages#authenticating-to-github-packages) for the steps on how to configure npm.

Install the npm dependencies:

```bash
yarn install
```

Create your `.env` file or copy it from the `.env.sample`:

```bash
cp .env.sample .env
```

Move to `ios/` folder and install the CocoaPods dependencies:

```bash
cd ios && pod install
```

## Running the applications locally

Start the React Native bundler:

```bash
yarn start
```

To start the Android application, run:

```bash
yarn android
```

To start the iOS one, run:

```bash
yarn ios
```
