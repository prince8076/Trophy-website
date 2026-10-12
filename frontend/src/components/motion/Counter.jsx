import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export default function Counter({ value, suffix = '', prefix = '', duration = 2 }) {
  const numericValue = parseFloat(value.toString().replace(/[^0-9.]/g, '')) || 0;
  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    spring.set(numericValue);
  }, [spring, numericValue]);

  useEffect(() => {
    return spring.on('change', latest => {
      setDisplayValue(Math.floor(latest));
    });
  }, [spring]);

  return (
    <span className="tabular-nums">
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}

