import React, { useMemo } from 'react';
import { Calendar } from 'react-native-calendars';
import { parseDate } from './searchView.constant';

export default function SearchDatePicker({ value, onChange }) {
  const selectedValue = useMemo(() => parseDate(value), [value]);
  return (
    <Calendar
      minDate={'2000-01-01'}
      maxDate={'2099-12-31'}
      onDayPress={onChange}
      markedDates={{
        [selectedValue]: { selected: true },
      }}
    />
  );
}
