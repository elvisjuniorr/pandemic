class City {
    constructor(name, color) {
        this.name = name;
        this.color = color;
        this.connections = [];
        this.infectionLevels = {"vermelho": 0, "azul": 0, "amarelo": 0, "preto": 0};
        this.hasResearchStation = false;
        this.board = null; // Referência ao tabuleiro, será definida posteriormente
    }

    addConnection(city) {
        if (!this.connections.includes(city)) {
            this.connections.push(city);
            city.connections.push(this);
        }
    }

    infect(color) {
        if (this.infectionLevels[color] < 3) {
            this.infectionLevels[color]++;
            return false; // Sem surto
        } else {
            return true; // Ocorreu um surto
        }
    }

    treatDisease(color) {
        if (this.infectionLevels[color] > 0) {
            this.infectionLevels[color]--;
            return true;
        }
        return false;
    }

    toString() {
        return `${this.name} (${this.color}), Infections: ${JSON.stringify(this.infectionLevels)}, Research: ${this.hasResearchStation}`;
    }
}

class Player {
    constructor(name, location) {
        this.name = name;
        this.location = location;
        this.actionsLeft = 4;
        this.hand = [];
    }

    move(city) {
        if (this.location.connections.includes(city)) {
            console.log(`${this.name} se moveu de ${this.location.name} para ${city.name}.`);
            this.location = city;
            this.actionsLeft--;
            return true;
        } else {
            console.log(`${this.name} não pode se mover para ${city.name}. Não estão conectados.`);
            return false;
        }
    }

    treat(color = null) {
        if (color in this.location.infectionLevels) {
            if (this.location.hasResearchStation) {
                if (this.location.infectionLevels[color] > 0) {
                    console.log(`${this.name} curou completamente a doença ${color} em ${this.location.name} (centro de pesquisa).`);
                    this.location.infectionLevels[color] = 0;
                    this.actionsLeft--;
                    return true;
                } else {
                    console.log(`Não há infecção de ${color} para curar em ${this.location.name}.`);
                    return false;
                }
            } else {
                if (this.location.infectionLevels[color] > 0) {
                    console.log(`${this.name} tratou a doença ${color} em ${this.location.name}.`);
                    this.location.infectionLevels[color]--;
                    this.actionsLeft--;
                    return true;
                } else {
                    console.log(`Não há infecção de ${color} para tratar em ${this.location.name}.`);
                    return false;
                }
            }
        } else if (color !== null) {
            console.log(`Cor de doença inválida: ${color}.`);
            return false;
        } else {
            console.log("Por favor especifique uma cor para tratar.");
            return false;
        }
    }

    buildResearchStation() {
        if (!this.location.hasResearchStation) {
            console.log(`${this.name} construiu um centro de pesquisa em ${this.location.name}.`);
            this.location.hasResearchStation = true;
            this.actionsLeft--;
            return true;
        } else {
            console.log(`Já existe um centro de pesquisa em ${this.location.name}.`);
            return false;
        }
    }

    resetActions() {
        this.actionsLeft = 4;
    }

    addCard(card) {
        this.hand.push(card);
        console.log(`${this.name} recebeu a carta ${card}.`);
    }

    removeCard(card) {
        const index = this.hand.indexOf(card);
        if (index > -1) {
            this.hand.splice(index, 1);
            console.log(`${this.name} descartou a carta ${card}.`);
            return true;
        } else {
            console.log(`${this.name} não possui a carta ${card}.`);
            return false;
        }
    }

    toString() {
        return `Jogador: ${this.name}, Localização: ${this.location.name}, Ações: ${this.actionsLeft}`;
    }
}

class Board {
    constructor() {
        this.cities = this.loadCities();
        this.infectionRate = 2;
        this.outbreakCount = 0;
        this.curedDiseases = {"vermelho": false, "azul": false, "amarelo": false, "preto": false};
        this.researchStations = new Set();
        this.infectionDeck = this.createInfectionDeck();
        this.infectionDiscard = [];
        this.playerDeck = this.createPlayerDeck();
        this.playerDiscard = [];
        this.players = [];
        this.initialInfection();

        for (const cityName in this.cities) {
            this.cities[cityName].board = this; // Define a referência ao tabuleiro para cada cidade
        }
    }

