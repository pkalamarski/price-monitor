import React from 'react'
import { Form, Input, Button } from 'antd'

export interface IProductValues {
  url: string
  label: string
  category: string
}

interface IProps {
  onSubmit: (values: IProductValues) => void
}

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
}
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 }
}

const AddProductForm: React.FC<IProps> = ({ onSubmit }) => {
  return (
    <Form
      {...layout}
      name="basic"
      initialValues={{ remember: true }}
      onFinish={onSubmit}
    >
      <Form.Item
        label="Url"
        name="url"
        rules={[{ required: true, message: 'Please input product url!' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Product label"
        name="label"
        rules={[{ required: true, message: 'Please input product label!' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Product category"
        name="category"
        rules={[{ required: true, message: 'Please input product category!' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item {...tailLayout}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  )
}

export default AddProductForm
