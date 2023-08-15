import { StyleSheet } from "react-native";
import React from "react";
import TextInput from "react-native-text-input-interactive";
import { Color } from "../../GlobalStyles";
import { useThemes } from "../../hooks/ThemesContext";

// possible types: first, last, email, password
const AuthFormInput = ({ action, value, type }) => {
  const { theme } = useThemes();
  const styles = getStyles(theme);
  return (
    <TextInput
      mainColor="#ffffffb0"
      originalColor="#ffffff2a"
      textInputStyle={styles.textInput}
      placeholderTextColor={theme.textMedium}
      placeholder={
        type === "first"
          ? "First name"
          : type === "last"
          ? "Last name"
          : type === "email"
          ? "Email"
          : "Password"
      }
      onChangeText={action}
      value={value}
      secureTextEntry={type === "password"}
      keyboardType={type === "email" ? "email-address" : "default"}
      autoCorrect={false}
      autoCapitalize="none"
    />
  );
};

export default AuthFormInput;

const getStyles = (theme) => StyleSheet.create({
  textInput: {
    backgroundColor: theme.faintPrimary,
    color: theme.textHigh,
    flex: 1,
    fontSize: 15,
    borderWidth: 1.7,
  },
});
