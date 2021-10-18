import { createRef } from 'react';

/**
 * 2021.10.18
 * Navigation.Screen 등록되지 않은 컴포넌트에서도 navigation 객체를 참조하기 위한 trick
 * => NavigationContainer의 ref를 전역 공유하여 사용하기
 */
export const navigationRef = createRef();

export function navigate(name, params) {
  navigationRef.current?.navigate(name, params);
}