let rows = 10;
let columns = 10;
let hostname = "100.25.220.179";
let board = `{
    "gameId": null,
    "size": [
        10,
        10
    ],
    "player": {
        "playerIdString": null,
        "score": 0,
        "friendlyBoard": {
            "ships": [
                {
                    "type": "destroyer",
                    "position": {
                        "x": 3,
                        "y": 1
                    },
                    "orientation": "h",
                    "hits": null,
                    "size": 3
                },
                {
                    "type": "carrier",
                    "position": {
                        "x": 7,
                        "y": 2
                    },
                    "orientation": "h",
                    "hits": null,
                    "size": 5
                },
                {
                    "type": "battleship",
                    "position": {
                        "x": 1,
                        "y": 5
                    },
                    "orientation": "v",
                    "hits": null,
                    "size": 4
                },
                {
                    "type": "submarine",
                    "position": {
                        "x": 5,
                        "y": 7
                    },
                    "orientation": "h",
                    "hits": null,
                    "size": 3
                },
                {
                    "type": "patrolboat",
                    "position": {
                        "x": 7,
                        "y": 9
                    },
                    "orientation": "v",
                    "hits": null,
                    "size": 2
                }
            ],
            "misses": []
        },
        "enemyBoard": null
    }
}`;

createGame().then(gameBoard => {
    board = gameBoard;
    createFriendlyBoard();
    createEnemyBoard();
    addOnClickEvent();

    if (gameBoard !== null) {
        updateFriendlyBoard(gameBoard.player.friendlyBoard.ships);
        updateEnemyBoard(gameBoard.player.enemyBoard.ships);
    
        updateMisses(gameBoard.player.friendlyBoard.misses, gameBoard.player.enemyBoard.misses);
    }
})

function createFriendlyBoard() {
    for(var i = 1; i <= rows; i++)
    {
        cell = document.getElementById("friendlyBoard");
        let stringToInsert = '<div class="board-row">';

        for (var j = 1; j <= columns; j++)
        {    
            stringToInsert += `<div class="board-column"><div class="cell" id="friendly.${i}.${j}"></div></div>`;
        }
        stringToInsert += '</div>'  ;
        cell.insertAdjacentHTML('beforeend', stringToInsert);  
    }
}

function createEnemyBoard() {
    for(var i = 1; i <= rows; i++)
    {
        cell = document.getElementById("enemyBoard");
        let stringToInsert = '<div class="board-row">';

        for (var j = 1; j <= columns; j++)
        {    
            stringToInsert += `<div class="board-column"><div class="cell" id="enemy.${i}.${j}"></div></div>`;
        }
        stringToInsert += '</div>'  ;
        cell.insertAdjacentHTML('beforeend', stringToInsert);  
    }
}

function addOnClickEvent() {
    for (var i = 1; i <= rows; i++) {
        for(var j = 1; j <= columns; j++) {
            cell = document.getElementById(`enemy.${i}.${j}`);

            cell.addEventListener("click", makeMoveClosure(i,j));
        }
    }
}

function makeMoveClosure(x, y) {
    return async function makeMove() {
        console.log(x + ',' + y);
        const url = `http://${hostname}:8080/BattleShip/rest/move/${board.gameId}/${board.player.playerIdString}`
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 'x': x, 'y': y})
        });
        
        getGame(board.gameId).then( (gameBoard) => {
            console.log(gameBoard)
            updateFriendlyBoard(gameBoard.player.friendlyBoard.ships);
            updateEnemyBoard(gameBoard.player.enemyBoard.ships);
            updateMisses(gameBoard.player.friendlyBoard.misses, gameBoard.player.enemyBoard.misses);

            if (response.status === 400) {
                response.text().then(function(data){
                    console.log(data);
                    winnerElement = document.getElementById("winner");
                    if (data.split(":")[1] === gameBoard.player.playerIdString) {
                        winnerElement.innerHTML = "Winner: PLAYER ONE - YOU";
                    } else {
                        winnerElement.innerHTML = "Winner: AI";
                    }
                });
            }
        })
    }
}

async function getGame(gameUid) {
    const url = `http://${hostname}:8080/BattleShip/rest/game/${gameUid}`
    let response = await fetch(url);
    let gameBoard = await response.json();
    return gameBoard;
}

function createGame() {
    return fetch(`http://${hostname}:8080/BattleShip/rest/game` , {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: board
    })
    .then((response) => {
        return response.json();
    })
    .then((gameBoard) => {
        return gameBoard;
    });
}

function updateFriendlyBoard(ships){
    console.log(ships);
    for (var i=0; i < ships.length; i++) {
        let x = ships[i].position.x;
        let y = ships[i].position.y;
        let orientation = ships[i].orientation;
        let size = ships[i].size;
        let hits = ships[i].hits;
        console.log(x, y)
        for(var j=0; j < size; j++){
            document.getElementById(`friendly.${x}.${y}`).className += ' ship';
            if (orientation === 'h') {
                y++;
            } else if (orientation === 'v') {
                x++;
            } else {
                throw "Invalid orientation of ship";
            }
        }
        
        
        if (hits === null) {
            console.log("null");
            continue;
        }
        console.log(hits);
        for (var j=0; j < hits.length; j++) {
            let x = hits[j].x;
            let y = hits[j].y;
            cell = document.getElementById(`friendly.${x}.${y}`).className+= ' shiphit';
        }
    }
}

function updateEnemyBoard(ships){
    for (var i=0; i < ships.length; i++) {
        let hits = ships[i].hits;            
        if (hits === null) {
            continue;
        }
        for (var j=0; j < hits.length; j++) {
            let x = hits[j].x;
            let y = hits[j].y;
            cell = document.getElementById(`enemy.${x}.${y}`).className+= ' shiphit';
        }
    }
}

function updateMisses(friendlyMisses, enemyMisses) {
    if (friendlyMisses != null) {
        for (var i=0; i < friendlyMisses.length; i++) {
            let x = friendlyMisses[i].x;
            let y = friendlyMisses[i].y;
            cell = document.getElementById(`enemy.${x}.${y}`).className+= ' miss';
        }
    }

    if (enemyMisses != null) {
        for (var i=0; i < enemyMisses.length; i++) {
            let x = enemyMisses[i].x;
            let y = enemyMisses[i].y;
            cell = document.getElementById(`friendly.${x}.${y}`).className+= ' miss';
        }
    }
}