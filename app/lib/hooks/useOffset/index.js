import { useState, useEffect, useCallback } from 'react';

/**
 * 2020.12.22
 * Offset state 관리를 위한 hook
 * @param {Number} start    초기값
 * @param {Number} size     step 크기
 * @param {Number} limit    step 최대값
 */
export default function useOffset(start, size, data) {
  // limit: 페이지네이션의 최대값. 데이터가 없을 경우 기본값 0
  const limit = !!data ? data.length : 0;
  // renderOffset: 페이지네이션 위치를 기록하는 offset
  const [renderOffset, setRenderOffset] = useState(start || 0);
  // isDone: offset의 현재값이 최대값을 초과했는지 확인하기 위한 플래그
  const [isDone, setIsDone] = useState(renderOffset >= limit);
  const [items, setItems] = useState([]);

  useEffect(() => {
    // 데이터가 변할때마다 offset 초기화
    setRenderOffset(start);
  }, [data]);

  useEffect(() => {
    // offset 또는 데이터가 변할때마다 isDone 업데이트
    const status = renderOffset >= limit;
    if (status !== isDone) {
      setIsDone(status);
    }
  }, [renderOffset, limit]);

  function nextStep() {
    const prev = renderOffset;
    const next = renderOffset + size;

    // 다음 페이지로 offset 값 업데이트
    if (isDone === false) {
      setRenderOffset(next);
    }

    // 각 step마다 offset 값이 필요할 경우 return value를 활용함
    // ( 2020.12.24 기준 사용 X )
    return { prev, next };
  }

  const handleScrollUpdate = ({ threshold, h }) => {
    return useCallback(
      event => {
        const { y } = event.nativeEvent.contentOffset;
        const height = h || event.nativeEvent.layoutMeasurement.height;
        if (!y) {
          return;
        }
        if (y / height > threshold && isDone === false) {
          nextStep();
        }
      },
      [renderOffset, limit, isDone, threshold, h],
    );
  };

  // 2020.12.24
  // data에 대한 wrapper function
  // 요구사항 변경시 function 추가 or 수정 필요
  const list = func => {
    return data.slice(0, renderOffset).map(func);
  };

  const filter = func => {
    return data.slice(0, renderOffset).filter(func);
  };

  return {
    renderOffset,
    setRenderOffset,
    isDone,
    setIsDone,
    nextStep,
    handleScrollUpdate,
    list,
    filter,
  };
}
