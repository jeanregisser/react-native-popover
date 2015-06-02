## react-native-popover

A `<Popover>` component for react-native. This is still very much a work
in progress and only handles the simplest of cases, ideas and
contributions are very welcome.

![Demo](https://raw.githubusercontent.com/jeanregisser/react-native-popover/master/Screenshots/basic.gif)

## Install

```shell
npm i --save react-native-popover
```

## Usage

```javascript
'use strict';

var React = require('react-native');
var Popover = require('react-native-popover');
var {
  AppRegistry,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} = React;

var PopoverExample = React.createClass({
  getInitialState() {
    return {
      isVisible: false,
      buttonRect: {},
    };
  },

  showPopover() {
    this.refs.button.measure((ox, oy, width, height, px, py) => {
      this.setState({
        isVisible: true,
        buttonRect: {x: px, y: py, width: width, height: height}
      });
    });
  },

  closePopover() {
    this.setState({isVisible: false});
  },

  render() {
    return (
      <View style={styles.container}>
        <TouchableHighlight ref='button' style={styles.button} onPress={this.showPopover}>
          <Text style={styles.buttonText}>Press me</Text>
        </TouchableHighlight>

        <Popover
          isVisible={this.state.isVisible}
          fromRect={this.state.buttonRect}
          onClose={this.closePopover}>
          <Text>I'm the content of this popover!</Text>
        </Popover>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgb(43, 186, 180)',
  },
  button: {
    borderRadius: 4,
    padding: 10,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: '#ccc',
    borderColor: '#333',
    borderWidth: 1,
  },
  buttonText: {
  }
});

AppRegistry.registerComponent('PopoverExample', () => PopoverExample);
```

---

**MIT Licensed**