import React from 'react'
import Axios from 'axios'
import { useHistory } from 'react-router-dom'

import Title from 'antd/lib/typography/Title'
import { Form, Input, Button, Space } from 'antd'

interface ILoginValues {
  username: string
  password: string
}

const Login = () => {
  const history = useHistory()

  const onSubmit = async (values: ILoginValues) => {
    try {
      const { data } = await Axios.post('/api/login', values)

      if (data?.token) {
        history.push('/')
      }
    } catch {
      alert('Invalid username or password')
    }
  }

  return (
    <Space style={{ display: 'flex', justifyContent: 'center' }}>
      <Form
        name="normal_login"
        className="login-form"
        initialValues={{
          remember: true
        }}
        onFinish={onSubmit}
      >
        <Form.Item>
          <Title style={{ textAlign: 'center' }}>Login</Title>
        </Form.Item>
        <Form.Item
          name="username"
          rules={[
            {
              required: true,
              message: 'Please input your Username!'
            }
          ]}
        >
          <Input placeholder="Username" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              message: 'Please input your Password!'
            }
          ]}
        >
          <Input type="password" placeholder="Password" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
            style={{ width: '100%' }}
          >
            Log in
          </Button>
        </Form.Item>
      </Form>
    </Space>
  )
}

export default Login
