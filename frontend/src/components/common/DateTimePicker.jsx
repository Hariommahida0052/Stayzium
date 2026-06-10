import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';
import dayjs from 'dayjs';
import { Calendar } from 'lucide-react';

const DateTimePicker = ({ 
  selected, 
  onChange, 
  minDate, 
  placeholderText = "Select Date & Time",
  className = ""
}) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className={`relative flex items-center w-full custom-mui-picker ${className}`}>
        <MobileDateTimePicker
          value={selected ? dayjs(selected) : null}
          onChange={(newValue) => {
            onChange(newValue ? newValue.toDate() : null);
          }}
          minDateTime={minDate ? dayjs(minDate) : dayjs()}
          slotProps={{
            textField: {
              placeholder: placeholderText,
              fullWidth: true,
              variant: "outlined",
              sx: {
                '& .MuiOutlinedInput-root': {
                  paddingLeft: '1rem',
                  paddingRight: '0.75rem',
                  height: '52px',
                  borderRadius: '0.75rem',
                  backgroundColor: '#ffffff',
                  fontSize: '1rem',
                  fontWeight: 500,
                  color: '#1f2937',
                  '& fieldset': {
                    borderWidth: '2px',
                    borderColor: '#e5e7eb',
                    transition: 'all 0.2s',
                  },
                  '&:hover fieldset': {
                    borderColor: '#d1d5db',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#2962ff',
                    boxShadow: '0 0 0 4px rgba(41, 98, 255, 0.1)',
                  },
                  '& input': {
                    paddingTop: 0,
                    paddingBottom: 0,
                    height: '100%',
                    boxSizing: 'border-box'
                  }
                }
              }
            }
          }}
        />
      </div>
    </LocalizationProvider>
  );
};

export default DateTimePicker;
