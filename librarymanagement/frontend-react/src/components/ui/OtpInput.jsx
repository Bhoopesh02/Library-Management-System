import React, { useState, useRef, useEffect } from 'react';
import styles from './OtpInput.module.css';

export const OtpInput = ({ length = 6, value, onChange, onComplete }) => {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const inputRefs = useRef([]);

  useEffect(() => {
    if (value) {
      const valArray = value.split("").slice(0, length);
      setOtp([...valArray, ...new Array(length - valArray.length).fill("")]);
    }
  }, [value, length]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;

    const newOtp = [...otp];
    // Allow only one character per box
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);

    const combinedOtp = newOtp.join("");
    if (onChange) onChange(combinedOtp);
    if (combinedOtp.length === length && onComplete) {
      onComplete(combinedOtp);
    }

    // Move to next input if current is filled
    if (val && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0 && inputRefs.current[index - 1]) {
        // Move focus to the previous input if current is empty and backspace is pressed
        inputRefs.current[index - 1].focus();
      } else {
        // Clear current value
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
        if (onChange) onChange(newOtp.join(""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").replace(/\D/g, "").slice(0, length);
    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    
    const combinedOtp = newOtp.join("");
    if (onChange) onChange(combinedOtp);
    if (combinedOtp.length === length && onComplete) {
      onComplete(combinedOtp);
    }
    
    // Focus next empty input or last input
    const nextEmptyIndex = newOtp.findIndex(val => val === "");
    const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex;
    if (inputRefs.current[focusIndex]) {
      inputRefs.current[focusIndex].focus();
    }
  };

  return (
    <div className={styles.otpContainer}>
      {otp.map((data, index) => (
        <input
          key={index}
          className={styles.otpInput}
          type="text"
          name="otp"
          maxLength={1}
          value={data}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          ref={(ref) => (inputRefs.current[index] = ref)}
          autoFocus={index === 0}
        />
      ))}
    </div>
  );
};
