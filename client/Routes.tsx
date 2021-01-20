import React from 'react'
import { Route, Switch } from 'react-router-dom'

import Home from './pages/Home'
import Login from './pages/Login'
import ManageMapping from './pages/ManageMapping'
import ManageProducts from './pages/ManageProducts'
import ViewReport from './pages/ViewReport'

const Routes = (): JSX.Element => (
  <Switch>
    <Route path="/" exact component={Home} />
    <Route path="/login" component={Login} />
    <Route path="/mapping" component={ManageMapping} />
    <Route path="/products" component={ManageProducts} />
    <Route path="/report" component={ViewReport} />
  </Switch>
)

export default Routes
