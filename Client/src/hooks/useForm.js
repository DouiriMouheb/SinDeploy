// src/hooks/useForm.js
import { useState, useCallback } from "react";

export const useForm = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback(
    (name, value) => {
      setValues((prev) => ({ ...prev, [name]: value }));

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [errors]
  );

  const setFieldTouched = useCallback((name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const validateField = useCallback(
    (name, value) => {
      const rule = validationRules[name];
      if (!rule) return "";

      if (rule.required && (!value || !value.toString().trim())) {
        return rule.message || `${name} is required`;
      }

      if (rule.minLength && value.length < rule.minLength) {
        return (
          rule.message ||
          `${name} must be at least ${rule.minLength} characters`
        );
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        return rule.message || `${name} format is invalid`;
      }

      if (rule.custom && typeof rule.custom === "function") {
        return rule.custom(value) || "";
      }

      return "";
    },
    [validationRules]
  );

  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach((name) => {
      const error = validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validateField, validationRules]);

  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const newValue = type === "checkbox" ? checked : value;
      setValue(name, newValue);
    },
    [setValue]
  );

  const handleBlur = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFieldTouched(name);

      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    },
    [setFieldTouched, validateField]
  );

  const handleSubmit = useCallback(
    (onSubmit) => {
      return async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Mark all fields as touched
        const allTouched = Object.keys(validationRules).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {});
        setTouched(allTouched);

        const isValid = validateForm();

        if (isValid) {
          try {
            await onSubmit(values);
          } catch (error) {
            console.error("Form submission error:", error);
          }
        }

        setIsSubmitting(false);
      };
    },
    [values, validateForm, validationRules]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const isValid = Object.keys(errors).length === 0;
  const hasValues = Object.values(values).some(
    (value) => value !== "" && value !== null && value !== undefined
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    hasValues,
    setValue,
    handleChange,
    handleBlur,
    handleSubmit,
    validateForm,
    reset,
    setIsSubmitting,
  };
};
