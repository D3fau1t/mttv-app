import React, { Component, Suspense, lazy } from 'react'
import { HashRouter as Router, Route, Redirect, Switch } from "react-router-dom"
// import Analytics from 'electron-google-analytics'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import $ from 'jquery'
import MainNav from './render/components/MainNav/MainNav'
import Login from './render/pages/Login'
import SettingsModal from './render/components/Settings/SettingsModal'
import icon from './img/icon.png'
import './libs/libs.css'
import './index.css'
import './App.css'
import './Media.css'

const Home = lazy(() => import('./render/pages/Home'))
const Search = lazy(() => import('./render/pages/Search'))
const Games = lazy(() => import('./render/pages/Games'))
const Watch = lazy(() => import('./render/pages/Watch'))
const Channel = lazy(() => import('./render/pages/Channel'))
const Following = lazy(() => import('./render/pages/Following'))
const Notifications = lazy(() => import('./render/pages/Notifications'))
const MultiStream = lazy(() => import('./render/pages/MultiStream'))

const remote = window.require("electron").remote
const main = remote.require("./main.js")

const api = require('twitch-api-v5')
api.clientID = 'lxtgfjpg12cxsvpy32vg5x7a1ie6mc'

// const APP_VERSION = "0.2.3"
// const USER_ID = main.getAppID()
// const APP_NAME = "MTTV"
// const APP_ID = "com.mttv.app"

// const analytics = new Analytics('UA-133347961-3')

// analytics.set('uid', USER_ID)

// const analyticsTestScreen = () => {
//   return analytics.screen(APP_NAME, APP_VERSION, APP_ID, 'com.mttv.installer', 'screenTest', USER_ID)
//   .then((response) => {
//     console.log(response)
//     return response
//   }).catch((err) => {
//     console.log(err)
//     return err
//   })
// }

// const analyticsTestPageView = () => {
//   return analytics.pageview('https://mttv-app.firebaseapp.com/', '/pageViewTest', 'pageViewTest', USER_ID)
//   .then((response) => {
//     console.log(response)
//     return response
//   }).catch((err) => {
//     console.log(err)
//     return err
//   })
// }

// analyticsTestScreen()
// analyticsTestPageView()

// console.log(USER_ID)


