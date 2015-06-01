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

var SCREEN_HEIGHT = require('Dimensions').get('window').height;
var SCREEN_WIDTH = require('Dimensions').get('window').width;

var PopoverExample = React.createClass({
  getInitialState() {
    return {
      isVisible: false,
      buttonRect: {},
    };
  },

  showPopover(ref) {
    this.refs[ref].measure((ox, oy, width, height, px, py) => {
      this.setState({
        isVisible: true,
        buttonRect: {x: px, y: py, width: width, height: height}
      });
    });
  },

  closePopover() {
    this.setState({isVisible: false});
  },

  renderButton(text, ref) {
    return (
      <TouchableHighlight ref={ref} style={styles.button} onPress={this.showPopover.bind(this, ref)}>
        <Text style={styles.buttonText}>{text}</Text>
      </TouchableHighlight>
    );
  },

  render() {
    var {width, height} = require('Dimensions').get('window');
    var displayArea = {x: 5, y: 20, width: width - 10, height: height - 25};

    return (
      <View style={styles.container}>
        <View style={styles.grid}>
          <View style={styles.row}>
            {this.renderButton('Top Left', 'button1')}
            {this.renderButton('Top Center', 'button2')}
            {this.renderButton('Top Right', 'button3')}
          </View>
          <View style={styles.row}>
            {this.renderButton('Center Left', 'button4')}
            {this.renderButton('Center', 'button5')}
            {this.renderButton('Center Right', 'button6')}
          </View>
          <View style={styles.row}>
            {this.renderButton('Bottom Left', 'button7')}
            {this.renderButton('Bottom Center', 'button8')}
            {this.renderButton('Bottm Right', 'button9')}
          </View>
        </View>
        <Popover
            isVisible={this.state.isVisible}
            fromRect={this.state.buttonRect}
            displayArea={displayArea}
            onClose={this.closePopover}>
            <Text>I'm the content of this popover!</Text>
            <Text>Line 1</Text>
            <Text>Line 2</Text>
            <Text>Line 2</Text>
          </Popover>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(43, 186, 180)',
  },
  grid: {
    marginTop: 20,
    flex: 1,
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    borderRadius: 4,
    padding: 10,
    margin: 10,
    backgroundColor: '#ccc',
    borderColor: '#333',
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 10
  }
});

AppRegistry.registerComponent('PopoverExample', () => PopoverExample);
