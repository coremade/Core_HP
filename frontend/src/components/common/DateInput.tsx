import React, { useRef, useState, useEffect } from 'react';
import { formatDateForAPI, formatDateForDisplay } from '@/utils/projectUtils';

interface DateInputProps {
  name: string;
  value: string | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  required?: boolean;
  disabled?: boolean;
}

const DateInput: React.FC<DateInputProps> = ({ 
  name, 
  value, 
  onChange, 
  label, 
  required = false,
  disabled = false 
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [displayValue, setDisplayValue] = useState('');

  // 날짜 유효성 검사
  const isValidDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length <= 8) {
      setDisplayValue(val);
    }
  };

  const handleTextBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    
    if (!val) {
      onChange({ ...e, target: { ...e.target, name, value: '' } });
      setDisplayValue('');
      return;
    }

    if (val.length === 8) {
      const formattedDate = formatDateForAPI(val);
      if (formattedDate && isValidDate(formattedDate)) {
        onChange({ ...e, target: { ...e.target, name, value: val } });
        setDisplayValue(val);
      } else {
        alert('올바른 날짜를 입력해주세요.');
        setDisplayValue(formatDateForDisplay(value?.toString()));
      }
    } else if (val.length > 0) {
      alert('YYYYMMDD 형식으로 입력해주세요.');
      setDisplayValue(formatDateForDisplay(value?.toString()));
    }
  };

  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    if (selectedDate) {
      const yyyymmdd = formatDateForDisplay(selectedDate);
      setDisplayValue(yyyymmdd);
      onChange({ ...e, target: { ...e.target, name, value: yyyymmdd } });
    }
  };

  // value가 변경될 때 displayValue 업데이트
  useEffect(() => {
    setDisplayValue(formatDateForDisplay(value?.toString()));
  }, [value]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          name={name}
          value={displayValue}
          onChange={handleTextChange}
          onBlur={handleTextBlur}
          placeholder="YYYYMMDD"
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-10 ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          required={required}
          disabled={disabled}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          <input
            type="date"
            value={value ? formatDateForAPI(value.toString()) : ''}
            onChange={handleDateSelect}
            className={`absolute opacity-0 w-full h-full cursor-pointer ${
              disabled ? 'cursor-not-allowed' : ''
            }`}
            disabled={disabled}
          />
          <svg className={`h-5 w-5 text-gray-400 pointer-events-none ${
            disabled ? 'opacity-50' : ''
          }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default DateInput; 