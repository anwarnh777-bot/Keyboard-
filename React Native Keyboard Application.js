import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, SafeAreaView, Animated, NativeModules } from 'react-native';

const PASTEL_COLORS = ['#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA', '#F3C6F8'];

const { SystemKeyboardModule } = NativeModules;

export default function App() {
  const [text, setText] = useState('');
  const [isUppercase, setIsUppercase] = useState(true);
  const [activeRipple, setActiveRipple] = useState(null);
  const animValue = useRef(new Animated.Value(0)).current;

  const handlePress = (pressedKey, rowIndex, keyIndex) => {
    if (pressedKey === '⇧') {
      setIsUppercase(!isUppercase);
      return;
    }

    const randomColor = PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)];

    setActiveRipple({
      row: rowIndex,
      col: keyIndex,
      color: randomColor,
    });

    animValue.setValue(0);
    Animated.timing(animValue, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start(() => {
      setActiveRipple(null);
    });

    if (pressedKey === '⌫') {
      setText(prev => prev.slice(0, -1));
      if (SystemKeyboardModule && SystemKeyboardModule.deleteChar) {
        SystemKeyboardModule.deleteChar();
      }
    } else if (pressedKey === 'SPACE') {
      setText(prev => prev + ' ');
      if (SystemKeyboardModule && SystemKeyboardModule.sendText) {
        SystemKeyboardModule.sendText(' ');
      }
    } else {
      const charToAdd = (pressedKey.length === 1 && isUppercase) ? pressedKey.toUpperCase() : pressedKey.toLowerCase();
      setText(prev => prev + charToAdd);
      if (SystemKeyboardModule && SystemKeyboardModule.sendText) {
        SystemKeyboardModule.sendText(charToAdd);
      }
    }
  };

  const row0 = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  const row1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
  const row2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
  const row3 = ['⇧', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'];
  const row4 = ['SPACE'];

  const rows = [row0, row1, row2, row3, row4];

  const getKeyStyle = (rowIndex, colIndex) => {
    if (!activeRipple) return { borderColor: '#2c2c35', borderWidth: 1 };

    const isPressedKey = rowIndex === activeRipple.row && colIndex === activeRipple.col;

    const borderColorAnim = animValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: ['#2c2c35', activeRipple.color, '#2c2c35'],
    });

    const borderWidthAnim = animValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, isPressedKey ? 2 : 1.2, 1],
    });

    return {
      borderColor: borderColorAnim,
      borderWidth: borderWidthAnim,
      opacity: isPressedKey ? 1 : 0.85,
    };
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        style={styles.input}
        value={text}
        editable={false}
        placeholder="Type here..."
        placeholderTextColor="#777"
      />
      <View style={styles.keyboardContainer}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((key, colIndex) => {
              const animatedStyle = getKeyStyle(rowIndex, colIndex);
              const displayKey = (key.length === 1 && key >= 'A' && key <= 'Z') 
                ? (isUppercase ? key : key.toLowerCase()) 
                : key;
              
              return (
                <TouchableOpacity
                  key={key + colIndex}
                  activeOpacity={0.7}
                  onPress={() => handlePress(key, rowIndex, colIndex)}
                  style={{ flex: key === 'SPACE' ? 4 : (key === '⇧' || key === '⌫' ? 1.5 : 1) }}
                >
                  <Animated.View
                    style={[
                      styles.key,
                      key === 'SPACE' ? styles.spaceKey : null,
                      animatedStyle,
                    ]}
                  >
                    <Text style={styles.keyText}>{displayKey === 'SPACE' ? '' : displayKey}</Text>
                  </Animated.View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121216',
    justifyContent: 'flex-end',
    paddingBottom: 25,
  },
  input: {
    height: 55,
    borderWidth: 1,
    borderColor: '#2c2c35',
    backgroundColor: '#1c1c24',
    color: '#FFB7B2',
    fontSize: 18,
    paddingHorizontal: 15,
    marginBottom: 25,
    borderRadius: 10,
    marginHorizontal: 12,
  },
  keyboardContainer: {
    paddingHorizontal: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 6,
  },
  key: {
    backgroundColor: '#1c1c24',
    margin: 2.5,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  spaceKey: {
    width: '100%',
  },
  keyText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});