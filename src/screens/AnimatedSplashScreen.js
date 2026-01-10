import React, { useRef, useEffect } from 'react';
import { StyleSheet, ImageBackground, Dimensions } from 'react-native'; 
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

export default function AnimatedSplashScreen({ onFinish }) {
  const animation = useRef(null);

  useEffect(() => {
    if (animation.current) {
      animation.current.play();
    }
  }, []);

  return (
    <ImageBackground 
      source={require('../../assets/splash-icon.png')} 
      style={styles.container}
      resizeMode="cover"
    >
      <LottieView
        ref={animation}
        source={require('../../assets/splash-animation.json')}
        style={styles.lottie}
        resizeMode="contain"
        loop={false}
        speed={0.8}
        onAnimationFinish={(isCancelled) => {
          if (!isCancelled) {
             onFinish();
          }
        }}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: width,
    height: height,
  },
});