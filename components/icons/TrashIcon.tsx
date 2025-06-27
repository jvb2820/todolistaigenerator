
import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

export const TrashIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.242.078 3.223.22C6.538 6.24 6.108 6.522 5.77 6.821M5.77 6.821a3.303 3.303 0 01-2.13.917M16.5 21V3.75A1.5 1.5 0 0015 2.25H9A1.5 1.5 0 007.5 3.75V21m6.75-12H9.75" />
  </svg>
);
