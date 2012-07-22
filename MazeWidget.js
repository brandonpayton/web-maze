define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-construct",
    "dijit/_WidgetBase",
    "./Maze",
    "./Solver"
], function(declare, lang, domConstruct, _WidgetBase, Maze, Solver) {
    return declare([ _WidgetBase ], {
        pixelsPerCell: 10,
        _maze: null,
        _wallCanvas: null,
        _solutionCanvas: null,
        constructor: function(args) {
            this._maze = new Maze({ numRows: args.numRows, numColumns: args.numColumns });
        }, 
        buildRendering: function(args) {
            var maze = this._maze,
                container = domConstruct.create("div", { style: "position: relative" }),
                pixelsPerCell = this.pixelsPerCell;

            this.domNode = container;
            this._wallCanvas = domConstruct.create("canvas", {
                width: maze.numColumns * this.pixelsPerCell,
                height: maze.numRows * this.pixelsPerCell
            });
            this._solutionCanvas = domConstruct.create("canvas", {
                width: this._wallCanvas.width,
                height: this._wallCanvas.height,
                style: "position: absolute; top: 0; left: 0; z-index: -1"
            });
            container.appendChild(this._solutionCanvas);
            container.appendChild(this._wallCanvas);
            
            this._drawStructure();
        },
        solve: function(args) {
            args = lang.delegate({
                stepInterval: 1
            }, args);
            
            var maze = this._maze;

            // Solution Trail 2d Context
            var sc = this._solutionCanvas.getContext('2d');
            var pixelsPerCell = this.pixelsPerCell;
            function drawSquare(location, color) {
                var x = location.column * pixelsPerCell,
                    y = location.row * pixelsPerCell;
                sc.fillStyle = color;
                sc.fillRect(x, y, pixelsPerCell, pixelsPerCell);
            }

            var solver = new Solver(maze);
            var intervalId = null;
            solver.on("visited", function(location) { drawSquare(location, "lightblue"); });
            solver.on("deadEnd", function(location) { drawSquare(location, "orange"); });
            solver.on("solved", function() { clearInterval(intervalId); });

            intervalId = setInterval(function() {
                try {
                    solver.step();
                } catch (e) {
                    clearInterval(intervalId);
                    throw e;
                }
            }, args.stepInterval);
        },
        _drawStructure: function() {
            var maze = this._maze,
                pixelsPerCell = this.pixelsPerCell,
                wallCanvas = this._wallCanvas;

            // Wall 2d Context
            var wc = wallCanvas.getContext('2d');

            // Clean slate
            wc.clearRect(0, 0, wallCanvas.width, wallCanvas.height);

            wc.strokeStyle = "black";
            wc.lineWidth = 1;
            wc.beginPath();

            // Draw left and top boundaries
            wc.moveTo(0, wallCanvas.height);
            wc.lineTo(0, 0);
            wc.lineTo(wallCanvas.width, 0);

            // Draw walls, including bottom and right boundaries.
            var row, column, x, y;
            for(row = 0; row < maze.numRows; row++) {
                for(column = 0; column < maze.numColumns; column++) {
                    x = column * pixelsPerCell;
                    y = row * pixelsPerCell;
                    if(!maze.canGoDown(row, column)) {
                        wc.moveTo(x, y + pixelsPerCell);
                        wc.lineTo(x + pixelsPerCell, y + pixelsPerCell);
                    }
                    if(!maze.canGoRight(row, column)) {
                        wc.moveTo(x + pixelsPerCell, y);
                        wc.lineTo(x + pixelsPerCell, y + pixelsPerCell);
                    }
                }
            }
            wc.stroke();
            wc.closePath();
        }
    });
});
