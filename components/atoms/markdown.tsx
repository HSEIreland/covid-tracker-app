import React, {Children, isValidElement, ReactChildren} from 'react';
import {
  Text,
  StyleSheet,
  View,
  TextStyle,
  ViewStyle,
  I18nManager,
  TouchableOpacity
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';

// @ts-ignore - module does not have types
import M from 'react-native-easy-markdown';

import {useApplication} from '../../providers/context';

import {Link} from '../atoms/link';

import {colors} from '../../constants/colors';
import {baseStyles, text} from '../../theme';

interface Markdown {
  style?: object;
  markdownStyles?: object;
  forceLTR?: boolean;
}

const MarkdownLink = (
  href: string,
  title: string,
  children: any,
  key: string,
  navigation: any,
  style: TextStyle,
  screenReaderEnabled: boolean
) => {
  const isHttp = href.startsWith('http');

  if (!isHttp) {
    return (
      <Link key={key} onPress={() => navigation.navigate(href)} role="button">
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

  return screenReaderEnabled ? (
    <TouchableOpacity
      key={key}
      accessibilityRole="link"
      accessibilityHint={title}
      accessibilityLabel={childrenAsText(children)}
      onPress={handle}>
      <Text style={style}>{children}</Text>
    </TouchableOpacity>
  ) : (
    <Text
      key={key}
      accessible={true}
      accessibilityRole="link"
      accessibilityHint={title}
      onPress={handle}
      style={style}>
      {children}
    </Text>
  );
};

const childrenAsText = (
  children: React.ReactChildren | React.ReactNode | undefined,
  joiner: string = ''
): string =>
  children
    ? (React.Children.toArray(children).reduce(
        (str, child) =>
          `${str}${joiner}${
            React.isValidElement(child)
              ? childrenAsText(child.props.children, joiner)
              : `${child}`
          }`,
        ''
      ) as string)
    : '';

const Markdown: React.FC<Markdown> = ({
  style,
  markdownStyles = {},
  forceLTR = false,
  children: C
}) => {
  const navigation = useNavigation();
  const {
    accessibility: {screenReaderEnabled}
  } = useApplication();

  const combinedStyles: Record<string, ViewStyle | TextStyle> = {
    ...localMarkdownStyles,
    ...markdownStyles
  };

  if (forceLTR && I18nManager.isRTL) {
    Object.entries(combinedStyles).forEach(([styleKey, mdStyle]) => {
      const flipFlex: ViewStyle =
        mdStyle.flexDirection === 'row'
          ? {
              flexDirection: 'row-reverse'
            }
          : {};

      combinedStyles[styleKey] = {
        ...mdStyle,
        ...baseStyles.forceLTR,
        ...flipFlex
      };
    });
  }

  return (
    <M
      markdownStyles={combinedStyles}
      style={style || styles.container}
      renderBlock={(children: ReactChildren, key: string | number) =>
        renderBlock(children, key, combinedStyles)
      }
      renderText={(textType: string, children: ReactChildren, key: string) =>
        renderText(combinedStyles, textType, children, key, screenReaderEnabled)
      }
      renderLink={(
        href: string,
        title: string,
        children: ReactChildren,
        key: string
      ) =>
        MarkdownLink(
          href,
          title,
          children,
          key,
          navigation,
          combinedStyles.link,
          screenReaderEnabled
        )
      }>
      {C}
    </M>
  );
};

const headings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

const renderText = (
  combinedStyles: Record<string, TextStyle>,
  textType: string,
  children: ReactChildren | string,
  key: string,
  screenReaderEnabled: boolean
) => {
  const style = combinedStyles[textType];

  const textContent = childrenAsText(children);
  // Don't read spacer blocks like '==== ' like 'equals equals equals equals'
  // Regex matches text that is nothing but - or = or whitespace (inc newlines)
  // and contains at least one ==, -- etc (so it won't match a bold single =)
  if (textContent.match(/^[-=\s]*[-=]{2,}[-=\s]*$/)) {
    return (
      <View
        key={key}
        accessibilityElementsHidden={true}
        importantForAccessibility="no-hide-descendants">
        <Text style={style}>{children}</Text>
      </View>
    );
  }

  // Links at end of paragraphs leave stray '.'s when links become accessible blocks
  if (screenReaderEnabled && textContent.trim() === '.') {
    return null;
  }

  // Accessible block links within paragraphs leave stray '.'s at the start of the next text
  const trimmedChildren =
    screenReaderEnabled && typeof children === 'string'
      ? children.replace(/^\s+[.,:;]\s+/, '')
      : children;

  if (headings.includes(textType)) {
    return (
      <View accessible accessibilityRole="header" key={key}>
        <Text style={style}>{trimmedChildren}</Text>
      </View>
    );
  }
  return (
    // Be careful applying styles here as they'll apply inside links, headers etc
    <Text key={key} style={style}>
      {trimmedChildren}
    </Text>
  );
};

const renderBlock = (
  children: ReactChildren,
  key: string | number,
  combinedStyles: Record<string, TextStyle>
) => (
  // Wrap Text children in styled Text else Android loses styles when sibling is a View
  // e.g. a paragraph containing plain text and a link when screenreader is enabled
  <View style={combinedStyles.block} key={key}>
    {Children.map(children, (child, index) =>
      isValidElement(child) &&
      // @ts-ignore - element can have this property
      child.type?.displayName === 'Text' ? (
        <Text
          style={[combinedStyles.text, styles.textWithinBlock]}
          key={`blocktext_${index}`}>
          {child}
        </Text>
      ) : (
        child
      )
    )}
  </View>
);

const localMarkdownStyles = StyleSheet.create({
  h1: text.xlargeBold,
  h2: text.largeBold,
  text: {
    ...text.default,
    flexWrap: 'wrap',
    marginBottom: 8
  },
  block: {
    ...text.default,
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
    marginEnd: 12
  },
  listItemContent: {
    flex: 1,
    marginTop: 12
  },
  strong: {
    ...text.defaultBold
  }
});

const closeContactHeader = {
  ...text.xlargeBold,
  marginTop: 24,
  marginBottom: 16
};

export const closeContactMarkdownStyles = {
  h1: closeContactHeader,
  h2: closeContactHeader,
  h3: closeContactHeader,
  block: {
    ...text.default,
    marginBottom: 16
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4
  },
  listItemContent: {
    flex: 1,
    margin: 4
  },
  listItemBullet: {
    width: 4,
    backgroundColor: colors.green,
    height: '100%',
    marginEnd: 12
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    flex: 1
  },
  textWithinBlock: {
    marginBottom: 0
  }
});

export {Markdown};
