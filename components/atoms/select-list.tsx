import React, {FC} from 'react';
import {
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  Text,
  Image
} from 'react-native';
import {colors} from '../../constants/colors';
import {text} from '../../theme';
import {Markdown} from './markdown';

interface ListItem {
  value: any;
  label: string;
  a11yLabel?: string;
}

interface ItemTextProps {
  color: string;
}

interface SelectListProps {
  items: ListItem[];
  title?: string;
  selectedValue?: any;
  markdown?: boolean;
  onItemSelected: (value: any) => void;
}

const DefaultItemText: FC<ItemTextProps> = ({children, color}) => (
  <Text style={[styles.textWrap, text.defaultBold, {color}]}>{children}</Text>
);

const MarkdownItemText: FC<ItemTextProps> = ({children, color}) => {
  const style = {...styles.markdown, color};
  return (
    <Markdown
      style={{...style, ...styles.textWrap}}
      markdownStyles={{
        text: style,
        block: style,
        strong: {...style, ...text.defaultBold, color}
      }}>
      {children}
    </Markdown>
  );
};

export const SelectList: FC<SelectListProps> = ({
  items,
  title,
  selectedValue,
  markdown = false,
  onItemSelected
}) => {
  const renderItem = ({value, label, a11yLabel}: ListItem, index: number) => {
    const isLast = index === items.length - 1;
    let color: string = colors.text;
    let backgroundColor: string = colors.gray;
    if (value === selectedValue) {
      color = colors.white;
      backgroundColor = colors.teal;
    }

    const ItemText = markdown ? MarkdownItemText : DefaultItemText;

    return (
      <TouchableWithoutFeedback
        key={`item-${index}`}
        onPress={() => onItemSelected(value)}
        accessibilityLabel={
          title ? `${a11yLabel || label}, ${title}` : a11yLabel || label
        }
        accessibilityRole="radio"
        accessibilityState={{selected: value === selectedValue}}>
        <View
          style={[styles.row, {backgroundColor}, isLast && styles.lastItem]}>
          <View style={styles.icon}>
            {value === selectedValue ? <IconSelected /> : <IconNotSelected />}
          </View>
          <ItemText color={color}>{label}</ItemText>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  return <View>{items.map(renderItem)}</View>;
};

const IconSelected = () => (
  <Image
    style={styles.iconSize}
    width={styles.iconSize.width}
    height={styles.iconSize.height}
    source={require('../../assets/images/check-mark/check-mark.png')}
  />
);

const IconNotSelected = () => <View style={styles.circle} />;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    borderWidth: 1
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: `${colors.dot}80`,
    borderRadius: 8,
    marginBottom: 8
  },
  icon: {
    marginRight: 12
  },
  textWrap: {
    flex: 1
  },
  circle: {
    width: 26,
    height: 26,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: `${colors.dot}80`,
    borderRadius: 13
  },
  iconSize: {
    width: 26,
    height: 26
  },
  lastItem: {
    marginBottom: 0
  },
  markdown: {
    ...text.default,
    backgroundColor: 'transparent'
  }
});
