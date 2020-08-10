import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Avatar from 'react-avatar';

import { getUser } from '../services/UserService';
import User from '../models/User';

class ProfileCard extends Component {  //va a recibir como prop un address
    constructor(props){
        super(props);
        this.state = {
            address: props.address,
            user: new User()
        }
    }

    componentDidMount(){
        if(this.props.address) this.loadUser();    
    }
    
    shouldComponentUpdate(nextProps, nextState){
        if(this.state != nextState) return true;
        
        if(this.props.address === nextProps.address){
            return false;
        }
        return true; 
    }
    
    
    async componentDidUpdate(prevProps, prevState){
      if(this.props.address !== prevProps.address){
        this.loadUser();
      }
    }

    async loadUser(){
        const user = await getUser(this.props.address);
        if (user) this.setState({ user })
    }

    render(){
        const user = this.state.user;

        const namePosition = this.props.namePosition;
        const descriptionClass = namePosition === "left" || namePosition === "right" ? "" : "small";

        return(
            <div>
                <Link className={`profile-card ${namePosition}`} to={`/profile/${user.address}`}> 
                    <Avatar size={50} src={user.avatar} round />
                    <p className={`description ${descriptionClass}`}>{user.name}</p>
                </Link>
            </div>
        );
    }
}

ProfileCard.propTypes = {
    address: PropTypes.string,
    namePosition: PropTypes.oneOf(['top', 'right', 'bottom', 'left']),
};

ProfileCard.defaultProps = {
    namePosition: 'bottom'
};
  

export default ProfileCard;