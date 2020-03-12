class Board {

    constructor(ships) {
        this._ships = ships;
    }

    get ships() {
        return this._ships;
    }

    set ships(ships) {
        this._ships = ships;
    }

    addShip(ship) {
        this._ships.push(ship);
    }
}