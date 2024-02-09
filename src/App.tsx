import React, { useEffect, useState } from 'react';
import GlobalStyle from "./styles/global";
import Header from "./components/Header";
import OrderBook from "./components/OrderBook";
function App() {
  const [windowWidth, setWindowWidth] = useState(0);
  const [isPageVisible, setIsPageVisible] = useState(true);

  // Window width detection
  useEffect(() => {
    window.onresize = () => {
      setWindowWidth(window.innerWidth);
    }
    setWindowWidth(() => window.innerWidth);
  }, []);

  // Page Visibility detection
  useEffect(() => {
    let hidden: string = '';
    let visibilityChange: string = '';

    if (typeof document.hidden !== 'undefined') { 
      hidden = 'hidden';
      visibilityChange = 'visibilitychange';
    } else { // @ts-ignore
      if (typeof document.msHidden !== 'undefined') {
        hidden = 'msHidden';
        visibilityChange = 'msvisibilitychange';
      } else { // @ts-ignore
        if (typeof document.webkitHidden !== 'undefined') {
          hidden = 'webkitHidden';
          visibilityChange = 'webkitvisibilitychange';
        }
      }
    }

    const handleVisibilityChange = () => {
      const isHidden = document['hidden'];
      if (isHidden) {
        document.title = 'Orderbook Paused';
        setIsPageVisible(false);
      } else {
        document.title = 'Orderbook';
        setIsPageVisible(true);
      }
    };
    if (typeof document.addEventListener === 'undefined' || hidden === '') {
      console.log('This demo requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.');
    } else {
      document.addEventListener(visibilityChange, handleVisibilityChange, false);
    }
  }, []);

  return (
    <>
      {isPageVisible ? <>
        <GlobalStyle />
        <Header options={[15,30]}/>
        <OrderBook windowWidth={windowWidth}/>
      </> : 'PAGE IS IDLE.'}
    </>
  );
}

export default App;