class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      loginRedirect: false,
      logoutRedirect: false,
      langPack: {}
    }
  }

  componentWillMount() {
    //loading language pack depening on user settings
    this.languageHandler()
  }

  componentDidMount() {
    //checking for updates
    window.require('electron').ipcRenderer.on("app-update-avaliavle", (event, res) => {
      if (res) {
        this.appUpdateHandler()
      }
    })

    this.darkModeHandler()
    
    $("#hide-menu-btn").click(function() {
      const menuHide = sessionStorage.getItem("menuHide")
      if (menuHide) {
        $("#hide-menu-btn").removeClass("rotate")
        $("#hide-menu-btn").animate({left: "50px"})
        $(".menu ul").fadeIn()
        $("#main-menu").animate({width: "50px"})
        $(".container-fluid").animate({left: "50px"})
        sessionStorage.removeItem("menuHide")
        setTimeout(() => {
          $(".carousel").removeAttr("style")
        }, 200)
      } else {
        $("#hide-menu-btn").addClass("rotate")
        $("#hide-menu-btn").animate({left: "5px"})
        $(".menu ul").fadeOut()
        $("#main-menu").animate({width: "0px"})
        $(".container-fluid").animate({left: 0})
        sessionStorage.setItem("menuHide", true)
        setTimeout(() => {
          $(".carousel").css({"margin-left": "0"})
        }, 200)
      }
    })
  }

  componentDidUpdate() {
    this.darkModeHandler()
    if (this.state.loginRedirect === true) {
      Notification.requestPermission().then((r) => {
        new Notification("MTTV", {
            "body": this.state.langPack.welcome_page.welcome_alert_msg + sessionStorage.getItem("userName") + "!",
            "icon": icon
        })
      })
    }
  }

  appUpdateHandler = () => {
    const updateAlert = withReactContent(Swal)
    updateAlert.fire({
      type: 'info',
      text: this.state.langPack.others.app_update_alert.title,
      showCancelButton: true,
      confirmButtonText: this.state.langPack.others.app_update_alert.update_btn,
      cancelButtonText: this.state.langPack.others.app_update_alert.cancel_btn,
      cancelButtonColor: '#cc0000'
    }).then((r) => {
      if (r.value === true) {
        main.downloadUpdate(true)
      }
    })
  }

  languageHandler = () => {
    const pickedLang = localStorage.getItem("language")
    if (pickedLang === "en" || !pickedLang) {
      const en = require('./languages/en.json')
      this.setState({
        langPack: en
      })
    } else if (pickedLang === "ru") {
      const ru = require('./languages/ru.json')
      this.setState({
        langPack: ru
      })     
    } else if (pickedLang === "ua") {
      const ua = require('./languages/ua.json')
      this.setState({
        langPack: ua
      })
    } else if (pickedLang === "de") {
      const de = require('./languages/de.json')
      this.setState({
        langPack: de
      })
    } else {
      const en = require('./languages/en.json')
      this.setState({
        langPack: en
      })
    }
  }

  darkModeHandler = () => {
    const darkMode = localStorage.getItem("darkMode")
    if (darkMode) {
      $("#night-mode").removeAttr("disabled")
    } else {
      $("#night-mode").attr("disabled", true)
    }
  }

  logOutHandler = () => {
    this.setState({logoutRedirect: true})
      sessionStorage.clear()
      setTimeout(() => {
        this.setState({logoutRedirect: false})
        window.location.reload()
    }, 1500)
  }

  loginHandler = (getToken) => {
    const isInApp = sessionStorage.getItem("isInApp")
    if (isInApp) {
      this.logOutHandler()
    } else {
        let token = sessionStorage.getItem("token")
        if(getToken) {
          token = getToken.split("#access_token=").pop().split("&")[0]
        } else {
          token = null
        }
        if (token !== getToken) {
          api.auth.checkToken({auth: token}, (err, res) => {
            if (err) {
              this.logOutHandler()
            } else {
              if (res.token.valid) {
                sessionStorage.setItem("token", token)
                sessionStorage.setItem("userId", res.token.user_id)
                sessionStorage.setItem("userName", res.token.user_name)
                this.setState({loginRedirect: true})
                setTimeout(() => {
                  sessionStorage.setItem("isInApp", true)
                  this.setState({loginRedirect: false})
                  window.location.reload()
                }, 1500) 
              }
            }
          }) 
        }
    }
  }

  AppLayout = () => {
    const isInApp = sessionStorage.getItem("isInApp")
    if(isInApp === "true") {
        return(
          <div id="app">
            {this.state.logoutRedirect ? <Redirect to='/' /> : <div id="no-logout-redirect" />}
            <MainNav api={api} langPack={this.state.langPack.menu_titles} />
              <div id="container-fade">
                <Suspense fallback={<div />}>
                  <Switch>
                    <Route 
                      path={"/"} 
                      exact 
                      component={props => <Redirect to='/app/home' />} />
                    <Route 
                      path={"/app/home"} 
                      exact 
                      component={props => <Home api={api} 
                      langPack={this.state.langPack.home_page}
                      langPackOthers={this.state.langPack.others} />} />
                    <Route 
                      path={"/app/search"} 
                      exact 
                      component={props => <Search 
                      api={api} 
                      langPack={this.state.langPack.search_page} 
                      langPackCategories={this.state.langPack.categories} 
                      langPackOthers={this.state.langPack.others} />} />
                    <Route 
                      path={"/app/multistream"} 
                      exact 
                      component={props => <MultiStream 
                      api={api} 
                      langPack={this.state.langPack.multistream_page}
                      langPackOthers={this.state.langPack.others} />} />
                    <Route 
                      path={"/app/games"} 
                      exact 
                      component={props => <Games 
                      api={api} 
                      langPack={this.state.langPack.games_page} 
                      langPackOthers={this.state.langPack.others} />} />
                    <Route 
                      path={"/app/watch"} 
                      exact 
                      component={props => <Watch 
                      api={api} 
                      langPack={this.state.langPack.watch_page} 
                      langPackOthers={this.state.langPack.others} />} />
                    <Route 
                      path={"/app/channel"} 
                      component={props => <Channel 
                      api={api} 
                      langPack={this.state.langPack.channel_page} 
                      langPackCategories={this.state.langPack.categories} 
                      langPackOthers={this.state.langPack.others} />} />
                    <Route 
                      path={"/app/following"} 
                      exact 
                      component={props => <Following 
                      api={api} 
                      langPack={this.state.langPack.following_page} 
                      langPackCategories={this.state.langPack.categories} 
                      langPackOthers={this.state.langPack.others} />} />
                    <Route 
                      path={"/app/notifications"} 
                      exact 
                      component={props => <Notifications 
                      api={api} 
                      langPack={this.state.langPack.notifications_page} />} />
                    {this.state.logoutRedirect ? <Redirect to='/' /> : <div id="no-logout-redirect"></div>}
                  </Switch>
                </Suspense>
              </div>
          </div>
        )
    } else {
      return(
        <div id="app">
          {this.state.loginRedirect ? <Redirect to='/app/home' /> : <div id="no-login-redirect"></div>}   
          <Route path={"/"} component={props => <Login 
              layoutHandler={this.loginHandler} 
              api={api}
              langPack={this.state.langPack.welcome_page}
            />} 
          />
        </div>
      )
    }
  }

  render() {
    return (
      <Router>
        <div className="container-fluid">
            <this.AppLayout />
            <SettingsModal 
              layoutHandler={this.loginHandler} 
              langPack={this.state.langPack.settings_page}
              languageHandler={this.languageHandler}
            />
        </div>
      </Router>
    )
  }
}

export default App
