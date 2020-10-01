import {useEffect, useCallback, useMemo, createRef, RefObject} from 'react';
import {findNodeHandle, AccessibilityInfo} from 'react-native';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';

interface FocusRefProps {
  accessibilityFocus?: boolean;
  accessibilityRefocus?: boolean;
  count?: number;
  timeout?: number;
}

export function setAccessibilityFocusRef(ref: RefObject<any>) {
  if (ref.current) {
    const tag = findNodeHandle(ref.current);
    tag &&
      setTimeout(
        () => ref.current && AccessibilityInfo.setAccessibilityFocus(tag),
        250
      );
  }
}

export function useFocusRef<T = any>(
  props: FocusRefProps = {}
): RefObject<T>[] {
  const {
    accessibilityFocus = true,
    accessibilityRefocus = false,
    count = 1,
    timeout = 250
  } = props;
  const refs = useMemo(
    () => Array.from({length: count}).map(() => createRef<any>()),
    [count]
  );
  const isFocused = useIsFocused();

  useEffect(() => {
    if (accessibilityFocus) {
      const firstRefIdx = refs.findIndex(
        (ref) => ref.current && findNodeHandle(ref.current)
      );
      if (firstRefIdx !== -1) {
        const firstRef = refs[firstRefIdx];
        const tag = findNodeHandle(firstRef.current);
        tag &&
          setTimeout(
            () =>
              firstRef.current && AccessibilityInfo.setAccessibilityFocus(tag),
            timeout
          );
      }
    }
  }, [accessibilityFocus, timeout, refs]);

  useFocusEffect(
    useCallback(() => {
      if (accessibilityFocus && accessibilityRefocus && isFocused) {
        const firstRef = refs.find(
          (ref) => ref.current && findNodeHandle(ref.current)
        );
        if (firstRef) {
          const tag = findNodeHandle(firstRef.current);
          tag &&
            setTimeout(
              () =>
                firstRef.current &&
                AccessibilityInfo.setAccessibilityFocus(tag),
              timeout
            );
        }
      }
    }, [accessibilityFocus, accessibilityRefocus, timeout, isFocused, refs])
  );

  return refs;
}
