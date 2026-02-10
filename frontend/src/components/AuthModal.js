import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const [error, setError] = useState("");
  const [info, setInfo] = useState(""); // для сообщений типа "письмо отправлено"
  const [submitting, setSubmitting] = useState(false);

  const { login, signup, resetPassword } = useAuth();

  const clearMessages = () => {
    setError("");
    setInfo("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    setSubmitting(true);

    try {
      if (isLogin) {
        const result = await login(formData.email, formData.password);
        if (result?.success) {
          onClose();
          setFormData({ name: "", email: "", password: "" });
        } else {
          setError(result?.error || "Ошибка входа");
        }
      } else {
        if (!formData.name || !formData.email || !formData.password) {
          setError("Заполните все поля");
          return;
        }
        const result = await signup(formData.name, formData.email, formData.password);
        if (result?.success) {
          onClose();
          setFormData({ name: "", email: "", password: "" });
        } else {
          setError(result?.error || "Ошибка регистрации");
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    clearMessages();

    if (!formData.email) {
      setError("Введите email, чтобы отправить письмо для сброса пароля");
      return;
    }

    setSubmitting(true);
    try {
      const result = await resetPassword(formData.email);
      if (result?.success) {
        setInfo("Письмо для сброса пароля отправлено. Проверьте почту (и папку Спам).");
      } else {
        setError(result?.error || "Не удалось отправить письмо для сброса пароля");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    clearMessages();
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    clearMessages();
    setFormData({ name: "", email: "", password: "" });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !submitting && onClose()}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
            data-testid="auth-modal-backdrop"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          >
            <div
              className="bg-card border border-border rounded-lg shadow-2xl w-full max-w-md overflow-hidden"
              data-testid="auth-modal"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative h-32 bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 flex items-center justify-center">
                <h2 className="text-3xl font-bold">{isLogin ? "Вход" : "Регистрация"}</h2>

                <button
                  onClick={() => !submitting && onClose()}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50"
                  data-testid="auth-modal-close"
                  aria-label="Закрыть"
                  disabled={submitting}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {!isLogin && (
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Имя
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-background border border-border rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
                      data-testid="auth-name-input"
                      required={!isLogin}
                      disabled={submitting}
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-background border border-border rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
                    data-testid="auth-email-input"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-2">
                    Пароль
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-background border border-border rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
                    data-testid="auth-password-input"
                    required
                    disabled={submitting}
                  />
                </div>

                {/* Forgot password */}
                {isLogin && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-brand-primary font-semibold hover:underline disabled:opacity-50"
                      disabled={submitting}
                      data-testid="auth-forgot-password"
                    >
                      Забыли пароль?
                    </button>
                  </div>
                )}

                {error && (
                  <div
                    className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm"
                    data-testid="auth-error-message"
                  >
                    {error}
                  </div>
                )}

                {info && (
                  <div
                    className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-md text-sm"
                    data-testid="auth-info-message"
                  >
                    {info}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-brand-primary hover:bg-brand-hover text-white font-bold py-3 rounded-md transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,59,48,0.3)] disabled:opacity-60 disabled:hover:scale-100"
                  data-testid="auth-submit-button"
                  disabled={submitting}
                >
                  {submitting ? "Подождите..." : isLogin ? "Войти" : "Зарегистрироваться"}
                </button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">
                    {isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
                  </span>
                  <button
                    type="button"
                    onClick={switchMode}
                    className="text-brand-primary font-semibold hover:underline disabled:opacity-50"
                    data-testid="auth-switch-mode"
                    disabled={submitting}
                  >
                    {isLogin ? "Зарегистрироваться" : "Войти"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
