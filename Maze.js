/* Copyright (c) 2012, Brandon Payton
 * All rights reserved.
 *
 * This work is licensed under the BSD 3-Clause License:
 * http://opensource.org/licenses/BSD-3-Clause
 * */
define([
    "dojo/_base/declare",
    "dojo/_base/array"
], function(declare, arrayUtil) {
    return declare(null, {
        startLocation: { row: 0, column: 0 },
        endLocation: null,
        constructor: function(args) {
            var numRows = this.numRows = args.numRows;
            var numColumns = this.numColumns = args.numColumns;

            this.endLocation = { row: numRows - 1, column: numColumns - 1 };

            var cells = this._cells = [];
            var touchedCells = [];
            
            var i, j;
            for(i = 0; i < numRows; i++) {
                cells[i] = [];
                touchedCells[i] = [];
                for(j = 0; j < numColumns; j++) {
                    cells[i][j] = { rightWall: true, bottomWall: true };
                }
            }
            
            var self = this
            function moveToNextUnvisitedCell(row, column) {
                var neighbors = self.getNeighbors(row, column);
                var options = arrayUtil.filter(neighbors, function(neighbor) {
                    return !touchedCells[neighbor.row][neighbor.column];
                });

                if(options.length === 0) {
                    return null;
                } else {
                    var chosenCell = options[Math.floor(Math.random() * options.length)];
                    touchedCells[chosenCell.row][chosenCell.column] = true;

                    // Remove wall
                    if(chosenCell.row < row) {
                        cells[chosenCell.row][chosenCell.column].bottomWall = false;
                    } else if(chosenCell.row > row) {
                        cells[row][column].bottomWall = false;
                    } else if(chosenCell.column < column) {
                        cells[chosenCell.row][chosenCell.column].rightWall = false;
                    } else if(chosenCell.column > column) {
                        cells[row][column].rightWall = false;
                    } else {
                        throw new Error("Error moving to next cell during initialization.");
                    }

                    return chosenCell;
                }
            }

            touchedCells[0][0] = true;
            var stack = [{ row: 0, column: 0 }];
            while(stack.length > 0) {
                var top = stack[stack.length - 1];
                var next = moveToNextUnvisitedCell(top.row, top.column);

                if(next) stack.push(next);
                else stack.pop();
            }
        },
        canGoUp: function(row, column) {
            return row > 0 && !this._cells[row - 1][column].bottomWall;
        },
        canGoDown: function(row, column) {
            return row < this._cells.length && !this._cells[row][column].bottomWall;
        },
        canGoLeft: function(row, column) {
            return column > 0 && !this._cells[row][column - 1].rightWall;
        },
        canGoRight: function(row, column) {
            return column < this._cells[row].length && !this._cells[row][column].rightWall;
        },

        getNeighbors: function(row, column) {
            var neighbors = [ ];

            // Top
            if(row > 0) neighbors.push({ row: row - 1, column: column });

            // Left
            if(column > 0) neighbors.push({ row: row, column: column - 1 });

            // Bottom
            var lastRow = this._cells.length - 1;
            if(row < lastRow) neighbors.push({ row: row + 1, column: column });

            // Right
            var lastColumn = this._cells[row].length - 1;
            if(column < lastColumn) neighbors.push({ row: row, column: column + 1 });

            return neighbors;
        },

        getAccessibleNeighbors: function(row, column) {
            var neighbors = [];
            if(this.canGoUp(row, column)) {
                neighbors.push({ row: row - 1, column: column });
            }
            if(this.canGoLeft(row, column)) {
                neighbors.push({ row: row, column: column - 1 });
            }
            if(this.canGoDown(row, column)) {
                neighbors.push({ row: row + 1, column: column });
            }
            if(this.canGoRight(row, column)) {
                neighbors.push({ row: row, column: column + 1 });
            }
            return neighbors;
        }
    });
});
