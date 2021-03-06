import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'

const remote = window.require("electron").remote
const main = remote.require("./main.js")


export default class mainNav extends Component {

    constructor(props) {
        super(props)
        this.state = {
            name: "",
            id: "",
            img: "",
            err: false,
            showCounter: 0
        }
    }

    componentDidMount() {
        this.userNavHandler()
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.state.showCounter !== nextState.showCounter || this.props !== nextProps) {
            return true
        } else {
            return false
        }
    }

    userNavHandler = () => {
        const token = sessionStorage.getItem("token")
        this.props.api.channels.channel({auth: token}, (err, res) => {
            if (err) {
                this.setState({err: true})
                this.setState({showCounter: this.state.showCounter + 1})
            } else {
                this.setState({name: res.display_name})
                this.setState({img: res.logo})
                this.setState({id: res._id})
                this.setState({err: false})
                this.setState({showCounter: this.state.showCounter + 1})
            }
        })
    }

    layoutHandler = () => {
        const { name, id, img, err } = this.state
        if (err) {
            return(<li id="nav-avatar" />)
        } else {
            return(<li id="nav-avatar" data-toggle="tooltip" data-placement="right" title={name}><NavLink to={"/app/channel?id=" + id} activeClassName="active" className="btn nav-link"><img className="avatar" src={img} alt="" /></NavLink></li>)
        }
    }

    twitchHandler = () => {
        main.twitchWindow()
    }

    render() {
        return(
            <div className="side-menu" id="main-menu">
                <div className="menu">
                    <ul className="dropdown">
                        <this.layoutHandler />
			            <li data-toggle="tooltip" data-placement="right" title={this.props.langPack.home}><NavLink to="/app/home" activeClassName="active" className="btn nav-link"><i className="fas fa-home menu-icon"></i></NavLink></li>
                        <li data-toggle="tooltip" data-placement="right" title={this.props.langPack.search}><NavLink to="/app/search" activeClassName="active" className="btn nav-link"><i className="fas fa-search menu-icon"></i></NavLink></li>
                        <li data-toggle="tooltip" data-placement="right" title={this.props.langPack.multistream}><NavLink to="/app/multistream" activeClassName="active" className="btn nav-link"><i className="fas fa-window-restore menu-icon"></i></NavLink></li>
                        <li data-toggle="tooltip" data-placement="right" title={this.props.langPack.games}><NavLink to="/app/games" activeClassName="active" className="btn nav-link"><i className="fas fa-gamepad menu-icon"></i></NavLink></li>
                        <li data-toggle="tooltip" data-placement="right" title={this.props.langPack.watch}><NavLink to="/app/watch" activeClassName="active" className="btn nav-link"><i className="fas fa-tv menu-icon"></i></NavLink></li>
                        {/* <li data-toggle="tooltip" data-placement="right" title="communities"><NavLink to="/app/communities" activeClassName="active" className="btn nav-link"><i className="fas fa-users  menu-icon"></i></NavLink></li> */}
                        {this.state.name ? <li data-toggle="tooltip" data-placement="right" title={this.props.langPack.following}><NavLink to="/app/following"  activeClassName="active" className="btn nav-link"><i className="fas fa-heart menu-icon"></i></NavLink></li> : ""}
			            <li data-toggle="tooltip" data-placement="right" title={this.props.langPack.notifications}><NavLink to="/app/notifications"  activeClassName="active" className="btn nav-link"><i className="fas fa-bell menu-icon"></i></NavLink></li>
                        <li data-toggle="tooltip" data-placement="right" title="twitch"><div onClick={this.twitchHandler} className="btn nav-link setting-open-btn twitch-btn"><i className="fab fa-twitch menu-icon"></i></div></li>
                        <li data-toggle="tooltip" data-placement="right" title={this.props.langPack.settings}><div className="btn nav-link setting-open-btn" data-toggle="modal" data-target="#settings-modal"><i className="fas fa-cog menu-icon"></i></div></li>
                    </ul>
                    <button className="hide-btn" id="hide-menu-btn"><i className="fas fa-angle-left"></i></button>
                </div>
            </div>
        )
    }
}