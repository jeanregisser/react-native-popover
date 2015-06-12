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
var Transitions = require('./Transitions');
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
  mixins: [Transitions.Mixin],
  propTypes: {
    isVisible: PropTypes.bool,
    onClose: PropTypes.func,
  },
  getInitialState() {
    return {
      contentSize: {},
      popoverOrigin: {},
      arrowOrigin: {},
      placement: 'auto',
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
    var contentSize = {width: width, height: height};
    var geom = this.computeGeometry({contentSize: contentSize});

    var awaitingShowHandler = this.state.awaitingShowHandler;
    this.setState(Object.assign(geom, 
      {contentSize: contentSize, awaitingShowHandler: undefined}), () => {
      // Once state is set, call the showHandler so it can access all the geometry
      // from the state
      awaitingShowHandler && awaitingShowHandler(this.transition);
    });
  },
  computeGeometry({contentSize, placement}) {
    placement = placement || this.props.placement;
    
    var options = {
      displayArea: this.props.displayArea,
      fromRect: this.props.fromRect,
      contentSize: contentSize,
    }

    switch (placement) {
      case 'top':
        return this.computeTopGeometry(options);
      case 'bottom':
        return this.computeBottomGeometry(options);
      case 'left':
        return this.computeLeftGeometry(options);
      case 'right':
        return this.computeRightGeometry(options);
      default:
        return this.computeAutoGeometry(options);
    }
  },
  computeTopGeometry({displayArea, fromRect, contentSize}) {
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
  computeBottomGeometry({displayArea, fromRect, contentSize}) {
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
  computeLeftGeometry({displayArea, fromRect, contentSize}) {
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
  computeRightGeometry({displayArea, fromRect, contentSize}) {
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
  computeAutoGeometry({displayArea, fromRect, contentSize}) {
    var placementsToTry = ['left', 'right', 'bottom', 'top'];

    for (var i = 0; i < placementsToTry.length; i++) {
      var placement = placementsToTry[i];
      var geom = this.computeGeometry({contentSize: contentSize, placement: placement});
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
  componentWillReceiveProps(nextProps:any) {
    var willBeVisible = nextProps.isVisible;
    var {
      isVisible,
      customShowHandler,
      customHideHandler,
    } = this.props;

    if (willBeVisible !== isVisible) {
      var animDuration = 300;
      var getTranslateOrigin = () => {
        var {contentSize, popoverOrigin, arrowOrigin} = this.state;
        var popoverCenter = new Point(popoverOrigin.x + contentSize.width / 2, 
          popoverOrigin.y + contentSize.height / 2);
        var arrowTip = new Point(popoverOrigin.x + arrowOrigin.x + 5, 
          popoverOrigin.y + arrowOrigin.y + 5);
        return new Point(arrowTip.x - popoverCenter.x, arrowTip.y - popoverCenter.y);
      }
      var defaultShowHandler = (t) => {
        var easing = Transitions.Easings.easeOutBack;
        var translateOrigin = getTranslateOrigin();
        t('background.opacity', {duration: animDuration, easing: easing, begin: 0, end: 1,});
        t('popover.transform.translateX', {duration: animDuration, easing: easing, begin: translateOrigin.x, end: 0,});
        t('popover.transform.translateY', {duration: animDuration, easing: easing, begin: translateOrigin.y, end: 0,});
        t('popover.transform.scaleXY', {duration: animDuration, easing: easing, begin: 0, end: 1,});
      }
      var defaultHideHandler = (t) => {
        var easing = Transitions.Easings.easeInOutQuad;
        var translateOrigin = getTranslateOrigin();
        t('background.opacity', {duration: animDuration, easing: easing, end: 0,});
        t('popover.transform.scaleXY', {duration: animDuration, easing: easing, end: 0,});
        t('popover.transform.translateX', {duration: animDuration, easing: easing, end: translateOrigin.x,});
        t('popover.transform.translateY', {duration: animDuration, easing: easing, end: translateOrigin.y,});
      }

      if (willBeVisible) {
        var showHandler = customShowHandler || defaultShowHandler;
        // We want to call the showHandler only when contentSize is known
        // so that it can have logic depending on the geometry
        this.setState({contentSize: {}, awaitingShowHandler: showHandler});
      } else {
        var hideHandler = customHideHandler || defaultHideHandler;
        hideHandler(this.transition);
      }
    }
  },
  render() {
    var styles = this.props.style || DefaultStyles;

    if (!this.props.isVisible && !this.state.isTransitioning) {
        return <View />;
    }

    var {popoverOrigin, arrowOrigin, placement} = this.state;
    var arrowColor = StyleSheetRegistry.getStyleByID(styles.content).backgroundColor;
    var arrowColorStyle = this.getArrowColorStyle(placement, arrowColor);
    var contentSizeAvailable = this.state.contentSize.width;

    return (
      <TouchableWithoutFeedback onPress={this.props.onClose}>
        <View style={[styles.container, contentSizeAvailable && styles.containerVisible ]}>
          <View style={[styles.background, this.transitionStyles('background')]}/>
          <View style={[styles.popover, {
            top: popoverOrigin.y,
            left: popoverOrigin.x,
            }, this.transitionStyles('popover')]}>
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
    backgroundColor: 'transparent',
  },
  containerVisible: {
    opacity: 1,
  },
  background: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.5)',
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