    loadCities() {
    const citiesData = {
        // América do Norte
        "San Francisco":   { color: "azul", connections: ["Chicago", "Los Angeles", "Tóquio", "Manila"], position: { x: 88, y: 188 } },
        "Chicago":         { color: "azul", connections: ["San Francisco", "Atlanta", "Montreal", "México", "Los Angeles"], position: { x: 150, y: 165 } },
        "Atlanta":         { color: "azul", connections: ["Chicago", "Washington", "Miami"], position: { x: 168, y: 205 } },
        "Montreal":        { color: "azul", connections: ["Chicago", "Washington", "Nova York"], position: { x: 205, y: 157 } },
        "Nova York":       { color: "azul", connections: ["Montreal", "Washington", "Londres", "Madrid"], position: {x: 250, y: 161 } },
        "Washington":      { color: "azul", connections: ["Atlanta", "Montreal", "Nova York", "Miami"], position: { x: 235, y: 200 } },
        "Los Angeles":     { color: "amarelo", connections: ["San Francisco", "Chicago", "Cidade do México", "Sydney"], position: { x: 110, y: 237 } },
        "Cidade do México":{ color: "amarelo", connections: ["Los Angeles", "Chicago", "Miami", "Bogotá"], position: { x: 150, y: 255 } },
        "Miami":           { color: "amarelo", connections: ["Atlanta", "Washington", "Cidade do México", "Bogotá"], position: { x: 210, y: 245 } },

        // América do Sul
        "Bogotá":          { color: "amarelo", connections: ["Cidade do México", "Miami", "Lima", "São Paulo", "Buenos Aires"], position: { x: 201, y: 290 } },
        "Lima":            { color: "amarelo", connections: ["Bogotá", "Santiago"], position: { x: 182, y: 350 } },
        "Santiago":        { color: "amarelo", connections: ["Lima"], position: { x: 190, y: 415} },
        "São Paulo":       { color: "amarelo", connections: ["Bogotá", "Buenos Aires", "Lagos", "Madrid"], position: {x: 270, y: 360  } },
        "Buenos Aires":    { color: "amarelo", connections: ["Bogotá", "São Paulo"], position: { x: 240, y: 395  } },

        // Europa
        "Londres":         { color: "azul", connections: ["Nova York", "Madrid", "Paris", "Essen"], position: { x: 335, y: 140 } },
        "Madrid":          { color: "azul", connections: ["Nova York", "Londres", "Paris", "São Paulo", "Argel"], position: { x: 323, y: 190 } },
        "Paris":           { color: "azul", connections: ["Londres", "Essen", "Milão", "Argel", "Madrid"], position: { x: 373, y: 161 } },
        "Essen":           { color: "azul", connections: ["Londres", "Paris", "Milão", "São Petersburgo"], position: { x: 387, y: 127 } },
        "Milão":           { color: "azul", connections: ["Essen", "Paris", "Istambul"], position: { x: 416, y: 152 } },
        "São Petersburgo": { color: "azul", connections: ["Essen", "Istambul", "Moscou"], position: { x: 440, y: 113 } },

        // África
        "Argel":           { color: "preto", connections: ["Madrid", "Paris", "Istambul", "Cairo", "Lagos"], position: { x: 382, y: 217 } },
        "Cairo":           { color: "preto", connections: ["Argel", "Istambul", "Bagdá", "Cartum", "Riad"], position: { x: 425, y: 233 } },
        "Lagos":           { color: "amarelo", connections: ["São Paulo", "Argel", "Cartum", "Kinshasa"], position: { x: 365, y: 278 } },
        "Cartum":          { color: "amarelo", connections: ["Lagos", "Cairo", "Kinshasa", "Joanesburgo"], position: { x: 430, y: 270 } },
        "Kinshasa":        { color: "amarelo", connections: ["Lagos", "Cartum", "Joanesburgo"], position: { x: 397, y: 320 } },
        "Joanesburgo":     { color: "amarelo", connections: ["Kinshasa", "Cartum"], position: { x: 420, y: 377 } },

        // Oriente Médio e Europa Oriental
        "Istambul":        { color: "preto", connections: ["Milão", "São Petersburgo", "Moscou", "Bagdá", "Cairo", "Argel"], position: { x: 433, y: 188 } },
        "Moscou":          { color: "preto", connections: ["São Petersburgo", "Istambul", "Teerã"], position: { x: 465, y: 148 } },
        "Bagdá":           { color: "preto", connections: ["Cairo", "Istambul", "Teerã", "Riad", "Karachi"], position: { x: 468, y: 208 } },
        "Riad":            { color: "preto", connections: ["Bagdá", "Cairo", "Karachi"], position: { x: 475, y: 255 } },
        "Teerã":           { color: "preto", connections: ["Moscou", "Bagdá", "Karachi", "Delhi"], position: { x: 500, y: 175 } },
        "Karachi":         { color: "preto", connections: ["Bagdá", "Teerã", "Delhi", "Mumbai", "Riad"], position: { x: 510, y: 225 } },

        // Índia e Sudeste Asiático
        "Delhi":           { color: "preto", connections: ["Teerã", "Karachi", "Mumbai", "Chennai", "Kolkata"], position: { x: 535, y: 200 } },
        "Mumbai":          { color: "preto", connections: ["Karachi", "Delhi", "Chennai"], position: { x: 517, y: 263 } },
        "Chennai":         { color: "preto", connections: ["Mumbai", "Delhi", "Kolkata", "Bangkok", "Jacarta"], position: { x: 550, y: 285 } },
        "Kolkata":         { color: "preto", connections: ["Delhi", "Chennai", "Bangkok", "Hong Kong"], position: { x: 568, y: 220 } },

        // Ásia e Oceania
        "Bangkok":         { color: "vermelho", connections: ["Kolkata", "Chennai", "Hong Kong", "Jacarta", "Ho Chi Minh"], position: { x: 583, y: 265 } },
        "Jacarta":         { color: "vermelho", connections: ["Chennai", "Bangkok", "Ho Chi Minh", "Sydney"], position: { x: 578, y: 327 } },
        "Ho Chi Minh":     { color: "vermelho", connections: ["Bangkok", "Jacarta", "Hong Kong", "Manila"], position: { x: 615, y: 300 } },
        "Hong Kong":       { color: "vermelho", connections: ["Kolkata", "Bangkok", "Ho Chi Minh", "Xangai", "Manila", "Taipei"], position: { x: 610, y: 240 } },
        "Manila":          { color: "vermelho", connections: ["Hong Kong", "Ho Chi Minh", "Taipei", "Sydney", "San Francisco"], position: { x: 665, y: 290 } },
        "Taipei":          { color: "vermelho", connections: ["Hong Kong", "Manila", "Osaka", "Xangai"], position: { x: 655, y: 230 } },
        "Xangai":          { color: "vermelho", connections: ["Beijing", "Hong Kong", "Taipei", "Seul", "Tóquio"], position: { x: 600, y: 198 } },
        "Beijing":         { color: "vermelho", connections: ["Xangai", "Seul"], position: { x: 595, y: 160 } },
        "Seul":            { color: "vermelho", connections: ["Beijing", "Xangai", "Tóquio"], position: { x: 640, y: 160 } },
        "Tóquio":          { color: "vermelho", connections: ["Seul", "Xangai", "Osaka", "San Francisco"], position: {x: 688, y: 175 } },
        "Osaka":           { color: "vermelho", connections: ["Taipei", "Tóquio"], position: { x: 695, y: 218  } },
        "Sydney":          { color: "vermelho", connections: ["Jacarta", "Manila", "Los Angeles"], position: { x: 690, y: 393 } },
    };

    const cities = {};
    for (const name in citiesData) {
        const data = citiesData[name];
        cities[name] = new City(name, data.color);
        cities[name].position = data.position;
    }

    for (const name in citiesData) {
        for (const connectionName of citiesData[name].connections) {
            if (cities[connectionName]) {
                cities[name].addConnection(cities[connectionName]);
            }
        }
    }

    return cities;
}

