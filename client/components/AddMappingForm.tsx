import React from 'react'
import { Form, Input, Button, Checkbox } from 'antd'

export interface IMappingValues {
  host: string
  priceSelector: string
  isPuppeteer?: boolean
  isMetaTag?: boolean
}

interface IProps {
  onSubmit: (values: IMappingValues) => void
}

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
}
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 }
}

const AddMappingForm: React.FC<IProps> = ({ onSubmit }) => {
  return (
    <Form {...layout} name="basic" onFinish={onSubmit}>
      <Form.Item
        label="Host"
        name="host"
        rules={[{ required: true, message: 'Please input host!' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Price selector"
        name="priceSelector"
        rules={[{ required: true, message: 'Please input price selector!' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item {...tailLayout} name="usePuppeteer" valuePropName="checked">
        <Checkbox>Use Puppeteer?</Checkbox>
      </Form.Item>

      <Form.Item {...tailLayout} name="isMetaTag" valuePropName="checked">
        <Checkbox>Is meta tag?</Checkbox>
      </Form.Item>

      <Form.Item {...tailLayout}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  )
}

export default AddMappingForm
