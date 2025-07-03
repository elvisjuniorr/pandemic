import { useState, useEffect } from 'react'
import './App.css'
import { FaVirusCovid } from "react-icons/fa6";
import { GiPoisonBottle } from "react-icons/gi";
import { GiErlenmeyer } from "react-icons/gi";
import { GiElectric } from "react-icons/gi";
import { GiWorld } from "react-icons/gi";
import { Board, Player } from './game_logic.js';

function App() {
  const [gameBoard, setGameBoard] = useState(null);
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [turn, setTurn] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [gameMessage, setGameMessage] = useState('');

  // Inicializar o jogo
  useEffect(() => {
    const board = new Board();
    const player1 = new Player("Jogador 1", board.getCity("Atlanta"));
    const player2 = new Player("Jogador 2", board.getCity("Atlanta"));
    
    board.players = [player1, player2];
    
    setGameBoard(board);
    setPlayers([player1, player2]);
    setGameStarted(true);
    setGameMessage('Jogo iniciado! Faça suas ações.');
  }, []);

  const getCurrentPlayer = () => {
    return players[currentPlayerIndex];
  };

  const handleAction = (actionType) => {
    if (!gameBoard || !gameStarted) return;
    
    const currentPlayer = getCurrentPlayer();
    if (currentPlayer.actionsLeft <= 0) {
      setGameMessage('Sem ações restantes! Passe o turno.');
      return;
    }

    setSelectedAction(actionType);
    
    switch(actionType) {
      case 'TREAT_DISEASE':
        handleTreatDisease();
        break;
      case 'BUILD_STATION':
        handleBuildStation();
        break;
      default:
        setGameMessage(`Ação ${actionType} selecionada. Implementação em desenvolvimento.`);
    }
  };

  const handleTreatDisease = () => {
    const currentPlayer = getCurrentPlayer();
    const city = currentPlayer.location;
    
    // Encontrar a doença com maior nível na cidade atual
    let maxLevel = 0;
    let diseaseToTreat = null;
    
    for (const color in city.infectionLevels) {
      if (city.infectionLevels[color] > maxLevel) {
        maxLevel = city.infectionLevels[color];
        diseaseToTreat = color;
      }
    }
    
    if (diseaseToTreat && maxLevel > 0) {
      currentPlayer.treat(diseaseToTreat);
      setGameMessage(`${currentPlayer.name} tratou a doença ${diseaseToTreat} em ${city.name}.`);
      setGameBoard({...gameBoard}); // Força re-render
    } else {
      setGameMessage(`Não há doenças para tratar em ${city.name}.`);
    }
  };

  const handleBuildStation = () => {
    const currentPlayer = getCurrentPlayer();
    if (currentPlayer.buildResearchStation()) {
      setGameMessage(`${currentPlayer.name} construiu uma estação de pesquisa em ${currentPlayer.location.name}.`);
      setGameBoard({...gameBoard}); // Força re-render
    } else {
      setGameMessage(`Já existe uma estação de pesquisa em ${currentPlayer.location.name}.`);
    }
  };

  const endTurn = () => {
    if (!gameBoard) return;
    
    const currentPlayer = getCurrentPlayer();
    
    // Infectar cidades
    gameBoard.infectCities(gameBoard.infectionRate);
    
    // Resetar ações do próximo jogador
    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    players[nextPlayerIndex].resetActions();
    
    setCurrentPlayerIndex(nextPlayerIndex);
    
    if (nextPlayerIndex === 0) {
      setTurn(turn + 1);
    }
    
    // Verificar condições de fim de jogo
    if (gameBoard.checkGameOver()) {
      setGameMessage('GAME OVER! Muitos surtos ocorreram.');
      setGameStarted(false);
    } else if (gameBoard.checkWinPrototype()) {
      setGameMessage('VITÓRIA! Todas as doenças foram eliminadas.');
      setGameStarted(false);
    } else {
      setGameMessage(`Turno do ${players[nextPlayerIndex].name}`);
    }
    
    setGameBoard({...gameBoard}); // Força re-render
  };

  const getColorForDisease = (color) => {
    const colorMap = {
      'amarelo': 'yellow',
      'vermelho': 'red',
      'azul': 'darkblue',
      'preto': 'black'
    };
    return colorMap[color] || 'gray';
  };

  const getCurrentPlayerLocation = () => {
    if (!gameStarted || !players[currentPlayerIndex]) return 'Atlanta';
    return players[currentPlayerIndex].location.name;
  };

  const getCurrentPlayerActions = () => {
    if (!gameStarted || !players[currentPlayerIndex]) return 4;
    return players[currentPlayerIndex].actionsLeft;
  };

  const getCityInfectionLevels = (cityName) => {
    if (!gameBoard || !gameBoard.cities[cityName]) return {};
    return gameBoard.cities[cityName].infectionLevels;
  };

  return (
    <>
      <div>
        <div className='top'>
          <div className='player-disease'>
            <section className='player'>
              <p>PLAYER</p>
              <p>{currentPlayerIndex + 1}</p>
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
            <p>Turn {turn}</p>
            <section className="map-container">
              <img src="./assets/map.svg" alt="Mapa" className="map-image" />
              <div className="dynamic-map">
                {Object.values(gameBoard?.cities || {}).map((city) => (
                  <div
                    key={city.name}
                    className={`city-node ${players.some(p => p.location.name === city.name) ? 'active' : ''}`}
                    style={{
                      top: `${city.position?.y}px`,
                      left: `${city.position?.x}px`,
                      backgroundColor: getColorForDisease(city.color)
                    }}
                    title={city.name}
                    onClick={() => console.log(`Cidade clicada: ${city.name}`)}
                  >
                    {city.name}
                  </div>
                ))}
              </div>
            </section>
          </div>
          <div className='center-right'>
            <section className='infectionRate'>
              <p>INFECTION RATE</p>
              <p>{gameBoard ? gameBoard.infectionRate : 2}</p>
            </section>
            <section className='outbreaks'>
              <p>OUTBREAKS</p>
              <p>{gameBoard ? gameBoard.outbreakCount : 0}</p>
            </section>
            <section className='instructions'>
              <p>*****PLAY*********</p>
              <p>1. Do 4 actions</p>
              <p>2. Draw 2 cards</p>
              <p>*Resolve any epidemics</p>
              <p>*Discard to 7 cards</p>
              <p>3. Infect cities</p>
            </section>
          </div>
        </div>
        <div className='bot'>
          <section className='hands'>
            <p>HANDS</p>
            <section className='cards'>
              {gameStarted && players[currentPlayerIndex] && players[currentPlayerIndex].hand.slice(0, 7).map((card, index) => (
                <div key={index}>
                  <p>{card}</p>
                  <div><GiWorld style={{color:'#0A5C5D', width:"3.5rem", height:"3.5rem"}}/></div>               
                  <p>1</p>
                </div>
              ))}
              {Array.from({length: Math.max(0, 7 - (gameStarted && players[currentPlayerIndex] ? players[currentPlayerIndex].hand.length : 0))}).map((_, index) => (
                <div key={`empty-${index}`}>
                  <p>-</p>
                  <div><GiWorld style={{color:'#0A5C5D', width:"3.5rem", height:"3.5rem"}}/></div>               
                  <p>-</p>
                </div>
              ))}
            </section>
          </section>
          <section className='actions'>
            <p>ACTIONS</p>
            <section>
              <p onClick={() => handleAction('DRIVE_FERRY')} style={{cursor: 'pointer', backgroundColor: selectedAction === 'DRIVE_FERRY' ? '#ccc' : 'transparent'}}>DRIVE/FERRY</p>
              <p onClick={() => handleAction('DIRECT_FLIGHT')} style={{cursor: 'pointer', backgroundColor: selectedAction === 'DIRECT_FLIGHT' ? '#ccc' : 'transparent'}}>DIRECT FLIGHT</p>
              <p onClick={() => handleAction('CHARTER_FLIGHT')} style={{cursor: 'pointer', backgroundColor: selectedAction === 'CHARTER_FLIGHT' ? '#ccc' : 'transparent'}}>CHARTER FLIGHT</p>
              <p onClick={() => handleAction('SHUTTLE_FLIGHT')} style={{cursor: 'pointer', backgroundColor: selectedAction === 'SHUTTLE_FLIGHT' ? '#ccc' : 'transparent'}}>SHUTTLE FLIGHT</p>
              <p onClick={() => handleAction('BUILD_STATION')} style={{cursor: 'pointer', backgroundColor: selectedAction === 'BUILD_STATION' ? '#ccc' : 'transparent'}}>BUILD A R. STATION</p>
              <p onClick={() => handleAction('TREAT_DISEASE')} style={{cursor: 'pointer', backgroundColor: selectedAction === 'TREAT_DISEASE' ? '#ccc' : 'transparent'}}>TREAT DISEASE</p>
              <p onClick={() => handleAction('SHARE_KNOWLEDGE')} style={{cursor: 'pointer', backgroundColor: selectedAction === 'SHARE_KNOWLEDGE' ? '#ccc' : 'transparent'}}>SHARE KNOWLEDGE</p>
              <p onClick={() => handleAction('DISCOVER_CURE')} style={{cursor: 'pointer', backgroundColor: selectedAction === 'DISCOVER_CURE' ? '#ccc' : 'transparent'}}>DISCOVER A CURE</p>
            </section>
            <button onClick={endTurn} style={{marginTop: '10px', padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer'}}>
              Finalizar Turno
            </button>
          </section>
          <section className='playerDiscard'>           
            <p>PLAYER DISCARD PILE</p>
            <section>
              <GiElectric style={{color:'#0A5C5D', width:"10rem", height:"10rem"}}/>
            </section>
          </section>
          <section className='infectionDiscard'>           
            <p>INFECTION DISCARD PILE</p>
            <section>
              <GiErlenmeyer style={{color:'#0A5C5D', width:"10rem", height:"10rem"}}/>
            </section>
          </section>
          <section className='role'>
            <p>ROLE</p>
            <section>
              <img src="./assets/role.jpg"/>
            </section>          
          </section>
        </div>
        {gameMessage && (
          <div style={{position: 'fixed', bottom: '20px', left: '20px', backgroundColor: '#333', color: 'white', padding: '10px', borderRadius: '5px'}}>
            {gameMessage}
          </div>
        )}
      </div>  
    </>
  )
}

export default App