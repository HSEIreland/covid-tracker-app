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

interface ListItem {
  value: any;
  label: string;
}

interface SelectListProps {
  items: ListItem[];
  selectedValue?: any;
  onItemSelected: (value: any) => void;
}

export const SelectList: FC<SelectListProps> = ({
  items,
  selectedValue,
  onItemSelected
}) => {
  const renderItem = ({label, value}: ListItem, index: number) => {
    const isLast = index === items.length - 1;
    let color = colors.text;
    let backgroundColor = colors.gray;
    if (value === selectedValue) {
      color = colors.white;
      backgroundColor = colors.teal;
    }

    return (
      <TouchableWithoutFeedback
        key={`item-${index}`}
        onPress={() => onItemSelected(value)}
        accessibilityLabel={
          value === selectedValue ? `${label} selected` : `${label} unselected`
        }
        accessibilityRole="checkbox">
        <View
          style={[styles.row, {backgroundColor}, isLast && styles.lastItem]}>
          <View style={styles.icon}>
            {value === selectedValue ? <IconSelected /> : <IconNotSelected />}
          </View>
          <Text style={[text.defaultBold, {color}]}>{label}</Text>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  return <View>{items.map(renderItem)}</View>;
};

const IconSelected = () => (
  <Image
    accessibilityIgnoresInvertColors
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
  }
});
