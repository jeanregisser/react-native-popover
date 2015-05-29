'use strict';

var React = require('react-native');
var {
  PropTypes,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} = React;
var noop = () => {};

var SCREEN_HEIGHT = require('Dimensions').get('window').height;
var SCREEN_WIDTH = require('Dimensions').get('window').width;

function Point(x, y) {
  this.x = x;
  this.y = y;
}

function Rect(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
}

var Popover = React.createClass({
  propTypes: {
    isVisible: PropTypes.bool,
    onClose: PropTypes.func,
  },
  getInitialState() {
    return {
      contentSize: {},
    };
  },
  getDefaultProps() {
    return {
      isVisible: false,
      displayRect: new Rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT),
      onClose: noop,
    };
  },
  measureContent(x) {
    var {width, height} = x.nativeEvent.layout;
    this.setState({contentSize: {width: width, height: height}});
  },
  computeGeometry() {
    var displayRect = this.props.displayRect;
    var fromRect = this.props.fromRect;
    var contentSize = this.state.contentSize;
    var popoverOrigin = new Point(
      Math.min(displayRect.x + displayRect.width - contentSize.width, 
        Math.max(displayRect.x, fromRect.x + (fromRect.width - contentSize.width) / 2)), 
      fromRect.y + fromRect.height - 5);
    var arrowOrigin = new Point(fromRect.x - popoverOrigin.x + (fromRect.width - 10) / 2.0, 0);

    return {
      popoverOrigin: popoverOrigin,
      arrowOrigin: arrowOrigin,
    }
  },
  render() {
    var styles = this.props.style || DefaultStyles;

    if (this.props.isVisible) {
      var {popoverOrigin, arrowOrigin} = this.computeGeometry();

      return (
        <TouchableOpacity onPress={this.props.onClose}>
          <View style={styles.container}>
            <View style={[styles.popover, {
              top: popoverOrigin.y,
              left: popoverOrigin.x,
              }]}>
              <View style={[styles.arrow,{
                top: arrowOrigin.y,
                left: arrowOrigin.x,
                }]}/>
              <View ref='content' onLayout={this.measureContent} style={styles.content}>
                {React.Children.map(this.props.children, React.addons.cloneWithProps)}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    } else {
      return (<View/>);
    }
  }
});


var DefaultStyles = StyleSheet.create({
  container: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    position: 'absolute',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    shadowColor: 'black',
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 2,
    shadowOpacity: 0.8,
  },
  popover: { 
    //backgroundColor: 'red',
    position: 'absolute',
  },
  content: {
    //margin: 10,
    borderRadius: 3,
    padding: 6,
    backgroundColor: '#fff',
  },
  arrow: {
    //position: 'absolute',
    //left: 0,
    //right: 0,
    //backgroundColor: 'green',
    //alignSelf: 'center',
    //top: 10,
    width: 10,
    height: 10,
    borderTopWidth: 5,
    borderTopColor: 'rgba(0,0,0,0)',
    borderRightWidth: 5,
    borderRightColor: 'rgba(0,0,0,0)',
    borderBottomWidth: 5,
    borderBottomColor: '#fff',
    borderLeftWidth: 5,
    borderLeftColor: 'rgba(0,0,0,0)',
  },
});

module.exports = Popover;