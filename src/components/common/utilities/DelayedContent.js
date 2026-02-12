import { useState, useEffect } from 'react';

const DelayedContent = ({ children, delay = 500 }) => {
  const [isVisible, setVisility] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setVisility(true);
    }, delay);
  }, [delay]);
  return isVisible ? children : null;
};

export default DelayedContent;
