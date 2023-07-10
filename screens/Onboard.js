import React, { useState, useRef, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Animated,
  FlatList,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import StepIndicator from "react-native-step-indicator";
import SetDeadline from "../components/onboard/SetDeadline";
import NextButton from "../components/onboard/NextButton";
import SetStartDay from "../components/onboard/SetStartDay";

const thirdIndicatorStyles = {
  stepIndicatorSize: 25,
  currentStepIndicatorSize: 30,

  // border
  currentStepStrokeWidth: 3,
  stepStrokeWidth: 3,
  stepStrokeCurrentColor: "#e7e7e7",
  stepStrokeFinishedColor: "#e7e7e7",
  stepStrokeUnFinishedColor: "#f56565",

  // line
  separatorStrokeWidth: 2,
  separatorFinishedColor: "#e7e7e7",
  separatorUnFinishedColor: "#ffffff2a",

  // inside circle
  stepIndicatorFinishedColor: "#e7e7e7",
  stepIndicatorUnFinishedColor: "#f97676",
  stepIndicatorCurrentColor: "#ffffff",

  stepIndicatorLabelFontSize: 0,
  currentStepIndicatorLabelFontSize: 10,
  stepIndicatorLabelCurrentColor: "transparent",
  stepIndicatorLabelFinishedColor: "transparent",
  stepIndicatorLabelUnFinishedColor: "transparent",

  labelAlign: "left",
  // labelColor: "#e6e6e6",
  // labelSize: 16,
  // currentStepLabelColor: "#eeeeee",
};

const PAGES = ["Page 1", "Page 2", "Page 3"];
const itemHeight = Dimensions.get("window").height;

export default function App() {
  const [currentPage, setCurrentPage] = useState(0);
  const scrollAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null); // Add this line
  const [furthestPageUnlocked, setFurthestPageUnlocked] = useState(0);

  useEffect(() => {
    console.log(currentPage);
  }, [currentPage]);

  const renderLabel = ({ position, label, currentPosition }) => {
    return (
      <Text
        style={
          position === currentPosition
            ? styles.stepLabelSelected
            : styles.stepLabel
        }
      >
        {label}
      </Text>
    );
  };

  const onPageChange = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollAnim } } }],
    {
      listener: (event) => {
        const page = Math.round(event.nativeEvent.contentOffset.y / itemHeight);
        if (page !== currentPage) {
          setCurrentPage(page);
        }
      },
      useNativeDriver: false,
    }
  );

  const onStepPress = (position) => {
    // Only allow navigation to the same page or a previous page
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({
        offset: position * itemHeight,
        animated: true,
      });
    }
  };

  const renderViewPagerPage = ({ item, index }) => {
    const opacity = scrollAnim.interpolate({
      inputRange: [
        (index - 1) * itemHeight,
        index * itemHeight,
        (index + 1) * itemHeight,
      ],
      outputRange: [-2, 1, -2],
      extrapolate: "clamp",
    });

    const onNextPress = () => {
      if (currentPage < PAGES.length - 1) {
        const nextPage = currentPage + 1;

        flatListRef.current.scrollToIndex({
          animated: true,
          index: nextPage,
        });
      }
    };

    return (
      <Animated.View style={[styles.pageContainer, { opacity }]}>
        {index === 0 ? (
          <View style={styles.pageContent}>
            <View style={styles.contentContainer}>
              <SetDeadline />
            </View>
            <View style={styles.nextButtonContainer}>
              <NextButton action={onNextPress} text={"Next"} />
            </View>
          </View>
        ) : index === 1 ? (
          <View style={styles.pageContent}>
            <View style={styles.contentContainer}>
              <SetStartDay />
            </View>
            <View style={styles.nextButtonContainer}>
              <NextButton action={onNextPress} text={"Next"} />
            </View>
          </View>
        ) : index === 2 ? (
          <View style={styles.pageContent}>
            <View style={styles.contentContainer}>
              <Text>Carrot</Text>
            </View>
            <View style={styles.nextButtonContainer}>
              <NextButton action={onNextPress} text={"Next"} />
            </View>
          </View>
        ) : (
          <Text>Error</Text>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.gettingStartedText}>Getting Started</Text>
      <View style={styles.stepIndicator}>
        <StepIndicator
          stepCount={3}
          customStyles={thirdIndicatorStyles}
          currentPosition={currentPage}
          onPress={onStepPress}
          renderLabel={renderLabel}
          labelAlign="left"
          labels={["Set daily deadline", "Set start day", "Lock in 3 tasks"]}
          direction="vertical"
        />
      </View>
      <FlatList
        ref={flatListRef} // Add this line
        data={PAGES}
        renderItem={renderViewPagerPage}
        keyExtractor={(item, index) => "page_" + index}
        pagingEnabled
        vertical
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onPageChange}
        getItemLayout={(data, index) => ({
          length: itemHeight,
          offset: itemHeight * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  pageContainer: {
    height: itemHeight,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,

    // borderWidth: 1,
    // borderColor: "black",
  },
  pageContent: {
    position: "absolute",
    bottom: 0,

    flex: 1,
    height: "73%",
    width: "100%",

    // borderWidth: 1,
    // borderColor: "black",
  },
  contentContainer: {
    flex: 8,
    width: "100%",
    justifyContent: "center",

    // borderColor: "black",
    // borderWidth: 1,
  },
  nextButtonContainer: {
    flex: 2,
    width: "100%",
    alignItems: "center",

    // borderColor: "black",
    // borderWidth: 1,
  },

  gettingStartedText: {
    fontSize: 25,
    fontWeight: 700,
    color: "white",
    width: 100,
    marginTop: 10,
    marginLeft: 20,
    position: "absolute",
    top: 60,
  },
  stepIndicator: {
    zIndex: 1,

    position: "absolute",
    top: "7%",
    right: 0,

    height: "20%",

    // borderColor: "black",
    // borderWidth: 1,

    width: "60%",

    flexDirection: "row",
    gap: 20,
  },

  headerContainer: {},
  headerText: {},

  // Step indicator
  stepLabel: {
    fontSize: 17,
    fontWeight: "500",
    color: "#ffffffbd",
    paddingLeft: 10,
    fontWeight: 400,
  },
  stepLabelSelected: {
    fontSize: 17,
    fontWeight: "500",
    color: "#ffffff",
    paddingLeft: 10,
    fontWeight: 700,
  },
});
