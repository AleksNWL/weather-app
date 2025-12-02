import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {WeatherProvider} from "./context/WeatherContext.tsx";
import {PollenContextProvider} from "./context/PollenContext.tsx";
import {CoordsCityProvider} from "./context/CoordsCityContext.tsx";


createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <CoordsCityProvider>
          <WeatherProvider>
              <PollenContextProvider>
                  <App />
              </PollenContextProvider>
          </WeatherProvider>
      </CoordsCityProvider>
  </StrictMode>,
)

if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register('/service-worker.js')
        .then(reg => {
            console.log(`Service worker успешно зарегистрирован: ${reg}`)
        })
        .catch((err) => {
            console.error("Ошабка при регистрации Service worker: ", err)
        })
} else {
    console.log("Браузер не поддерживает Service worker")
}