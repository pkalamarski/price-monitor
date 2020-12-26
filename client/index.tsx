import React from 'react'
import ReactDOM from 'react-dom'
import { hot } from 'react-hot-loader'

import Page from './pages/page'

const PriceMonitor = () => <Page />

const App = hot(module)(PriceMonitor)

ReactDOM.render(<App />, document.getElementById('root'))
