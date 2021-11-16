/* Tile types and colors. */
var TILE_AIR = "a",
    TILE_LAND  = "l",
    TILE_WATER  = "w",
    TILE_STATIC = "s",
    /* This array will be used in screen intialization */
    TILE_TYPES = [ TILE_AIR, TILE_LAND, TILE_WATER, TILE_STATIC ],
    /* This object will be used to decide which color to use when we're drawing each tile. */
    TILE_COLORS = {
        "a": "#ffffff",
        "l": "#2affa2",
        "w": "#add8e6",
        "s": "#000000",
        "0": "#000000",
        "1": "#f7941d",
        "2": "#00ffff",
        "3": "#fff200",
        "4": "#00ff00",
        "5": "#ec008c",
        "6": "#959595",
        "7": "#92278f",
        "8": "#0000ff",
        "9": "#ff00ff",
        "-": "#754c24",
        "=": "#ed1c24"
    };

/**
 * Implements a physics based drawing game.
 * @class
 * @namespace
 * @this {Sand}
 */
function Sand() {
    this.screenCanvas = document.getElementById( "screen" );
    this.canvasContext = this.screenCanvas.getContext( "2d" );

    this.tileSize = 10;

    this.horizontalTileCount = this.screenCanvas.width / this.tileSize;
    this.verticalTileCount = this.screenCanvas.height / this.tileSize;

    this.tiles = [];

    this.isDrawing = false; /* Flag: To check if we're currently drawing with the mouse. */

    this.currentTileType = "s"; /* Current drawing tile type. Black static tile by default. */

    this.initialize();

    this.setupEvents();

    var x = 0, L = this.horizontalTileCount,
        y = 0, M = this.verticalTileCount,
        tiles = this.tiles,
        tilesToRedraw = [];

    for( ; x < L; x++ ) {
        for( y = 0; y < M; y++ ) {
            tilesToRedraw.push(
                { x: x, y: y, value: tiles[ x ][ y ] }
            );
        }
    }

    this.drawScreen( tilesToRedraw );
}

/**
 * Initializes the screen with randomized tiles.
 * @name initialize
 * @function
 * @memberof Sand
 * @returns {void}
 */
Sand.prototype.initialize = function() {
    var i = 0, L = this.horizontalTileCount,
        j = 0, M = this.verticalTileCount,
        column = [];
    for( ; i < L; ++i ) {
        for( j = 0; j < M; ++j )
            /* As you can see here, we used TILE_TYPES to get random tile natures. */
            column.push( TILE_TYPES[ Math.floor( Math.random() * 4 ) ] );

        this.tiles.push( column );

        column = [];
    }
};

/**
 * Setup keyboard and mouse events*
 * - Keyboard: To change tile type and to reset the screen
 * - Mouse: To draw tiles.
 * @name setupEvents
 * @function
 * @memberof Sand
 * @returns {void}
 */
Sand.prototype.setupEvents = function() {
    var screenCanvas = this.screenCanvas;

    screenCanvas.addEventListener( "mousedown", this.startDrawing.bind( this ) );  //The state of clicking mouse.

    document.addEventListener( "mouseup", this.stopDrawing.bind( this ) );  //The state of mousebutton1 is up.
    document.addEventListener( "mousemove", this.processDrawing.bind( this ) );
    document.addEventListener( "keypress", this.updateCurrentTileType.bind( this ) );
    document.addEventListener( "keyup", this.clearScreen.bind( this ) );
};

/**
 * Enables drawing when the mouse moves
 * This gets executed when we hold the left mouse button down.
 * @name startDrawing
 * @function
 * @memberof Sand
 * @param {Object} event DOM event object.
 * @returns {void}
 */
Sand.prototype.startDrawing = function( event ) {
    this.isDrawing = true;

    this.processDrawing( event );
};

/**
 * Disable drawing when the mouse moves
 * This gets executed when we release the left mouse button.
 * @name stopDrawing
 * @function
 * @memberof Sand
 * @param {Object} event DOM event object.
 * @returns {void}
 */
Sand.prototype.stopDrawing = function( event ) {
    this.isDrawing = false;
};

/**
 * Changes the tile type that we're currently drawing
 * This gets executed when we press the relevant keyboard keys.
 * @name updateCurrentTileType
 * @function
 * @memberof Sand
 * @param {Object} event DOM event object.
 * @returns {void}
 */
Sand.prototype.updateCurrentTileType = function( event ) {
    if( !TILE_COLORS[ event.key ] )
        return;

    this.currentTileType = event.key;
};

/**
 * Draws the tile at the current mouse position
 * This gets executed when we move the mouse and when drawing mode is on.
 * @name processDrawing
 * @function
 * @memberof Sand
 * @param {Object} event DOM event object.
 * @returns {void}
 */
Sand.prototype.processDrawing = function( event ) {
    if( !this.isDrawing )
        return;

    var targetTile = {
            x: Math.floor( ( event.pageX - this.screenCanvas.offsetLeft ) / this.tileSize ),
            y: Math.floor( ( event.pageY - this.screenCanvas.offsetTop ) / this.tileSize )
        };

    /**
     * If we're currently drawing and the mouse is on top of a tile, we redraw it.
     * We basically check if the mouse is inside the screen boundaries.
     */
    if( targetTile.x >= 0 && targetTile.x < this.horizontalTileCount && targetTile.y >= 0 && targetTile.y < this.verticalTileCount ) {
        this.drawScreen( [{
            x: targetTile.x,
            y: targetTile.y,
            value: this.currentTileType
        }]);
    }   
};

