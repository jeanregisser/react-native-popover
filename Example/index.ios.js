'use strict';

var React = require('react');
var Popover = require('../Popover');
var {
  AppRegistry,
  StyleSheet,
  Dimensions,
  Text,
  TouchableHighlight,
  View,
} = require('react-native');

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
    var {width, height} = Dimensions.get('window');
    var displayArea = {x: 5, y: 20, width: width - 10, height: height - 25};

    return (
      <View style={styles.container}>
        <View style={styles.grid}>
          <View style={styles.row}>
            {this.renderButton('TL', 'button1')}
            {this.renderButton('T', 'button2')}
            {this.renderButton('TR', 'button3')}
          </View>
          <View style={styles.row}>
            {this.renderButton('L', 'button4')}
            {this.renderButton('C', 'button5')}
            {this.renderButton('R', 'button6')}
          </View>
          <View style={styles.row}>
            {this.renderButton('BL', 'button7')}
            {this.renderButton('B', 'button8')}
            {this.renderButton('BR', 'button9')}
          </View>
        </View>
        <Popover
            isVisible={this.state.isVisible}
            fromRect={this.state.buttonRect}
            displayArea={displayArea}
            onClose={this.closePopover}>
            <View style={styles.popoverContent}>
              <Text style={styles.popoverText}>Content</Text>
            </View>
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
    backgroundColor: 'white',
    opacity: 0.8,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  popoverContent: {
    width: 200,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popoverText: {
    color: '#ccc',
  },
});

AppRegistry.registerComponent('PopoverExample', () => PopoverExample);
