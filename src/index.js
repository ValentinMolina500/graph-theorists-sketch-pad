import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Main from './Main';
import reportWebVitals from './reportWebVitals';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  components: {
    Button: {
      variants: {
        control: (props) => ({
          padding: 0,
          h: "2.5rem",
          w: "2.5rem",
          bg: props.active ? "#ff6f91" : "white",
          color: props.active ? "gray.50" : "gray.800",
          borderRadius: "0.5rem",
          transition: null,
          _hover: props.active ? null : { background: "#ececec" },
          _focus: props.active ? null : { outline: 0, border: "none", boxShadow: "none", background: "#ececec"}
        }),

        circle_control: (props) => ({
          padding: 0,
          h: "2.25rem",
          w: "2.25rem",
          bg: "white",
          color: "gray.800",
          borderRadius: "100%",
          _hover: { background: "#ececec", transition: "background 200ms ease"},
          _focus: { outline: 0, border: "none", boxShadow: "none", background: "#ececec"}
        })
      }
    }
  }
})
ReactDOM.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <Main />
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
