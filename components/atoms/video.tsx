import React, {FC, useState} from 'react';
import {LayoutChangeEvent, Platform, StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import YoutubePlayer from 'react-native-youtube-iframe';
import * as WebBrowser from 'expo-web-browser';

import {useAppState} from '../../hooks/app-state';
import {useApplication} from '../../providers/context';
import {setAccessibilityFocusRef, useFocusRef} from '../../hooks/accessibility';

import {Button} from './button';
import {Spacing} from './spacing';

interface VideoProps {
  videoId: string;
  aspectRatio?: number;
  onReady?: () => void;
  hidden?: boolean;
  autoPlay?: boolean;
  autoBuffer?: boolean;
}

const defaultAspectRatio = 16 / 9;

export const Video: FC<VideoProps> = ({
  videoId,
  onReady,
  hidden,
  autoPlay = false,
  autoBuffer = false,
  aspectRatio = defaultAspectRatio
}) => {
  const {
    accessibility: {screenReaderEnabled}
  } = useApplication();

  const {t} = useTranslation();

  const voiceoverOn = Platform.OS === 'ios' && screenReaderEnabled;

  // Inner Youtube player says "Indeterminate time" then crashes if selected
  // by iOS Voiceover before buffering has downloaded video metadata
  const [playing, setPlaying] = useState(voiceoverOn || autoPlay || autoBuffer);
  const [buffering, setBuffering] = useState(false);

  const [appState] = useAppState();
  const [height, setHeight] = useState(165);

  const [playPauseRef] = useFocusRef({count: 1, accessibilityFocus: false});

  // Set height to fit screen
  const onLayoutHandler = ({
    nativeEvent: {
      layout: {width}
    }
  }: LayoutChangeEvent) => {
    setHeight(width / aspectRatio);
  };

  if (appState !== 'active' && playing) {
    // Google require YouTube embeds to manually pause if screen off
    setPlaying(false);
  }

  const togglePlay = () => {
    setPlaying(!playing);
    setAccessibilityFocusRef(playPauseRef);
  };

  const buttonLabel = playing ? t('tutorial:pause') : t('tutorial:play');

  return (
    <View onLayout={onLayoutHandler} style={hidden ? styles.hidden : undefined}>
      {screenReaderEnabled && (
        <>
          <Button
            type="empty"
            onPress={togglePlay}
            buttonRef={playPauseRef}
            // accessibilityHint is re-read when it changes while focussed
            accessibilityHint={buttonLabel}>
            {buttonLabel}
          </Button>
          <Spacing s={8} />
        </>
      )}
      <YoutubePlayer
        play={playing}
        onReady={onReady}
        onChangeState={(event) => {
          if (event === 'buffering') {
            setBuffering(true);
          }
          if (event === 'playing') {
            setPlaying(buffering ? autoPlay : true);
            setBuffering(false);
          }
          if (event === 'paused') {
            setPlaying(false);
          }
        }}
        height={height}
        videoId={videoId}
        webViewProps={{
          androidLayerType: 'hardware',
          onShouldStartLoadWithRequest: (request) => {
            if (
              // the url react-native-youtube-iframe uses
              request.url.includes('about:blank') ||
              // the url of the YouTube embed
              request.url.includes(`embed/${videoId}`)
            ) {
              return true;
            } else {
              setPlaying(false);
              WebBrowser.openBrowserAsync(request.url, {
                enableBarCollapsing: true,
                showInRecents: true
              });

              return false;
            }
          },
          startInLoadingState: true
        }}
        // a required prop in react-native-youtube-iframe
        initialPlayerParams={{}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  hidden: {
    opacity: 0,
    height: 0
  }
});
