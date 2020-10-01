import React from 'react';
import {Text, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import M from 'react-native-easy-markdown';

import {Link} from '../atoms/link';

import {colors} from '../../constants/colors';
import {text} from '../../theme';

interface Markdown {
  style?: object;
  markdownStyles?: object;
}

const MarkdownLink = (
  href: string,
  title: string,
  children: any,
  key: string,
  navigation: any
) => {
  const isHttp = href.startsWith('http');

  if (!isHttp) {
    return (
      <Link key={key} onPress={() => navigation.navigate(href)}>
        {children}
      </Link>
    );
  }

  const handle = () => {
    WebBrowser.openBrowserAsync(href, {
      enableBarCollapsing: true,
      showInRecents: true
    });
  };

  return (
    <Text key={key} onPress={handle}>
      {children}
    </Text>
  );
};

const Markdown: React.FC<Markdown> = ({
  style,
  markdownStyles = {},
  children: C
}) => {
  const navigation = useNavigation();

  const combinedStyles = {
    ...localMarkdownStyles,
    ...markdownStyles
  };

  return (
    <M
      markdownStyles={combinedStyles}
      style={style || styles.container}
      renderLink={(href, title, children, key) =>
        MarkdownLink(href, title, children, key, navigation)
      }>
      {C}
    </M>
  );
};

const localMarkdownStyles = StyleSheet.create({
  h1: text.xlargeBold,
  h2: text.largeBold,
  text: {
    ...text.default,
    flexWrap: 'wrap',
    marginBottom: 8
  },
  block: {
    marginBottom: 8
  },
  link: {
    ...text.defaultBold,
    color: colors.teal
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  listItemNumber: {
    ...text.xxlargeBlack,
    color: colors.teal,
    marginRight: 12
  },
  listItemContent: {
    flex: 1,
    marginTop: 12
  },
  strong: {
    ...text.defaultBold
  }
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    flex: 1
  }
});

export {Markdown};
