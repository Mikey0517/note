import React, { Component } from "react"
import { Link } from "react-router-dom"
import { Layout, Menu } from "antd"
import { MailOutlined } from "@ant-design/icons"
import { menu, defaultSelectedKeys, defaultOpenKeys } from "../config/menu.config"
import Login from "../components/Login"
import { os } from "../common"

const { Header, Footer, Sider, Content } = Layout
const { SubMenu } = Menu

class DefaultLayout extends Component {
  constructor ( props ) {
    super( props )
    this.state = {
      collapsed: false,
      openKeys: [],
    }
    this.prevPathname = "";
    this.rootSubmenuKeys = [];
  }

  componentDidMount () {
    this.onCollapse( !os().isPc )
  }

  componentDidUpdate () {
    const { pathname } = location
    if ( this.prevPathname !== pathname ) {
      this.prevPathname = pathname;
      this.setState( { openKeys: [ pathname === "/" ? defaultOpenKeys : `/${ pathname.split( "/" )[ 1 ] }` ] } )
    }
  }

  onCollapse ( collapsed ) {
    this.setState( { collapsed } )
  }

  onOpenChange ( openKeys ) {
    const latestOpenKey = openKeys.find( key => this.state.openKeys.indexOf( key ) === -1 )
    if ( this.rootSubmenuKeys.indexOf( latestOpenKey ) === -1 ) {
      this.setState( { openKeys } )
    } else {
      this.setState( {
        openKeys: latestOpenKey ? [ latestOpenKey ] : [],
      } )
    }
  }

  renderMenuTree ( menu, predPath ) {
    if ( predPath === "" ) this.rootSubmenuKeys = []
    return menu.map( item => {
      const key = `${ predPath }${ item.path }`
      if ( item.children !== void 0 && Array.isArray( item.children ) ) {
        this.rootSubmenuKeys.push( key )
        return (
          <SubMenu
            key={ key }
            title={
              <span>
                <MailOutlined/>
                <span>{ item.title }</span>
              </span>
            }
          >
            { this.renderMenuTree( item.children, key ) }
          </SubMenu>
        )
      } else {
        return (
          <Menu.Item key={ key }>
            <Link to={ key }>{ item.title }</Link>
          </Menu.Item>
        )
      }
    } )
  }

  render () {
    const { collapsed, openKeys } = this.state
    const { children, location } = this.props
    const { pathname } = location
    return (
      <Layout>
        <Header>
          <Login/>
        </Header>
        <Layout hasSider style={ { background: "#FFFFFF" } }>
          <Sider width={ 256 } collapsible collapsed={ collapsed } onCollapse={ this.onCollapse.bind( this ) }>
            <Menu
              theme="dark"
              style={ { height: "100%" } }
              selectedKeys={ [ pathname === "/" ? defaultSelectedKeys : pathname ] }
              openKeys={ openKeys }
              onOpenChange={ this.onOpenChange.bind( this ) }
              mode="inline"
            >
              { this.renderMenuTree( menu, "" ) }
            </Menu>
          </Sider>
          <Content>{ children }</Content>
        </Layout>
        <Footer>Footer</Footer>
      </Layout>
    )
  }
}

export default DefaultLayout
