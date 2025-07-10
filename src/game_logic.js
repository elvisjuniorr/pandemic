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
            "Atlanta": {"color": "azul", "connections": ["Chicago", "Nova York"]},
            "Chicago": {"color": "azul", "connections": ["Atlanta", "Londres"]},
            "Nova York": {"color": "azul", "connections": ["Atlanta", "Londres"]},
            "Londres": {"color": "azul", "connections": ["Chicago", "Nova York", "Miami"]},
            "Miami": {"color": "amarelo", "connections": ["Londres", "Cidade do México"]},
            "Cidade do México": {"color": "amarelo", "connections": ["Miami", "Los Angeles", "Cairo"]},
            "Los Angeles": {"color": "amarelo", "connections": ["Cidade do México", "São Paulo"]},
            "São Paulo": {"color": "amarelo", "connections": ["Los Angeles", "Bagdá"]},
            "Cairo": {"color": "preto", "connections": ["Cidade do México", "Istambul"]},
            "Istambul": {"color": "preto", "connections": ["Cairo", "Moscou", "Riade"]},
            "Bagdá": {"color": "preto", "connections": ["São Paulo", "Riade", "Pequim"]},
            "Riade": {"color": "preto", "connections": ["Istambul", "Bagdá", "Seul"]},
            "Pequim": {"color": "vermelho", "connections": ["Bagdá", "Seul"]},
            "Seul": {"color": "vermelho", "connections": ["Riade", "Pequim", "Xangai"]},
            "Tóquio": {"color": "vermelho", "connections": ["Seul", "Xangai"]},
            "Xangai": {"color": "vermelho", "connections": ["Tóquio"]}
        };

        const cities = {};
        for (const name in citiesData) {
            cities[name] = new City(name, citiesData[name].color);
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
