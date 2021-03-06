import React from 'react';
import {Animated, PanResponder, StyleSheet, TouchableOpacity, View} from 'react-native';

const REACTIONS = [
    {label: "Worried", src: require('assets/emojie/worried.png'), bigSrc: require('assets/emojie/worried_big.png')},
    {label: "Sad", src: require('assets/emojie/sad.png'), bigSrc: require('assets/emojie/sad_big.png')},
    {label: "Strong", src: require('assets/emojie/ambitious.png'), bigSrc: require('assets/emojie/ambitious_big.png')},
    {label: "Happy", src: require('assets/emojie/smile.png'), bigSrc: require('assets/emojie/smile_big.png')},
    {
        label: "Surprised",
        src: require('assets/emojie/surprised.png'),
        bigSrc: require('assets/emojie/surprised_big.png')
    },
];
const WIDTH = 250;
const DISTANCE = WIDTH / REACTIONS.length;
const END = WIDTH - DISTANCE;

export default class Rating extends React.Component {
    constructor(props) {
        super(props);
        this._pan = new Animated.Value(2 * DISTANCE);
        this.props.rate && this.props.rate(2)
    }

    componentWillMount() {
        this._panResponder = PanResponder.create({
            onMoveShouldSetResponderCapture: () => true,
            onMoveShouldSetPanResponderCapture: () => true,
            onPanResponderGrant: (e, gestureState) => {
                this._pan.setOffset(this._pan._value);
                this._pan.setValue(0);
            },
            onPanResponderMove: Animated.event([null, {dx: this._pan}]),
            onPanResponderRelease: () => {
                this._pan.flattenOffset();

                let offset = Math.max(0, this._pan._value + 0);
                if (offset < 0) return this.updatePan(0);
                if (offset > END) return this.updatePan(END);
                const modulo = offset % DISTANCE;
                offset = (modulo >= DISTANCE / 2) ? ((offset - modulo) + DISTANCE) : (offset - modulo);
                this.updatePan(offset);
            }
        });
    }
    updatePan(toValue) {
        this.props.rate && this.props.rate((toValue / DISTANCE)*2)
        Animated.spring(this._pan, {toValue, friction: 7}).start();
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.wrap}>

                    <View style={styles.reactions}>
                        {REACTIONS.map((reaction, idx) => {
                            const u = idx * DISTANCE;
                            let inputRange = [u - 20, u, u + 20];
                            let scaleOutputRange = [1, 0.25, 1];
                            let topOutputRange = [0, 10, 0];
                            let colorOutputRange = ['#999', 'transparent', '#999'];

                            if (u - 20 < 0) {
                                inputRange = [u, u + 20];
                                scaleOutputRange = [0.25, 1];
                                topOutputRange = [10, 0];
                                colorOutputRange = ['transparent', '#999'];
                            }

                            if (u + 20 > END) {
                                inputRange = [u - 20, u];
                                scaleOutputRange = [1, 0.25];
                                topOutputRange = [0, 10];
                                colorOutputRange = ['#999', 'transparent'];
                            }


                            return (
                                <TouchableOpacity onPress={() => this.updatePan(u)} activeOpacity={0.9} key={idx}>
                                    <View style={styles.smileyWrap}>
                                        <Animated.Image
                                            source={reaction.src}
                                            style={[styles.smiley, {
                                                transform: [{
                                                    scale: this._pan.interpolate({
                                                        inputRange,
                                                        outputRange: scaleOutputRange,
                                                        extrapolate: 'clamp',
                                                    })
                                                }]
                                            }]}
                                        />
                                    </View>
                                    <Animated.Text style={[styles.reactionText, {
                                        top: this._pan.interpolate({
                                            inputRange,
                                            outputRange: topOutputRange,
                                            extrapolate: 'clamp',
                                        }),
                                        color: this._pan.interpolate({
                                            inputRange,
                                            outputRange: colorOutputRange,
                                            extrapolate: 'clamp',
                                        })
                                    }]}>
                                        {reaction.label}
                                    </Animated.Text>
                                </TouchableOpacity>
                            );
                        })}
                        <Animated.View {...this._panResponder.panHandlers} style={[styles.bigSmiley, {
                            transform: [{
                                translateX: this._pan.interpolate({
                                    inputRange: [0, END],
                                    outputRange: [0, END],
                                    extrapolate: 'clamp',
                                })
                            }]
                        }]}>
                            {REACTIONS.map((reaction, idx) => {
                                let inputRange = [(idx - 1) * DISTANCE, idx * DISTANCE, (idx + 1) * DISTANCE];
                                let outputRange = [0, 1, 0];

                                if (idx == 0) {
                                    inputRange = [idx * DISTANCE, (idx + 1) * DISTANCE];
                                    outputRange = [1, 0];
                                }

                                if (idx == REACTIONS.length - 1) {
                                    inputRange = [(idx - 1) * DISTANCE, idx * DISTANCE];
                                    outputRange = [0, 1];
                                }
                                return (
                                    <Animated.Image
                                        key={idx}
                                        source={reaction.bigSrc}
                                        style={[styles.bigSmileyImage, {
                                            opacity: this._pan.interpolate({
                                                inputRange,
                                                outputRange,
                                                extrapolate: 'clamp',
                                            })
                                        }]}
                                    />
                                );
                            })}
                        </Animated.View>
                    </View>
                </View>
            </View>
        );
    }
}

const size = 42;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    wrap: {
        width: WIDTH,
        marginBottom: 20,
    },

    reactions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
    },
    smileyWrap: {
        width: DISTANCE,
        height: DISTANCE,
        justifyContent: 'center',
        alignItems: 'center',
    },
    smiley: {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: 'transparent',
    },
    bigSmiley: {
        width: DISTANCE,
        height: DISTANCE,
        borderRadius: DISTANCE / 2,
        backgroundColor: '#ffb18d',
        position: 'absolute',
        top: 0,
        left: 0,
    },
    bigSmileyImage: {
        width: DISTANCE,
        height: DISTANCE,
        position: 'absolute',
        top: 0,
        left: 0,
    },
    reactionText: {
        fontSize: 12,
        textAlign: 'center',
        color: '#999',
        fontWeight: '400',
        fontFamily: 'Avenir',
        marginTop: 5,
    }
});