    getCity(cityName) {
        return this.cities[cityName];
    }

    createInfectionDeck() {
        return Object.keys(this.cities);
    }

    createPlayerDeck() {
        const deck = [];
        const cityCards = Object.keys(this.cities);
        this.shuffleArray(cityCards);
        deck.push(...cityCards);
        this.shuffleArray(deck);
        return deck;
    }

    initialInfection() {
        const cityNames = Object.keys(this.cities);
        const infectionCities = this.sampleArray(cityNames, Math.min(9, cityNames.length));

        for (let i = 0; i < infectionCities.length; i++) {
            const cityName = infectionCities[i];
            const city = this.getCity(cityName);
            for (let j = 0; j < (3 - Math.floor(i / 3)); j++) {
                city.infect(city.color);
            }
            this.infectionDiscard.push(cityName);
        }
        this.shuffleArray(this.infectionDeck);
    }

    infectCities(numCards) {
        for (let i = 0; i < numCards; i++) {
            if (this.infectionDeck.length === 0) {
                this.infectionDeck = [...this.infectionDiscard];
                this.infectionDiscard = [];
                this.shuffleArray(this.infectionDeck);
            }
            if (this.infectionDeck.length > 0) {
                const card = this.infectionDeck.shift();
                this.infectionDiscard.push(card);
                const city = this.getCity(card);
                if (city.infect(city.color)) {
                    this.outbreakCount++;
                    console.log(`SURTO EM ${city.name}!`);
                }
            }
        }
    }

    checkGameOver() {
        if (this.outbreakCount >= 8) {
            console.log("Você perdeu! Muitos surtos ocorreram.");
            return true;
        }
        return false;
    }

    checkWinPrototype() {
        for (const cityName in this.cities) {
            const city = this.cities[cityName];
            for (const color in city.infectionLevels) {
                if (city.infectionLevels[color] > 0) {
                    return false;
                }
            }
        }
        return true;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    sampleArray(array, size) {
        const shuffled = [...array];
        this.shuffleArray(shuffled);
        return shuffled.slice(0, size);
    }
}

export { City, Player, Board };
