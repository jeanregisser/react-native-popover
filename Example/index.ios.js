'use strict';

var React = require('react-native');
var Popover = require('../Popover');
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
    this.setState({isVisible: true});
  },

  closePopover() {
    this.setState({isVisible: false});
  },

  componentDidMount() {
    setTimeout(this.measureButton);
  },

  measureButton() {
    this.refs.button.measure((ox, oy, width, height) => {
      this.setState({buttonRect: {x: ox, y: oy, width: width, height: height}});
    });
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
          <Text>Line 1</Text>
          <Text>Line 2</Text>
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
