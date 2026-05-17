import React, { createContext, useContext, useState, useEffect } from 'react';

const PlayerContext = createContext({ isPlayerOpen: false, setPlayerOpen: () => {} });

export const PlayerProvider = ({ children }) => {
  const [isPlayerOpen, setPlayerOpen] = useState(false);

  useEffect(() => {
    if (isPlayerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isPlayerOpen]);

  return (
    <PlayerContext.Provider value={{ isPlayerOpen, setPlayerOpen }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
