import React, { useEffect, useRef, useState } from 'react'
import { Input } from 'antd'

interface IProps {
  currentValue: string
  handleSave: (value: string) => Promise<void>
}

const EditableCell: React.FC<IProps> = ({ currentValue, handleSave }) => {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(currentValue)
  const inputRef = useRef<Input>(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
    }
  }, [editing])

  const toggleEdit = () => {
    setEditing(!editing)
  }

  const save = async () => {
    if (!value) return

    try {
      await handleSave(value)
      toggleEdit()
    } catch (errInfo) {
      console.log('Save failed:', errInfo)
    }
  }

  const childNode = editing ? (
    <Input
      value={value}
      ref={inputRef}
      onChange={(e) => setValue(e.target.value)}
      onPressEnter={save}
      onBlur={save}
    />
  ) : (
    <div
      className="editable-cell-value-wrap"
      style={{
        paddingRight: 24
      }}
      onClick={toggleEdit}
    >
      {currentValue === value ? value : currentValue}
    </div>
  )

  return <>{childNode}</>
}

export default EditableCell
