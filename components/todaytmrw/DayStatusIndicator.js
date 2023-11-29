import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import ClockIcon from "../../assets/icons/clock.svg";
import { useThemes } from "../../hooks/ThemesContext";
import { useDayStatus } from "../../hooks/DayStatusContext";
import BottomModal from "../BottomModal";
import SetDeadline from "../onboard/SetDeadline";
import { useSettings } from "../../hooks/SettingsContext";
import { useDayChange } from "../../hooks/useDayChange";
import { db } from "../../database/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { abbreviateDOW } from "../../utils/currentDate";
import InfoIcon from "../../assets/icons/info-icon-alt.svg";
import { LinearGradient } from "expo-linear-gradient";

const DayStatusIndicator = ({ message }) => {
  const { theme, backgroundGradient } = useThemes();
  const { dayCompleted, timeStatusBadge, timeStatus } =
    useDayStatus();
  const { tmrwDOW } = useDayChange();
  const {
    settings: { todayDayStart, todayDayEnd },
    currentUserID,
  } = useSettings();
  const styles = getStyles(theme, dayCompleted, timeStatus);
  const mountedRef = useRef(false); // prevent firebase update on mount

  const [modalVisible, setModalVisible] = useState(false);
  const [modalHeight, setModalHeight] = useState(0);

  const [timePickerText, setTimePickerText] = useState({
    start: `${todayDayStart} AM`,
    end: `${todayDayEnd} PM`,
  });

  // If a change is made to dayStart/dayEnd, update firebase
  useEffect(() => {
    if (mountedRef.current) {
      const updateFirebase = async () => {

        // Extract the hour and minute part from the timePickerText state
        const formattedDayStart = timePickerText.start.split(" ")[0];
        const formattedDayEnd = timePickerText.end.split(" ")[0];
        try {

          // Update the user settings tmrw fields with the new start and end times
          await updateDoc(doc(db, "users", currentUserID), {
            nextDayStart: formattedDayStart,
            nextDayEnd: formattedDayEnd,
          });
        } catch (error) {
          console.error("Error updating document: ", error.message);
        }
      };

      updateFirebase();
    } else {
      mountedRef.current = true;
    }
  }, [timePickerText]);

  // Gets modal height
  const onLayout = (event) => {
    const { height } = event.nativeEvent.layout;
    setModalHeight(height);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.headerSubtitle}>{timeStatusBadge}</Text>
        {timeStatusBadge.includes("PM") && timeStatus == 1 && (
          <View>
            <ClockIcon color={theme.textHigh} height={19} width={19} />
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        onDismiss={() => setModalVisible(false)}
        onRequestClose={() => setModalVisible(false)}
        presentationStyle={"pageSheet"}
      >
        <TouchableWithoutFeedback
          onPressOut={(e) => {
            if (e.nativeEvent.locationY > 150) {
              setModalVisible(false);
            }
          }}
        >
          <LinearGradient colors={backgroundGradient} style={{ flex: 1 }}>
            <View style={styles.pageContainer} onLayout={onLayout}>
              <View>
                <Text style={styles.titleText}>Set Deadline</Text>
              </View>
              <View style={styles.explainerContainer}>
                <InfoIcon color={theme.textMedium} width={21} height={21} />
                <Text style={styles.explainerText}>
                  The below times go into effect tomorrow (on{" "}
                  {abbreviateDOW(tmrwDOW)})
                </Text>
              </View>
              <SetDeadline
                timePickerText={timePickerText}
                setTimePickerText={setTimePickerText}
                isOnboardingModal={false}
              />
            </View>
          </LinearGradient>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

export default DayStatusIndicator;

const getStyles = (theme, dayCompleted, timeStatus, modalHeight) =>
  StyleSheet.create({
    button: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      gap: 7,
      paddingVertical: 2,
      paddingHorizontal: 10,

      // Background & border
      backgroundColor:
        timeStatus == 0 || timeStatus == 2
          ? theme.dayStatusIndicatorBg
          : dayCompleted
          ? theme.dayStatusIndicatorBgComplete
          : theme.dayStatusIndicatorBgIncomplete,
      borderColor:
        timeStatus == 0 || timeStatus == 2
          ? theme.dayStatusIndicatorBorder
          : dayCompleted
          ? theme.dayStatusIndicatorBorderComplete
          : theme.dayStatusIndicatorBorderIncomplete,
      borderRadius: 16,
      borderWidth: 2,

      // Adding glow effect
      shadowColor:
        timeStatus == 0 || timeStatus == 2
          ? "#ffffff"
          : dayCompleted
          ? theme.dayStatusIndicatorBgComplete
          : theme.dayStatusIndicatorBgIncomplete,
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.5,
      shadowRadius: 10,
    },
    headerSubtitle: {
      color: theme.textHigh,
      fontSize: 15, // 22
      paddingBottom: 4, //temp
      fontWeight: "bold",
      marginTop: 5,
    },

    pageContainer: {
      height: "100%",
      alignItems: "center",
      paddingHorizontal: 20,
      flex: 1,
    },
    titleText: {
      color: theme.textHigh,
      fontSize: 26,
      fontWeight: 600,
      marginTop: 35,
    },
    explainerContainer: {
      backgroundColor: theme.faintishPrimary,
      flexDirection: "row",
      alignItems: "center",
      marginTop: 10,
      marginBottom: 15,
      gap: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
    },
    explainerText: {
      fontSize: 15,
      color: theme.textMedium,
      lineHeight: 22,
    },
  });
