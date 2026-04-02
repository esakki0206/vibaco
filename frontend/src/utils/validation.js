export const isValidEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

export const isValidPhoneNumber = (phone) => {
  const re = /^[0-9]{10}$/;
  return re.test(phone);
};

export const isValidPostalCode = (code) => {
  const re = /^[0-9]{6}$/;
  return re.test(code);
};

export const isValidName = (name) => {
  return name && name.trim().length >= 2;
};

export const validateForm = (formData, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = formData[field];
    const fieldRules = rules[field];
    
    if (fieldRules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      errors[field] = `${field} is required`;
    } else if (value) {
      if (fieldRules.type === 'email' && !isValidEmail(value)) {
        errors[field] = 'Invalid email address';
      } else if (fieldRules.type === 'password' && !isValidPassword(value)) {
        errors[field] = 'Password must be at least 6 characters';
      } else if (fieldRules.type === 'phone' && !isValidPhoneNumber(value)) {
        errors[field] = 'Invalid phone number (10 digits)';
      } else if (fieldRules.type === 'postal' && !isValidPostalCode(value)) {
        errors[field] = 'Invalid postal code (6 digits)';
      } else if (fieldRules.minLength && value.length < fieldRules.minLength) {
        errors[field] = `${field} must be at least ${fieldRules.minLength} characters`;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