/**
 * Replaces all tiles with air tiles.
 * This gets executed when we press the Escape keY>
 * @name clearScreen
 * @function
 * @memberof Sand
 * @param {Object} event DOM event object.
 * @returns {void}
 */
Sand.prototype.clearScreen = function( event ) {
    if( event.keyCode !== 27 )
        return;

    var x = 0, L = this.horizontalTileCount,
        y = 0, M = this.verticalTileCount,
        tiles = this.tiles,
        tilesToRedraw = [];

    for( ; x < L; x++ ) {
        for( y = 0; y < M; y++ ) {
            this.tiles[ x ][ y ] = TILE_AIR;

            tilesToRedraw.push(
                { x: x, y: y, value: TILE_AIR }
            );
        }
    }

    this.drawScreen( tilesToRedraw );
};

/**
 * Redraws the a set of tiles
 * This is an optimization to avoid redrawing the entire screen
 * Instead we only draw the tile that have changes.
 * @name drawScreen
 * @function
 * @memberof Sand
 * @param {Array} tilesToRedraw A list of tiles (x, y and new value ) to redraw.
 * @returns {void}
 */
Sand.prototype.drawScreen = function( tilesToRedraw ) {
    var i = 0, L = tilesToRedraw.length,
        tiles = this.tiles;

    for( ; i < L; ++i ) {
        var tile = tilesToRedraw[ i ];

        tiles[ tile.x ][ tile.y ] = tile.value;

        this.canvasContext.fillStyle = TILE_COLORS[ tile.value ];

        this.canvasContext.fillRect( tile.x * this.tileSize, tile.y * this.tileSize, this.tileSize, this.tileSize ); 
    }
};

/**
 * Applie gravity effect on each type of tile.
 * This affects tiles of nature: water, air and land.
 * @name applyPhysics
 * @function
 * @memberof Sand
 * @returns {void}
 */
Sand.prototype.applyPhysics = function() {
    var x = 0, L = this.horizontalTileCount,
        y = 0, M = this.verticalTileCount,
        tiles = this.tiles,
        tile, tileBelow, tileBefore, tileBelowBefore,
        tilesToRedraw = [],
        changeOccurred = false;

    for( ; x < L; x++ ) {
        for( y = 0; y < M; y++ ) {
            tile = tiles[ x ][ y ];
            tileBelow = tiles[ x ][ y + 1 ];
            changeOccurred = false;

            if( y < M - 1 ) {
                /* Land tiles go down if there is water or air bellow them */
                if( tile === TILE_LAND && ( tileBelow === TILE_AIR || tileBelow === TILE_WATER ) ) {
                    changeOccurred = true;
                } else if( tile === TILE_WATER && tileBelow === TILE_AIR ) { /* Water tiles go down if there is air bellow them. */
                    changeOccurred = true;
                }

                /* Mark these tiles as changed, to avoid checking them again in the loop. */
                if( changeOccurred ) {
                    tilesToRedraw.push(
                        { x: x, y: y, value: tileBelow },
                        { x: x, y: y + 1, value: tile }
                    );

                    tiles[ x ][ y ] = -1;
                    tiles[ x ][ y + 1 ] = -1;

                    changeOccurred = false;
                }

                /* Do a coin flip and decide which direction to move water tiles, to simulate water behaviour. */
                if( x > 0 ) {
                    tileBefore = tiles[ x - 1 ][ y ];
                    tileBelowBefore = tiles[ x - 1 ][ y + 1 ];

                    var cointFlip = Math.floor( Math.random() * 2 );

                    if( cointFlip && tile === TILE_WATER && tileBefore == TILE_AIR && tileBelow !== TILE_AIR ) {
                        changeOccurred = true;
                    } else if( !cointFlip && tile === TILE_AIR && tileBefore === TILE_WATER && tileBelowBefore !== TILE_AIR ) {
                        changeOccurred = true;                        
                    }

                    /* Mark these tiles as changed, to avoid checking them again in the loop. */
                    if( changeOccurred ) {
                        tilesToRedraw.push(
                            { x: x, y: y, value: tileBefore },
                            { x: x - 1, y: y, value: tile }
                        );

                        tiles[ x ][ y ] = -1;
                        tiles[ x - 1 ][ y ] = -1;
                    }
                }
            }
        }
    }

    return tilesToRedraw;
};

/**
 * Start the rendering game loop.
 * This handles all the game physics
 * @name render
 * @function
 * @memberof Sand
 * @returns {void}
 */
Sand.prototype.render = function() {
    var tilesToRedraw = this.applyPhysics();

    /* Redraw the changed tiles. */
    this.drawScreen( tilesToRedraw );

    /* Execute the render function at next browser frame redraw. */
    requestAnimationFrame( this.render.bind( this ) );
};

/* Start the game! */
var game = new Sand();
game.render();