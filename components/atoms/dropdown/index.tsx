import React, {useState} from 'react';
import {
  Text,
  View,
  TouchableWithoutFeedback,
  StyleSheet,
  Image
} from 'react-native';

import {DropdownModal} from './modal';
import {colors} from '../../../constants/colors';
import {Spacing} from '../spacing';
import {text} from '../../../theme';

interface DropdownProps {
  label?: string;
  placeholder: string;
  title?: string;
  items: any[];
  value: any;
  onValueChange: (value: any) => void;
  search?: {
    placeholder: string;
    term: string;
    onChange: (value: string) => void;
    noResults: string;
  };
  itemRenderer?: (item: any) => React.ReactNode;
  display?: (item: any) => string;
  forceDisplay?: () => string;
  instructions?: () => React.ReactNode;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  placeholder,
  title,
  items,
  value,
  onValueChange,
  search,
  itemRenderer,
  display,
  forceDisplay,
  instructions
}) => {
  const [isModalVisible, setModalVisible] = useState(false);

  const onItemSelected = (newValue: any) => {
    setModalVisible(false);
    if (newValue !== value) {
      onValueChange(newValue);
    }
  };

  const selectedItem = (value && items.find((i) => i.value === value)) || null;

  let displayValue = placeholder;
  if (forceDisplay) {
    displayValue = forceDisplay();
  } else if (selectedItem) {
    displayValue = (display && display(selectedItem)) || selectedItem.label;
  }

  return (
    <>
      <TouchableWithoutFeedback
        accessibilityTraits={['button']}
        accessibilityComponentType="button"
        onPress={() => setModalVisible(true)}>
        <View style={styles.container}>
          <View style={styles.content}>
            {label && (
              <>
                <Text style={[text.smallBold, {color: colors.text}]}>
                  {label}
                </Text>
                <Spacing s={8} />
              </>
            )}
            <Text numberOfLines={1} style={styles.displayValue}>
              {displayValue}
            </Text>
          </View>
          <Image
            accessibilityIgnoresInvertColors
            style={styles.arrowSize}
            {...styles.arrowSize}
            source={require('../../../assets/images/arrow-right/teal.png')}
          />
        </View>
      </TouchableWithoutFeedback>
      {isModalVisible && (
        <DropdownModal
          title={title || placeholder}
          items={items}
          selectedValue={value}
          onSelect={onItemSelected}
          onClose={() => setModalVisible(false)}
          search={search}
          itemRenderer={itemRenderer}
          instructions={instructions}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  content: {
    flex: 1
  },
  displayValue: {
    ...text.largeBold,
    color: colors.teal
  },
  arrowSize: {
    width: 24,
    height: 24
  }
});
