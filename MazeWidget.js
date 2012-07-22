define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-construct",
    "dijit/_WidgetBase",
    "Maze",
    "Solver"
], function(declare, lang, domConstruct, _WidgetBase, Maze, Solver) {
    return declare([ _WidgetBase ], {
        cellPixels: 10,
        _maze: null,
        _wallCanvas: null,
        _solutionCanvas: null,
        constructor: function(args) {
            this._maze = new Maze({ numRows: args.numRows, numColumns: args.numColumns });
        }, 
        buildRendering: function(args) {
            var maze = this._maze,
                container = domConstruct.create("div", { style: "position: relative" }),
                cellPixels = this.cellPixels;

            this.domNode = container;
            this._wallCanvas = domConstruct.create("canvas", {
                width: maze.numColumns * this.cellPixels,
                height: maze.numRows * this.cellPixels
            });
            this._solutionCanvas = domConstruct.create("canvas", {
                width: this._wallCanvas.width,
                height: this._wallCanvas.height,
                style: "position: absolute; top: 0; left: 0; z-index: -1"
            });
            container.appendChild(this._solutionCanvas);
            container.appendChild(this._wallCanvas);
            
            this._drawWalls();
        },
        solve: function(args) {
            args = lang.delegate({
                stepInterval: 1
            }, args);
            
            var maze = this._maze;

            // Solution Trail 2d Context
            var sc = this._solutionCanvas.getContext('2d');
            var cellPixels = this.cellPixels;
            function drawSquare(location, color) {
                var x = location.column * cellPixels,
                    y = location.row * cellPixels;
                sc.fillStyle = color;
                sc.fillRect(x, y, cellPixels, cellPixels);
            }

            var solver = new Solver(maze);
            var intervalId = null;
            solver.on("visited", function(location) { drawSquare(location, "lightgreen"); });
            solver.on("revisited", function(location) { drawSquare(location, "lightblue"); });
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
        _drawWalls: function() {
            var maze = this._maze;
            var cellPixels = this.cellPixels;

            // Wall 2d Context
            var wc = this._wallCanvas.getContext('2d');

            wc.lineWidth = 1;
            wc.fillStyle = "blue";
            wc.strokeRect(0, 0, maze.numColumns * cellPixels, maze.numRows * cellPixels);
            wc.beginPath();
            var row, column, x, y;
            for(row = 0; row < maze.numRows; row++) {
                for(column = 0; column < maze.numColumns; column++) {
                    x = column * cellPixels;
                    y = row * cellPixels;
                    if(!maze.canGoDown(row, column)) {
                        wc.moveTo(x, y + cellPixels);
                        wc.lineTo(x + cellPixels, y + cellPixels);
                    }
                    if(!maze.canGoRight(row, column)) {
                        wc.moveTo(x + cellPixels, y);
                        wc.lineTo(x + cellPixels, y + cellPixels);
                    }
                }
            }
            wc.stroke();
            wc.closePath();
        }
    });
});
