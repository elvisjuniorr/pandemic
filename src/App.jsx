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
  const [showCitySelection, setShowCitySelection] = useState(false);
  const [availableCities, setAvailableCities] = useState([]);

  // Inicializar o jogo
  useEffect(() => {
    const board = new Board();
    const player1 = new Player("Jogador 1", board.getCity("Atlanta"));
    const player2 = new Player("Jogador 2", board.getCity("Atlanta"));
    
    // Distribuir cartas iniciais
    for (let i = 0; i < 4; i++) {
      if (board.playerDeck.length > 0) {
        player1.addCard(board.playerDeck.shift());
      }
      if (board.playerDeck.length > 0) {
        player2.addCard(board.playerDeck.shift());
      }
    }
    
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
      case 'DRIVE_FERRY':
        handleDriveFerry();
        break;
      case 'DIRECT_FLIGHT':
        handleDirectFlight();
        break;
      case 'CHARTER_FLIGHT':
        handleCharterFlight();
        break;
      case 'SHUTTLE_FLIGHT':
        handleShuttleFlight();
        break;
      case 'TREAT_DISEASE':
        handleTreatDisease();
        break;
      case 'BUILD_STATION':
        handleBuildStation();
        break;
      case 'SHARE_KNOWLEDGE':
        handleShareKnowledge();
        break;
      case 'DISCOVER_CURE':
        handleDiscoverCure();
        break;
      default:
        setGameMessage(`Ação ${actionType} selecionada.`);
    }
  };

  const handleDriveFerry = () => {
    const currentPlayer = getCurrentPlayer();
    const connectedCities = currentPlayer.location.connections;
    
    if (connectedCities.length === 0) {
      setGameMessage('Não há cidades conectadas para se mover.');
      return;
    }
    
    setAvailableCities(connectedCities);
    setShowCitySelection(true);
    setGameMessage('Selecione uma cidade conectada para se mover.');
  };

  const handleDirectFlight = () => {
    const currentPlayer = getCurrentPlayer();
    const cityCardsInHand = currentPlayer.hand.filter(card => gameBoard.cities[card]);
    
    if (cityCardsInHand.length === 0) {
      setGameMessage('Você não possui cartas de cidade para voo direto.');
      return;
    }
    
    const availableCities = cityCardsInHand.map(cardName => gameBoard.cities[cardName]);
    setAvailableCities(availableCities);
    setShowCitySelection(true);
    setGameMessage('Selecione uma cidade da sua mão para voo direto.');
  };

  const handleCharterFlight = () => {
    const currentPlayer = getCurrentPlayer();
    const currentCityCard = currentPlayer.hand.find(card => card === currentPlayer.location.name);
    
    if (!currentCityCard) {
      setGameMessage('Você precisa da carta da cidade atual para voo fretado.');
      return;
    }
    
    const allCities = Object.values(gameBoard.cities).filter(city => city.name !== currentPlayer.location.name);
    setAvailableCities(allCities);
    setShowCitySelection(true);
    setGameMessage('Selecione qualquer cidade para voo fretado.');
  };

  const handleShuttleFlight = () => {
    const currentPlayer = getCurrentPlayer();
    
    if (!currentPlayer.location.hasResearchStation) {
      setGameMessage('Você precisa estar em uma estação de pesquisa para voo shuttle.');
      return;
    }
    
    const stationCities = Object.values(gameBoard.cities).filter(city => 
      city.hasResearchStation && city.name !== currentPlayer.location.name
    );
    
    if (stationCities.length === 0) {
      setGameMessage('Não há outras estações de pesquisa disponíveis.');
      return;
    }
    
    setAvailableCities(stationCities);
    setShowCitySelection(true);
    setGameMessage('Selecione uma estação de pesquisa para voo shuttle.');
  };

  const handleCitySelection = (selectedCity) => {
    const currentPlayer = getCurrentPlayer();
    
    switch(selectedAction) {
      case 'DRIVE_FERRY':
        if (currentPlayer.move(selectedCity)) {
          setGameMessage(`${currentPlayer.name} se moveu para ${selectedCity.name}.`);
        }
        break;
      case 'DIRECT_FLIGHT':
        currentPlayer.removeCard(selectedCity.name);
        currentPlayer.location = selectedCity;
        currentPlayer.actionsLeft--;
        setGameMessage(`${currentPlayer.name} voou para ${selectedCity.name} (voo direto).`);
        break;
      case 'CHARTER_FLIGHT':
        currentPlayer.removeCard(currentPlayer.location.name);
        currentPlayer.location = selectedCity;
        currentPlayer.actionsLeft--;
        setGameMessage(`${currentPlayer.name} voou para ${selectedCity.name} (voo fretado).`);
        break;
      case 'SHUTTLE_FLIGHT':
        currentPlayer.location = selectedCity;
        currentPlayer.actionsLeft--;
        setGameMessage(`${currentPlayer.name} voou para ${selectedCity.name} (voo shuttle).`);
        break;
    }
    
    setShowCitySelection(false);
    setAvailableCities([]);
    setSelectedAction(null);
    setGameBoard({...gameBoard}); // Força re-render
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
    const hasCurrentCityCard = currentPlayer.hand.includes(currentPlayer.location.name);
    
    if (!hasCurrentCityCard) {
      setGameMessage('Você precisa da carta da cidade atual para construir uma estação.');
      return;
    }
    
    if (currentPlayer.buildResearchStation()) {
      currentPlayer.removeCard(currentPlayer.location.name);
      setGameMessage(`${currentPlayer.name} construiu uma estação de pesquisa em ${currentPlayer.location.name}.`);
      setGameBoard({...gameBoard}); // Força re-render
    } else {
      setGameMessage(`Já existe uma estação de pesquisa em ${currentPlayer.location.name}.`);
    }
  };

  const handleShareKnowledge = () => {
    const currentPlayer = getCurrentPlayer();
    const otherPlayers = players.filter((_, index) => index !== currentPlayerIndex);
    const playersInSameCity = otherPlayers.filter(player => player.location.name === currentPlayer.location.name);
    
    if (playersInSameCity.length === 0) {
      setGameMessage('Não há outros jogadores na mesma cidade para compartilhar conhecimento.');
      return;
    }
    
    const currentCityCard = currentPlayer.hand.find(card => card === currentPlayer.location.name);
    if (currentCityCard) {
      // Dar carta da cidade atual para outro jogador
      const otherPlayer = playersInSameCity[0];
      currentPlayer.removeCard(currentCityCard);
      otherPlayer.addCard(currentCityCard);
      currentPlayer.actionsLeft--;
      setGameMessage(`${currentPlayer.name} compartilhou conhecimento com ${otherPlayer.name}.`);
      setGameBoard({...gameBoard});
    } else {
      setGameMessage('Você não possui a carta da cidade atual para compartilhar.');
    }
  };

  const handleDiscoverCure = () => {
    const currentPlayer = getCurrentPlayer();
    
    if (!currentPlayer.location.hasResearchStation) {
      setGameMessage('Você precisa estar em uma estação de pesquisa para descobrir uma cura.');
      return;
    }
    
    // Verificar se tem 5 cartas da mesma cor
    const colorCounts = {};
    currentPlayer.hand.forEach(card => {
      const city = gameBoard.cities[card];
      if (city) {
        colorCounts[city.color] = (colorCounts[city.color] || 0) + 1;
      }
    });
    
    const curableColor = Object.keys(colorCounts).find(color => colorCounts[color] >= 5);
    
    if (curableColor && !gameBoard.curedDiseases[curableColor]) {
      // Remover 5 cartas da cor
      const cardsToRemove = currentPlayer.hand.filter(card => {
        const city = gameBoard.cities[card];
        return city && city.color === curableColor;
      }).slice(0, 5);
      
      cardsToRemove.forEach(card => currentPlayer.removeCard(card));
      gameBoard.curedDiseases[curableColor] = true;
      currentPlayer.actionsLeft--;
      
      setGameMessage(`${currentPlayer.name} descobriu a cura para a doença ${curableColor}!`);
      setGameBoard({...gameBoard});
    } else if (gameBoard.curedDiseases[curableColor]) {
      setGameMessage(`A cura para ${curableColor} já foi descoberta.`);
    } else {
      setGameMessage('Você precisa de 5 cartas da mesma cor para descobrir uma cura.');
    }
  };

  const endTurn = () => {
    if (!gameBoard) return;
    
    const currentPlayer = getCurrentPlayer();
    
    // Comprar 2 cartas
    for (let i = 0; i < 2; i++) {
      if (gameBoard.playerDeck.length > 0) {
        currentPlayer.addCard(gameBoard.playerDeck.shift());
      }
    }
    
    // Descartar se tiver mais de 7 cartas
    while (currentPlayer.hand.length > 7) {
      const cardToDiscard = currentPlayer.hand.pop();
      gameBoard.playerDiscard.push(cardToDiscard);
    }
    
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

  const getDiseaseStatus = (color) => {
    if (!gameBoard) return false;
    return gameBoard.curedDiseases[color];
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
                <FaVirusCovid style={{color:'yellow', width:"2rem", height:"2rem", opacity: getDiseaseStatus('amarelo') ? 0.3 : 1}}/>
                <FaVirusCovid style={{color:'red', width:"2rem", height:"2rem", opacity: getDiseaseStatus('vermelho') ? 0.3 : 1}}/>
                <FaVirusCovid style={{color:'darkblue', width:"2rem", height:"2rem", opacity: getDiseaseStatus('azul') ? 0.3 : 1}}/>
                <FaVirusCovid style={{color:'black', width:"2rem", height:"2rem", opacity: getDiseaseStatus('preto') ? 0.3 : 1}}/>
              </section>
              <section>
                <GiPoisonBottle style={{color:'yellow', width:"2rem", height:"2rem", opacity: getDiseaseStatus('amarelo') ? 0.3 : 1}}/>
                <GiPoisonBottle style={{color:'red', width:"2rem", height:"2rem", opacity: getDiseaseStatus('vermelho') ? 0.3 : 1}}/>
                <GiPoisonBottle style={{color:'darkblue', width:"2rem", height:"2rem", opacity: getDiseaseStatus('azul') ? 0.3 : 1}}/>
                <GiPoisonBottle style={{color:'black', width:"2rem", height:"2rem", opacity: getDiseaseStatus('preto') ? 0.3 : 1}}/>
              </section>
            </section>
          </div>
          <div className='center'>
            <p>Turn {turn}</p>
            <section className='map'>
              <img src="./assets/map.svg"/>
              <div className='location-info'>
                <p>Localização: {getCurrentPlayerLocation()}</p>
                <p>Ações restantes: {getCurrentPlayerActions()}</p>
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
                  <div><GiWorld style={{color: gameBoard && gameBoard.cities[card] ? getColorForDisease(gameBoard.cities[card].color) : '#0A5C5D', width:"3.5rem", height:"3.5rem"}}/></div>               
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
              <p style={{fontSize: '1rem', marginTop: '5px'}}>{gameBoard ? gameBoard.playerDiscard.length : 0} cartas</p>
            </section>
          </section>
          <section className='infectionDiscard'>           
            <p>INFECTION DISCARD PILE</p>
            <section>
              <GiErlenmeyer style={{color:'#0A5C5D', width:"10rem", height:"10rem"}}/>
              <p style={{fontSize: '1rem', marginTop: '5px'}}>{gameBoard ? gameBoard.infectionDiscard.length : 0} cartas</p>
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
        {showCitySelection && (
          <div style={{position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#003B40', border: '2px solid #0A5C5D', borderRadius: '10px', padding: '20px', zIndex: 1000}}>
            <p style={{color: 'white', marginBottom: '15px', textAlign: 'center'}}>Selecione uma cidade:</p>
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto'}}>
              {availableCities.map((city, index) => (
                <button 
                  key={index}
                  onClick={() => handleCitySelection(city)}
                  style={{
                    padding: '10px',
                    backgroundColor: '#0A5C5D',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {city.name}
                </button>
              ))}
            </div>
            <button 
              onClick={() => {setShowCitySelection(false); setSelectedAction(null);}}
              style={{
                marginTop: '15px',
                padding: '8px 15px',
                backgroundColor: '#d32f2f',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Cancelar
            </button>
          </div>
        )}
      </div>  
    </>
  )
}

export default App
