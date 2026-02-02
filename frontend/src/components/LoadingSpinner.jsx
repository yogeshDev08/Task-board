import React from 'react';
import { TailSpin } from 'react-loader-spinner';

const LoadingSpinner = ({ size = 40, color = '#3B82F6' }) => {
  return (
    <div className="flex justify-center items-center p-4">
      <TailSpin
        height={size}
        width={size}
        color={color}
        ariaLabel="loading"
      />
    </div>
  );
};

export default LoadingSpinner;
