import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { email, name }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setUser({
          email: fbUser.email,
          name: fbUser.displayName || (fbUser.email ? fbUser.email.split("@")[0] : "User"),
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (e) {
      return { success: false, error: humanAuthError(e) };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (name) await updateProfile(cred.user, { displayName: name });
      return { success: true };
    } catch (e) {
      return { success: false, error: humanAuthError(e) };
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (e) {
      return { success: false, error: humanAuthError(e) };
    }
  };

  const value = useMemo(
    () => ({ user, login, signup, logout, resetPassword, loading }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

function humanAuthError(e) {
  const code = e?.code || "";
  if (code === "auth/invalid-email") return "Неверный email";
  if (code === "auth/user-not-found") return "Пользователь не найден";
  if (code === "auth/wrong-password") return "Неверный пароль";
  if (code === "auth/email-already-in-use") return "Этот email уже зарегистрирован";
  if (code === "auth/weak-password") return "Слишком простой пароль (минимум 6 символов)";
  if (code === "auth/too-many-requests") return "Слишком много попыток, попробуйте позже";
  return "Ошибка авторизации";
}
