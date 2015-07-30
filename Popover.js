'use strict';

var React = require('react-native');
var {
  PropTypes,
  StyleSheet,
  Dimensions,
  Animated,
  Text,
  TouchableWithoutFeedback,
  View
} = React;
var flattenStyle = require('react-native/Libraries/StyleSheet/flattenStyle');
var Easing = require('react-native/Libraries/Animation/Animated/Easing');
var noop = () => {};

var {height: SCREEN_HEIGHT, width: SCREEN_WIDTH} = Dimensions.get('window');
var DEFAULT_ARROW_SIZE = new Size(10, 5);

function Point(x, y) {
  this.x = x;
  this.y = y;
}

function Size(width, height) {
  this.width = width;
  this.height = height;
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
      anchorPoint: {},
      popoverOrigin: {},
      placement: 'auto',
      isTransitioning: false,
      scale: new Animated.Value(0),
      translate: new Animated.ValueXY(),
      fade: new Animated.Value(0),
    };
  },
  getDefaultProps() {
    return {
      isVisible: false,
      displayArea: new Rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT),
      arrowSize: DEFAULT_ARROW_SIZE,
      placement: 'auto',
      onClose: noop,
    };
  },
  measureContent(x) {
    var {width, height} = x.nativeEvent.layout;
    var contentSize = {width, height};
    var geom = this.computeGeometry({contentSize});

    var awaitingShowHandler = this.state.awaitingShowHandler;
    this.setState(Object.assign(geom,
      {contentSize, awaitingShowHandler: undefined}), () => {
      // Once state is set, call the showHandler so it can access all the geometry
      // from the state
      awaitingShowHandler && awaitingShowHandler();
    });
  },
  computeGeometry({contentSize, placement}) {
    placement = placement || this.props.placement;

    var options = {
      displayArea: this.props.displayArea,
      fromRect: this.props.fromRect,
      arrowSize: this.getArrowSize(placement),
      contentSize,
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
  computeTopGeometry({displayArea, fromRect, contentSize, arrowSize}) {
    var popoverOrigin = new Point(
      Math.min(displayArea.x + displayArea.width - contentSize.width,
        Math.max(displayArea.x, fromRect.x + (fromRect.width - contentSize.width) / 2)),
      fromRect.y - contentSize.height - arrowSize.height);
    var anchorPoint = new Point(fromRect.x + fromRect.width / 2.0, fromRect.y);

    return {
      popoverOrigin,
      anchorPoint,
      placement: 'top',
    }
  },
  computeBottomGeometry({displayArea, fromRect, contentSize, arrowSize}) {
    var popoverOrigin = new Point(
      Math.min(displayArea.x + displayArea.width - contentSize.width,
        Math.max(displayArea.x, fromRect.x + (fromRect.width - contentSize.width) / 2)),
      fromRect.y + fromRect.height + arrowSize.height);
    var anchorPoint = new Point(fromRect.x + fromRect.width / 2.0, fromRect.y + fromRect.height);

    return {
      popoverOrigin,
      anchorPoint,
      placement: 'bottom',
    }
  },
  computeLeftGeometry({displayArea, fromRect, contentSize, arrowSize}) {
    var popoverOrigin = new Point(fromRect.x - contentSize.width - arrowSize.width,
      Math.min(displayArea.y + displayArea.height - contentSize.height,
        Math.max(displayArea.y, fromRect.y + (fromRect.height - contentSize.height) / 2)));
    var anchorPoint = new Point(fromRect.x, fromRect.y + fromRect.height / 2.0);

    return {
      popoverOrigin,
      anchorPoint,
      placement: 'left',
    }
  },
  computeRightGeometry({displayArea, fromRect, contentSize, arrowSize}) {
    var popoverOrigin = new Point(fromRect.x + fromRect.width + arrowSize.width,
      Math.min(displayArea.y + displayArea.height - contentSize.height,
        Math.max(displayArea.y, fromRect.y + (fromRect.height - contentSize.height) / 2)));
    var anchorPoint = new Point(fromRect.x + fromRect.width, fromRect.y + fromRect.height / 2.0);

    return {
      popoverOrigin,
      anchorPoint,
      placement: 'right',
    }
  },
  computeAutoGeometry({displayArea, contentSize}) {
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
  getArrowSize(placement) {
    var size = this.props.arrowSize;
    switch(placement) {
      case 'left':
      case 'right':
        return new Size(size.height, size.width);
      default:
        return size;
    }
  },
  getArrowColorStyle(color) {
    return { borderTopColor: color };
  },
  getArrowRotation(placement) {
    switch (placement) {
      case 'bottom':
        return '180deg';
      case 'left':
        return '-90deg';
      case 'right':
        return '90deg';
      default:
        return '0deg';
    }
  },
  getArrowDynamicStyle() {
    var {anchorPoint, popoverOrigin} = this.state;
    var arrowSize = this.props.arrowSize;

    // Create the arrow from a rectangle with the appropriate borderXWidth set
    // A rotation is then applied dependending on the placement
    // Also make it slightly bigger
    // to fix a visual artifact when the popover is animated with a scale
    var width = arrowSize.width + 2;
    var height = arrowSize.height * 2 + 2;

    return {
      left: anchorPoint.x - popoverOrigin.x - width / 2,
      top: anchorPoint.y - popoverOrigin.y - height / 2,
      width: width,
      height: height,
      borderTopWidth: height / 2,
      borderRightWidth: width / 2,
      borderBottomWidth: height / 2,
      borderLeftWidth: width / 2,
    }
  },
  getTranslateOrigin() {
    var {contentSize, popoverOrigin, anchorPoint} = this.state;
    var popoverCenter = new Point(popoverOrigin.x + contentSize.width / 2,
      popoverOrigin.y + contentSize.height / 2);
    return new Point(anchorPoint.x - popoverCenter.x, anchorPoint.y - popoverCenter.y);
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

      var defaultShowHandler = (t) => {
        /*var easing = Transitions.Easings.easeOutBack;
        var translateOrigin = getTranslateOrigin();
        t('background.opacity', {duration: animDuration, easing: easing, begin: 0, end: 1,});
        t('popover.transform.translateX', {duration: animDuration, easing: easing, begin: translateOrigin.x, end: 0,});
        t('popover.transform.translateY', {duration: animDuration, easing: easing, begin: translateOrigin.y, end: 0,});
        t('popover.transform.scaleXY', {duration: animDuration, easing: easing, begin: 0, end: 1,});*/

        var translateOrigin = this.getTranslateOrigin();
        this.state.translate.setValue(translateOrigin);

        var commonConfig = {
          duration: animDuration,
          easing: Easing.out(Easing.back()),
        }

        Animated.parallel([
          Animated.timing(this.state.fade, {
            toValue: 1,
            ...commonConfig,
          }),
          Animated.timing(this.state.translate, {
            toValue: new Point(0, 0),
            ...commonConfig,
          }),
          Animated.timing(this.state.scale, {
            toValue: 1,
            ...commonConfig,
          })
        ]).start();
      }
      var defaultHideHandler = (t) => {
        /*var easing = Transitions.Easings.easeInOutQuad;
        var translateOrigin = getTranslateOrigin();
        t('background.opacity', {duration: animDuration, easing: easing, end: 0,});
        t('popover.transform.scaleXY', {duration: animDuration, easing: easing, end: 0,});
        t('popover.transform.translateX', {duration: animDuration, easing: easing, end: translateOrigin.x,});
        t('popover.transform.translateY', {duration: animDuration, easing: easing, end: translateOrigin.y,});
        */

        var commonConfig = {
          duration: animDuration,
          easing: Easing.inOut(Easing.quad),
        }

        var translateOrigin = this.getTranslateOrigin();

        this.setState({isTransitioning: true});

        Animated.parallel([
          Animated.timing(this.state.fade, {
            toValue: 0,
            ...commonConfig,
          }),
          Animated.timing(this.state.translate, {
            toValue: translateOrigin,
            ...commonConfig,
          }),
          Animated.timing(this.state.scale, {
            toValue: 0,
            ...commonConfig,
          }),
        ]).start(({finished}) => {
          console.log('--- finished:', finished);
          this.setState({isTransitioning: false});
        });
      }

      if (willBeVisible) {
        var showHandler = customShowHandler || defaultShowHandler;
        // We want to call the showHandler only when contentSize is known
        // so that it can have logic depending on the geometry
        this.setState({contentSize: {}, awaitingShowHandler: showHandler});
      } else {
        var hideHandler = customHideHandler || defaultHideHandler;
        hideHandler();
      }
    }
  },
  render() {
    var styles = this.props.style || DefaultStyles;

    if (!this.props.isVisible && !this.state.isTransitioning) {
        return null;
    }

    var {popoverOrigin, placement} = this.state;
    var arrowColor = flattenStyle(styles.content).backgroundColor;
    var arrowColorStyle = this.getArrowColorStyle(arrowColor);
    var arrowDynamicStyle = this.getArrowDynamicStyle();
    var contentSizeAvailable = this.state.contentSize.width;

    var backgroundAnimatedStyle = {
      opacity: this.state.fade,
    };

    var popoverAnimatedStyle = {
      transform: [
        {translateX: this.state.translate.x},
        {translateY: this.state.translate.y},
        {scale: this.state.scale},
      ],
    };

    var arrowAnimatedStyle = {
      transform: [
        {
          scale: this.state.scale.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
            extrapolate: 'clamp',
          }),
        }, {
          rotate: this.getArrowRotation(placement),
        }
      ],
    }

    return (
      <TouchableWithoutFeedback onPress={this.props.onClose}>
        <View style={[styles.container, contentSizeAvailable && styles.containerVisible ]}>
          <Animated.View style={[styles.background, backgroundAnimatedStyle /*, this.transitionStyles('background')*/]}/>
          <Animated.View style={[styles.popover, {
            top: popoverOrigin.y,
            left: popoverOrigin.x,
            } /*, this.transitionStyles('popover')*/]}>
            <Animated.View style={[styles.arrow, arrowDynamicStyle, arrowColorStyle, arrowAnimatedStyle]}/>
            <Animated.View ref='content' onLayout={this.measureContent} style={[styles.content, popoverAnimatedStyle]}>
              {this.props.children}
            </Animated.View>
          </Animated.View>
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
    borderRadius: 3,
    padding: 6,
    backgroundColor: '#fff',
  },
  arrow: {
    position: 'absolute',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
});

module.exports = Popover;
