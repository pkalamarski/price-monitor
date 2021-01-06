import React from 'react'
import { Route, Switch } from 'react-router-dom'

import Home from './pages/Home'
import Login from './pages/Login'
import ViewReport from './pages/ViewReport'
import ManageProducts from './pages/ManageProducts'

const Routes = (): JSX.Element => (
  <Switch>
    <Route path="/" exact component={Home} />
    <Route path="/login" component={Login} />
    <Route path="/products" component={ManageProducts} />
    <Route path="/report" component={ViewReport} />
  </Switch>
)

export default Routes
