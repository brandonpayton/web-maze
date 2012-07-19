define([
    "dojo/_base/declare"
], function(declare) {
    return declare(null, {

        canGoUp: function(row, column) {
            return row > 0 && !this._cells[row - 1][column].bottom
        }
        , canGoDown: function(row, column) {
            return row < this._cells.length && !this._cells[row][column].bottom
        }
        , canGoLeft: function(row, column) {
            return column > 0 && !this._cells[row][column - 1].right
        }
        , canGoRight: function(row, column) {
            return column < this._cells[row].length && !this._cells[row][column].right
        }
        , constructor: function(args) {
            var high = this.high = args.high
            var wide = this.wide = args.wide
            var cells = this._cells = []
            
            var i, j
            for(i = 0; i < high; i++) {
                cells[i] = []
                for(j = 0; j < wide; j++) {
                    cells[i][j] = { right: true, bottom: true }
                }
            }
            
            function getNextCell(row, column) {
                var options = [];
                // Top
                if(row > 0 && !cells[row - 1][column].touched) {
                    options.push({
                        visit: function() {
                            cells[row - 1][column].bottom = false
                            cells[row - 1][column].touched = true
                            return { row: row - 1, column: column }
                        }
                    })
                }
                // Bottom
                if(row < (cells.length - 1) && !cells[row + 1][column].touched) {
                    options.push({
                        visit: function() {
                            cells[row][column].bottom = false
                            cells[row + 1][column].touched = true
                            return { row: row + 1, column: column }
                        }
                    })
                }
                // Left
                if(column > 0 && !cells[row][column - 1].touched) {
                    options.push({
                        visit: function() {
                            cells[row][column - 1].right = false
                            cells[row][column - 1].touched = true
                            return { row: row, column: column - 1 }
                        }
                    });
                }
                // Right
                if(column < (cells[row].length - 1) && !cells[row][column + 1].touched) {
                    options.push({
                        visit: function() {
                            cells[row][column].right = false
                            cells[row][column + 1].touched = true
                            return { row: row, column: column + 1 }
                        }
                    });
                }
                
                return options.length === 0
                    ? null
                    : options[Math.floor(Math.random() * options.length)].visit()
            }

            cells[0][0].touched = true
            var stack = [{ row: 0, column: 0 }]
            while(stack.length > 0) {
                var top = stack[stack.length - 1]
                var next = getNextCell(top.row, top.column)

                if(next) stack.push(next)
                else stack.pop()
            }
        }
    });
});
