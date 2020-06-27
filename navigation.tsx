import React from 'react';
import {NavigationContainerRef} from '@react-navigation/native';

export const isMountedRef = React.createRef<boolean>();

export const navigationRef = React.createRef<NavigationContainerRef>();
