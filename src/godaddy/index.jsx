import { createRoot } from 'react-dom/client';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
// import reportWebVitals from '../../godaddy/client/src/reportWebVitals';

function RouterRoot() {
  return (
    <Routes>
      <Route path="*" element={<App />}>
      </Route>
    </Routes>
  );
}

createRoot(document.getElementById("godaddy-root")).render(
  <BrowserRouter>
    <RouterRoot />
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
