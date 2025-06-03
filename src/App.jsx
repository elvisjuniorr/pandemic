import { useState } from 'react'
import './App.css'
import { FaVirusCovid } from "react-icons/fa6";
import { GiPoisonBottle } from "react-icons/gi";
import { GiErlenmeyer } from "react-icons/gi";
import { GiElectric } from "react-icons/gi";
import { GiWorld } from "react-icons/gi";

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <div className='top'>
          <div className='player-disease'>
            <section className='player'>
              <p>PLAYER</p>
              <p>1</p>
            </section>
            <section className='disease'>
              <section>
                <FaVirusCovid style={{color:'yellow', width:"2rem", height:"2rem"}}/>
                <FaVirusCovid style={{color:'red', width:"2rem", height:"2rem"}}/>
                <FaVirusCovid style={{color:'darkblue', width:"2rem", height:"2rem"}}/>
                <FaVirusCovid style={{color:'black', width:"2rem", height:"2rem"}}/>
              </section>
              <section>
                <GiPoisonBottle style={{color:'yellow', width:"2rem", height:"2rem"}}/>
                <GiPoisonBottle style={{color:'red', width:"2rem", height:"2rem"}}/>
                <GiPoisonBottle style={{color:'darkblue', width:"2rem", height:"2rem"}}/>
                <GiPoisonBottle style={{color:'black', width:"2rem", height:"2rem"}}/>
              </section>
            </section>
          </div>
          <div className='center'>
            <p>Turn 1</p>
            <section className='map'>
              <img src="./assets/map.svg"/>
            </section>
          </div>
          <div className='center-right'>
            <section className='infectionRate'>
              <p>INFECTION RATE</p>
              <p>2</p>
            </section>
            <section className='outbreaks'>
              <p>OUTBREAKS</p>
              <p>4</p>
            </section>
            <section className='instructions'>
              <p>*****PLAY*****</p>
              <p>1. Do 4 actions</p>
              <p>2. Draw 2 cards</p>
              <p>*Resolve any epidemics</p>
              <p>*Discard to 7 cards</p>
              <p>3. Infect cities</p>
            </section>
          </div>
        </div>
        <div className='bot'>
          <section>
            <p>HANDS</p>
            <section>
              <div>
                <p>Atlanta</p>
                <GiWorld />
                <p>1</p>
              </div>
              <div>
                <p>Atlanta</p>
                <GiWorld />
                <p>1</p>
              </div>
              <div>
                <p>Atlanta</p>
                <GiWorld />
                <p>1</p>
              </div>
              <div>
                <p>Atlanta</p>
                <GiWorld />
                <p>1</p>
              </div>
              <div>
                <p>Atlanta</p>
                <GiWorld />
                <p>1</p>
              </div>
              <div>
                <p>Atlanta</p>
                <GiWorld />
                <p>1</p>
              </div>
              <div>
                <p>Atlanta</p>
                <GiWorld />
                <p>1</p>
              </div>
            </section>
          </section>
          <section>
            <p>ACTIONS</p>
            <section>
              <p>DRIVE/FERRY</p>
              <p>DIRECT FLIGHT</p>
              <p>CHARTER FLIGHT</p>
              <p>SHUTTLE FLIGHT</p>
              <p>BUILD A R. STATION</p>
              <p>TREAT DISEASE</p>
              <p>SHARE KNOWLEDGE</p>
              <p>DISCOVER A CURE</p>
            </section>
          </section>
          <section>
            <GiElectric />
            <p>PLAYER DISCARD PILE</p>
          </section>
          <section>
            <GiErlenmeyer />
            <p>INFECTION DISCARD PILE</p>
          </section>
          <section>
            <img src="./assets/role.jpg"/>
          </section>
        </div>
      </div>  
    </>
  )
}

export default App
