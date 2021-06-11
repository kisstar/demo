import React, { Component } from 'react';
import ReactReduxContext from './context';

class Provider extends Component {
  render() {
    return (
      <ReactReduxContext.Provider value={{ store: this.props.store }}>
        {this.props.children}
      </ReactReduxContext.Provider>
    );
  }
}

export default Provider;
