import React from 'react'
import {
  ReadingStatus,
  ReadingStatusLabels,
  type ReadingStatusValue,
} from '../../types'

interface StatusDropdownProps {
  value: ReadingStatusValue | null
  onChange: (statusId: ReadingStatusValue) => void
  disabled?: boolean
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const statusOptions = Object.entries(ReadingStatus).map(([, val]) => ({
    value: val,
    label: ReadingStatusLabels[val as ReadingStatusValue],
  }))

  return (
    <select
      value={value ?? ''}
      onChange={e => {
        const selectedValue =
          e.target.value === '' ? null : Number(e.target.value)
        if (selectedValue !== null) {
          onChange(selectedValue as ReadingStatusValue)
        }
      }}
      disabled={disabled}
      className="w-full md:w-auto px-3 py-2 bg-zinc-700 border border-amber-900/30 text-amber-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
    >
      <option value="">Select status...</option>
      {statusOptions.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

export default StatusDropdown
