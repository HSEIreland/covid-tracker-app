import React, {forwardRef, useState} from 'react';
import {Text, View, TouchableWithoutFeedback, StyleSheet} from 'react-native';

import {alignWithLanguage} from '../../../services/i18n/common';

import {DropdownModal} from './modal';
import {ArrowIcon} from '../arrow-icon';
import {Spacing} from '../spacing';

import {colors} from '../../../constants/colors';
import {text} from '../../../theme';

interface DropdownProps {
  label?: string;
  placeholder: string;
  title?: string;
  items: any[];
  value: any;
  onValueChange: (value: any) => void;
  onClose?: () => void;
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

export const Dropdown = forwardRef<TouchableWithoutFeedback, DropdownProps>(
  (
    {
      label,
      placeholder,
      title,
      items,
      value,
      onValueChange,
      onClose,
      search,
      itemRenderer,
      display,
      forceDisplay,
      instructions
    },
    ref
  ) => {
    const [isModalVisible, setModalVisible] = useState(false);

    const onItemSelected = (newValue: any) => {
      setModalVisible(false);
      if (newValue !== value) {
        onValueChange(newValue);
      }
    };

    const selectedItem =
      (value && items.find((i) => i.value === value)) || null;

    let displayValue = placeholder;
    if (forceDisplay) {
      displayValue = forceDisplay();
    } else if (selectedItem) {
      displayValue = (display && display(selectedItem)) || selectedItem.label;
    }

    return (
      <>
        <TouchableWithoutFeedback
          ref={ref}
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
                {alignWithLanguage(displayValue)}
              </Text>
            </View>
            <ArrowIcon />
          </View>
        </TouchableWithoutFeedback>
        {isModalVisible && (
          <DropdownModal
            title={title || placeholder}
            items={items}
            selectedValue={value}
            onSelect={onItemSelected}
            onClose={() => {
              setModalVisible(false);
              onClose && onClose();
            }}
            search={search}
            itemRenderer={itemRenderer}
            instructions={instructions}
          />
        )}
      </>
    );
  }
);

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
  }
});
