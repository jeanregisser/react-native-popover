// Adapted from https://github.com/brentvatne/react-native-modal/blob/8020a920e7f08a0f1acd6ce897fe888fa39a51bf/Transitions.js
// so it can be used on transform properties
'use strict';

var { Mixin, easingTypes } = require('react-tween-state');

var Transitions = Object.assign(Mixin, {
  getInitialState() {
    return {
      isTransitioning: false,
      tweenQueue: [],
      tweenProperties: [],
    };
  },

  transition(property, options) {
    this.setState({isTransitioning: true});

    // Add the property to the list of tweenProperties if it isn't already there
    if (this.state.tweenProperties.indexOf(property) === -1) {
      // Ugly, pushing it directly, but if I clone and setState then only one property
      // will be registered at a time and it interferes with multiple tweens
      this.state.tweenProperties.push(property);
    }

    // If no initial value is given, use the current value in the state
    var begin = (typeof options.begin === 'undefined' ? this.state[property] : options.begin);
    this.tweenState(property, {
      easing: options.easing || easingTypes.easeInOutQuad,
      duration: options.duration || 300,
      delay: options.delay,
      beginValue: begin,
      endValue:  options.end,
      onEnd: (() => {
        // Perform on next tick because animations are removed from tweenQueue after onEnd is called
        requestAnimationFrame(() => {
          // If all tweens are done, finish transitioning
          if (!this.state.tweenQueue.length) {
            this.setState({isTransitioning: false});
          }

          // Option to reset the state value to the initial value
          if (options.reset) {
            if (options.reset) {
              this.state[property] = begin;
            } else {
              this.state[property] = options.reset;
            }
          }

          // Custom onEnd callback
          if (options.onEnd) {
            options.onEnd();
          }
        });
      }),
    });
  },

  transitionStyles(prefix) {
    var hasPrefix = typeof prefix !== 'undefined'
    var result = {};

    this.state.tweenProperties.forEach((property) => {
      var propElements = property.split('.');
      if (!hasPrefix || propElements[0] === prefix) {
        var value, tweeningValue = this.getTweeningValue(property);

        if (typeof tweeningValue === 'undefined' || tweeningValue === null) {
          value = this.state[property];
        } else {
          value = tweeningValue;
        }

        if (hasPrefix) {
          propElements.shift();
        }
        var propName = propElements[0];

        if (propName === 'transform' && propElements.length) {
          var currentTransform = result[propName] || [];
          var subTransform = propElements[1];
          if (subTransform === 'scaleXY') {
            currentTransform.push({scaleX: value});
            currentTransform.push({scaleY: value});
          } else {
            var subVal = {}
            subVal[subTransform] = value;
            currentTransform.push(subVal);
          }
          value = currentTransform;
        }
        result[propName] = value;
      }
    });

    return result;
  }
});

module.exports = {
  Mixin: Transitions,
  Easings: easingTypes,
};
