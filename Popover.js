'use strict';

var React = require('react-native');
var {
  PropTypes,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View
} = React;
var StyleSheetRegistry = require('StyleSheetRegistry');
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
      displayArea: new Rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT),
      placement: 'auto',
      onClose: noop,
    };
  },
  measureContent(x) {
    var {width, height} = x.nativeEvent.layout;
    this.setState({contentSize: {width: width, height: height}});
  },
  computeGeometry(placement) {
    placement = placement || this.props.placement;
    switch (placement) {
      case 'top':
        return this.computeTopGeometry();
      case 'bottom':
        return this.computeBottomGeometry();
      case 'left':
        return this.computeLeftGeometry();
      case 'right':
        return this.computeRightGeometry();
      default:
        return this.computeAutoGeometry();
    }
  },
  computeTopGeometry() {
    var displayArea = this.props.displayArea;
    var fromRect = this.props.fromRect;
    var contentSize = this.state.contentSize;

    var popoverOrigin = new Point(
      Math.min(displayArea.x + displayArea.width - contentSize.width, 
        Math.max(displayArea.x, fromRect.x + (fromRect.width - contentSize.width) / 2)), 
      fromRect.y - contentSize.height - 5);
    var arrowOrigin = new Point(fromRect.x - popoverOrigin.x + (fromRect.width - 10) / 2.0, contentSize.height);

    return {
      popoverOrigin: popoverOrigin,
      arrowOrigin: arrowOrigin,
      placement: 'top',
    }
  },
  computeBottomGeometry() {
    var displayArea = this.props.displayArea;
    var fromRect = this.props.fromRect;
    var contentSize = this.state.contentSize;

    var popoverOrigin = new Point(
      Math.min(displayArea.x + displayArea.width - contentSize.width, 
        Math.max(displayArea.x, fromRect.x + (fromRect.width - contentSize.width) / 2)), 
      fromRect.y + fromRect.height + 5);
    var arrowOrigin = new Point(fromRect.x - popoverOrigin.x + (fromRect.width - 10) / 2.0, -10);

    return {
      popoverOrigin: popoverOrigin,
      arrowOrigin: arrowOrigin,
      placement: 'bottom',
    }
  },
  computeLeftGeometry() {
    var displayArea = this.props.displayArea;
    var fromRect = this.props.fromRect;
    var contentSize = this.state.contentSize;

    var popoverOrigin = new Point(fromRect.x - contentSize.width - 5,
      Math.min(displayArea.y + displayArea.height - contentSize.height, 
        Math.max(displayArea.y, fromRect.y + (fromRect.height - contentSize.height) / 2)));
    var arrowOrigin = new Point(contentSize.width, fromRect.y - popoverOrigin.y + (fromRect.height - 10) / 2.0);

    return {
      popoverOrigin: popoverOrigin,
      arrowOrigin: arrowOrigin,
      placement: 'left',
    }
  },
  computeRightGeometry() {
    var displayArea = this.props.displayArea;
    var fromRect = this.props.fromRect;
    var contentSize = this.state.contentSize;

    var popoverOrigin = new Point(fromRect.x + fromRect.width + 5,
      Math.min(displayArea.y + displayArea.height - contentSize.height, 
        Math.max(displayArea.y, fromRect.y + (fromRect.height - contentSize.height) / 2)));
    var arrowOrigin = new Point(-10, fromRect.y - popoverOrigin.y + (fromRect.height - 10) / 2.0);

    return {
      popoverOrigin: popoverOrigin,
      arrowOrigin: arrowOrigin,
      placement: 'right',
    }
  },
  computeAutoGeometry() {
    var displayArea = this.props.displayArea;
    var contentSize = this.state.contentSize;
    var placementsToTry = ['left', 'right', 'bottom', 'top'];

    for (var i = 0; i < placementsToTry.length; i++) {
      var placement = placementsToTry[i];
      var geom = this.computeGeometry(placement);
      var {popoverOrigin} = geom;

      if (popoverOrigin.x >= displayArea.x 
          && popoverOrigin.x <= displayArea.x + displayArea.width - contentSize.width
          && popoverOrigin.y >= displayArea.y 
          && popoverOrigin.y <= displayArea.y + displayArea.height - contentSize.height) {
        break;
      }
    }

    return geom;
  },
  getArrowColorStyle(placement, color) {
    switch (placement) {
      case 'top':
        return { borderTopColor: color };
      case 'bottom':
        return { borderBottomColor: color };
      case 'left':
        return { borderLeftColor: color };
      case 'right':
        return { borderRightColor: color };
    }
  },
  render() {
    var styles = this.props.style || DefaultStyles;

    if (this.props.isVisible) {
      var {popoverOrigin, arrowOrigin, placement} = this.computeGeometry();
      var arrowColor = StyleSheetRegistry.getStyleByID(styles.content).backgroundColor;
      var arrowColorStyle = this.getArrowColorStyle(placement, arrowColor);
      var contentSizeAvailable = this.state.contentSize.width;

      return (
        <TouchableWithoutFeedback onPress={this.props.onClose}>
          <View style={[styles.container, contentSizeAvailable && styles.containerVisible ]}>
            <View style={[styles.popover, {
              top: popoverOrigin.y,
              left: popoverOrigin.x,
              }]}>
              <View style={[styles.arrow, arrowColorStyle, {
                top: arrowOrigin.y,
                left: arrowOrigin.x,
                }]}/>
              <View ref='content' onLayout={this.measureContent} style={styles.content}>
                {React.Children.map(this.props.children, React.addons.cloneWithProps)}
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      );
    } else {
      return (<View/>);
    }
  }
});


var DefaultStyles = StyleSheet.create({
  container: {
    opacity: 0,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    position: 'absolute',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  containerVisible: {
    opacity: 1,
  },
  popover: { 
    backgroundColor: 'transparent',
    position: 'absolute',
    shadowColor: 'black',
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 2,
    shadowOpacity: 0.8,
  },
  content: {
    //margin: 10,
    borderRadius: 3,
    padding: 6,
    backgroundColor: '#fff',
  },
  arrow: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderTopWidth: 5,
    borderTopColor: 'rgba(0,0,0,0)',
    borderRightWidth: 5,
    borderRightColor: 'rgba(0,0,0,0)',
    borderBottomWidth: 5,
    borderBottomColor: 'rgba(0,0,0,0)',
    borderLeftWidth: 5,
    borderLeftColor: 'rgba(0,0,0,0)',
  },
});

module.exports = Popover;