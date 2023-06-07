import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Color } from "../GlobalStyles";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../database/firebase";

const DaysActiveToggle = ({ currentUserID, daysActive }) => {
  const dayKeys = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const buttonTexts = ["S", "M", "T", "W", "T", "F", "S"];
 
  const handleDayToggle = async (index) => {
    const dayKey = dayKeys[index];
    const newValue = !daysActive[dayKey];
    
    const userRef = doc(db, "users", currentUserID);
    try {
      await updateDoc(userRef, {
        [`daysActive.${dayKey}`]: newValue,
      });
    } catch (error) {
      console.error("Error updating document: ", error.message);
    } 

    daysActive[dayKey] = newValue;
  };

  return (
    <View style={styles.container}>
      {buttonTexts.map((text, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.button,
            daysActive[dayKeys[index]] ? styles.selectedButton : null,
          ]}
          onPress={() => handleDayToggle(index)}
        >
          <Text
            style={[
              styles.buttonText,
              daysActive[dayKeys[index]] ? styles.selectedButtonText : null,
            ]}
          >
            {text}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    width: 28,
    height: 36,
    backgroundColor: "rgba(243,243,243,0.1)",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 7,
    borderRadius: 10,
    marginRight: 8,
  },
  selectedButton: {
    backgroundColor: Color.white,
  },
  buttonText: {
    fontSize: 16,
    lineHeight: 15,
    textAlignVertical: "bottom",
    color: Color.white,
  },
  selectedButtonText: {
    color: Color.fervo_red,
  },
});

export default DaysActiveToggle;
