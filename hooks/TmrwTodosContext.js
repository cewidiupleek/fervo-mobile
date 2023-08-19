import { createContext, useState, useEffect, useContext } from "react";
import { db } from "../database/firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import {
  getNextActiveDay,
  getTmrwAbbrevDOW,
  getTmrwDOW,
  getTmrwDate,
} from "../utils/currentDate";
import { useSettings } from "./SettingsContext";
import { useDayChange } from "./useDayChange";

export const TmrwTodosContext = createContext();

// Sets tmrwTodos, tmrwDOWAbbrev, nextActiveDay
export const TmrwTodosProvider = ({ children }) => {
  const {
    settings: { daysActive },
    currentUserID,
  } = useSettings();
  const { dayChanged } = useDayChange();
  const [tmrwTodos, setTmrwTodos] = useState([]);
  const [tmrwDOWAbbrev, setTmrwDOWAbbrev] = useState(getTmrwAbbrevDOW());
  const [isTmrwActiveDay, setIsTmrwActiveDay] = useState(
    daysActive[getTmrwDOW()]
  );

  const [nextActiveDay, setNextActiveDay] = useState(
    getNextActiveDay(getTmrwDOW(), daysActive)
  );

  const [isTodoArrayEmpty, setIsTodoArrayEmpty] = useState(true);
  const [tmrwPageCompletedForTheDay, setTmrwPageCompletedForTheDay] =
    useState(false);

  // Re-run when it hits 12am or daysActive changes
  useEffect(() => {
    if (currentUserID) {
      getAndSetTodos();
    }
    setIsTmrwActiveDay(daysActive[getTmrwDOW()]);
    setNextActiveDay(getNextActiveDay(getTmrwDOW(), daysActive));
    setTmrwDOWAbbrev(getTmrwAbbrevDOW());
  }, [dayChanged, currentUserID]);

  // Second useEffect hook for daysActive
  useEffect(() => {
    setIsTmrwActiveDay(daysActive[getTmrwDOW()]);
    setNextActiveDay(getNextActiveDay(getTmrwDOW(), daysActive));
  }, [daysActive]);

  useEffect(() => {
    // If todo is locked, check if todo page is completed
    let allLocked =
      tmrwTodos &&
      tmrwTodos.filter((todo) => todo != null).length === 3 &&
      tmrwTodos.every((todo) => todo && todo.isLocked === true);
    if (allLocked || !isTmrwActiveDay) {
      setTmrwPageCompletedForTheDay(true);
    } else {
      setTmrwPageCompletedForTheDay(false);
    }
  }, [tmrwTodos]);

  // 1. Get tmrw day data
  const getAndSetTodos = async () => {
    let fetchedTodos = [null, null, null];
    const todoRef = doc(db, "users", currentUserID, "todos", getTmrwDate());

    const docSnapshot = await getDoc(todoRef);

    if (docSnapshot.exists()) {
      const data = docSnapshot.data();

      const { isActive, isVacation, todos } = data;
      setIsTmrwActiveDay(isActive);

      fetchedTodos = todos;
    } else {
      console.log("Todo document does not exist.");
      setIsTodoArrayEmpty(true);
    }

    setTmrwTodos(fetchedTodos);
  };

  // looks through the array of todos, and when it finds a todo with the same todoNumber as the updated todo, it replaces that old todo with the updated one. (used in bottom sheet)
  const updateTodo = (updatedTodo) => {
    setTmrwTodos((prevTodos) => {
      const updatedTodos = prevTodos.map((todo, index) =>
        index + 1 === updatedTodo.todoNumber ? updatedTodo : todo
      );
      return updatedTodos;
    });
  };


  return (
    <TmrwTodosContext.Provider
      value={{
        tmrwDOWAbbrev,
        isTmrwActiveDay,
        nextActiveDay,
        isTodoArrayEmpty,
        tmrwTodos,
        setTmrwTodos,
        updateTodo,
        tmrwPageCompletedForTheDay,
      }}
    >
      {children}
    </TmrwTodosContext.Provider>
  );
};

export const useTmrwTodos = () => useContext(TmrwTodosContext);
