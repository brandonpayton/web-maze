define([
    "dojo/_base/declare"
], function(declare) {
    return declare(null, {

        constructor: function(args) {
            var high = this.high = args.high
            var wide = this.wide = args.wide
            var cells = this._cells = []
            var touchedCells = []
            
            var i, j
            for(i = 0; i < high; i++) {
                cells[i] = []
                touchedCells[i] = []
                for(j = 0; j < wide; j++) {
                    cells[i][j] = { rightWall: true, bottomWall: true }
                }
            }
            
            var self = this
            function moveToNextCell(row, column) {
                var inaccessibleNeighbors = self.getInaccessibleNeighbors(row, column)
                var options = inaccessibleNeighbors.reduce(function(untouchedNeighbors, neighbor) {
                    if(!touchedCells[neighbor.row][neighbor.column]) untouchedNeighbors.push(neighbor)
                    return untouchedNeighbors
                }, [])

                if(options.length === 0) {
                    return null
                } else {
                    var chosenCell = options[Math.floor(Math.random() * options.length)]
                    touchedCells[chosenCell.row][chosenCell.column] = true

                    // Remove wall
                    if(chosenCell.row < row) {
                        cells[chosenCell.row][chosenCell.column].bottomWall = false
                    } else if(chosenCell.row > row) {
                        cells[row][column].bottomWall = false
                    } else if(chosenCell.column < column) {
                        cells[chosenCell.row][chosenCell.column].rightWall = false
                    } else if(chosenCell.column > column) {
                        cells[row][column].rightWall = false
                    } else {
                        throw new Error("Error moving to next cell during initialization.")
                    }

                    return chosenCell
                }
            }

            touchedCells[0][0] = true
            var stack = [{ row: 0, column: 0 }]
            while(stack.length > 0) {
                var top = stack[stack.length - 1]
                var next = moveToNextCell(top.row, top.column)

                if(next) stack.push(next)
                else stack.pop()
            }
        }
        , canGoUp: function(row, column) {
            return row > 0 && !this._cells[row - 1][column].bottomWall
        }
        , canGoDown: function(row, column) {
            return row < this._cells.length && !this._cells[row][column].bottomWall
        }
        , canGoLeft: function(row, column) {
            return column > 0 && !this._cells[row][column - 1].rightWall
        }
        , canGoRight: function(row, column) {
            return column < this._cells[row].length && !this._cells[row][column].rightWall
        }
        , getAccessibleNeighbors: function(row, column) {
            var neighbors = []
            if(this.canGoUp(row, column)) {
                neighbors.push({ row: row - 1, column: column })
            }
            if(this.canGoDown(row, column)) {
                neighbors.push({ row: row + 1, column: column })
            }
            if(this.canGoLeft(row, column)) {
                neighbors.push({ row: row, column: column - 1 })
            }
            if(this.canGoRight(row, column)) {
                neighbors.push({ row: row, column: column + 1 })
            }
            return neighbors
        }

        , getInaccessibleNeighbors: function(row, column) {
            var cells = this._cells
            var neighbors = []
            if(!this.canGoUp(row, column) && row > 0) {
                neighbors.push({ row: row - 1, column: column })
            }
            if(!this.canGoDown(row, column) && row < (cells.length - 1)) {
                neighbors.push({ row: row + 1, column: column })
            }
            if(!this.canGoLeft(row, column) && column > 0) {
                neighbors.push({ row: row, column: column - 1 })
            }
            if(!this.canGoRight(row, column) && column < (cells[row].length - 1)) {
                neighbors.push({ row: row, column: column + 1 })
            }
            return neighbors
        },
    })
})
