import React from 'react';
import {PixelRatio, StyleSheet} from 'react-native';
import {View} from 'react-native';
import {WebView, WebViewMessageEvent} from 'react-native-webview';

export type ReCaptchaResult =
  | {type: 'success'; token: string}
  | {type: 'expired'}
  | {type: 'error'; error: any}
  | {type: 'loaded'};

interface ReCaptchaProps {
  sitekey: string; // your site key of Google captcha
  onMessage: (result: ReCaptchaResult) => void; //  callback after received a successful or an expired response, or error of Google captcha
  languageCode?: string; // can be found at https://developers.google.com/recaptcha/docs/language
  baseUrl?: string; // the base URL to be used for any relative links in the HTML
  size?: 'normal' | 'compact';
  theme?: 'light' | 'dark';
}

export const ReCaptcha: React.FC<ReCaptchaProps> = ({
  sitekey,
  onMessage,
  languageCode = 'en',
  baseUrl = 'http://localhost',
  size = 'normal',
  theme = 'light'
}) => {
  const generateWebViewContent = () => {
    return `<html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width">
      <style>
        html,
        body {
          margin: 0;
          padding: 0;
          border: 0;
          width: 100%;
          display: flex;
        }
        #recaptcha {
          width: 100%;
          justify-content: space-around;
          align-items: center;
          display: flex;
        }
      </style>
      <script type="text/javascript">
        var onloadCallback = () => {
          const onLoad = () => window.ReactNativeWebView.postMessage(
            JSON.stringify({type:"loaded"})
          )
          const onSuccessfulResponse = (token) =>
            window.ReactNativeWebView.postMessage(
              JSON.stringify({type:"success",token})
            )
          const onExpiredResponse = () =>
            window.ReactNativeWebView.postMessage(
              JSON.stringify({type:"expired"})
            )
          const onError = (error) => window.ReactNativeWebView.postMessage(
            JSON.stringify({type:"error",error})
          )
          grecaptcha.render("recaptcha", {
            sitekey: "${sitekey}",
            size: "${size}",
            theme: "${theme}",
            callback: onSuccessfulResponse,
            "expired-callback": onExpiredResponse,
            "error-callback": onError,
          });
          onLoad();
        };
      </script>
    </head>
    <body>
      <div id="recaptcha"></div>
      <script
        src="https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit&hl=${languageCode}"
        async
        defer
      ></script>
    </body>
  </html>
  `;
  };

  const onMessageFromWebView = (event: WebViewMessageEvent) => {
    try {
      return onMessage(JSON.parse(event.nativeEvent.data) as ReCaptchaResult);
    } catch (err) {
      return onMessage({type: 'error', error: err});
    }
  };

  const fontScale = PixelRatio.getFontScale();
  const maxTextZoom = 140; // Above this, "Verify" button and image description overflow
  const textZoom = Math.min(maxTextZoom, fontScale * 100);

  return (
    // No accessibilityIgnoresInvertColors here: it fixes sample image, but breaks test images
    // Showing the test images correctly is more important than the sample image
    <View style={styles.wrapper}>
      <WebView
        originWhitelist={['*']}
        mixedContentMode={'always'}
        textZoom={textZoom}
        javaScriptEnabled
        source={{
          html: generateWebViewContent(),
          baseUrl
        }}
        style={styles.webView}
        onMessage={onMessageFromWebView}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: '100%',
    flexDirection: 'column'
  },
  webView: {
    backgroundColor: 'transparent'
  }
});
