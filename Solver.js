define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Evented"
], function(declare, lang, Evented) {
    return declare([ Evented ], {
        _maze: null,
        _cellStack: [ ],
        _visitedCells: null,
        constructor: function(maze) {
            this._maze = maze;
            this._cellStack.push(maze.startLocation);

            this._visitedCells = [ ];
            for(var i = 0; i < maze.numRows; i++) { this._visitedCells[i] = []; }
        },
        step: function(maze) {
            var maze = this._maze;
            var cellStack = this._cellStack;

            var c = cellStack[cellStack.length - 1];
            this._visitedCells[c.row][c.column] = true;
            this.emit("visited", c);

            if(c.row === maze.endLocation.row && c.column === maze.endLocation.column) {
                this.emit("solved");
            } else {
                var next = this._getNextCell(c.row, c.column);
                if(next === null) {
                    this.emit("deadEnd", cellStack.pop());
                } else {
                    cellStack.push(next);
                }
            }
        },
        _getNextCell: function(row, column) {
            var accessibleNeighbors = this._maze.getAccessibleNeighbors(row, column);
            var options = accessibleNeighbors.filter(lang.hitch(this, function(neighbor) {
                return !this._visitedCells[neighbor.row][neighbor.column]
            }));
                               
            return options.length === 0
                ? null
                : options[Math.floor(Math.random() * options.length)]
        }

    });
});
