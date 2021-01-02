import { Layout } from 'antd'
import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'

import App from './App'

const PriceMonitor = () => (
  <Layout className="layout" style={{ minHeight: '100%' }}>
    <Router>
      <App />
    </Router>
  </Layout>
)

ReactDOM.render(<PriceMonitor />, document.getElementById('root'))
