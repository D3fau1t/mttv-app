import React from 'react'
import { Link } from 'react-router-dom'
// import Img from 'react-image'
// import ContentLoader from 'react-content-loader'

const channelCard = (props) => {
  return(
    <div className="col-sm-6 col-lg-3">
        <Link to={{
            pathname: '/app/channel',
            search: '?id=' + props.channelId
        }}>
            <div className="channel-card main">
                <div className="overlay">
                    <div className="bg-img">
                        <img src={props.banner} alt="" />
                    </div>
                    <img className="avatar" src={props.logo} alt="" />
                </div>
                <div className="description">
                    <h6>{props.channelName}</h6>
                    <p>{props.description}</p>
                </div>
            </div>
        </Link>
    </div>
  )
}

export default channelCard