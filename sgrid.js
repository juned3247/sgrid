class SGrid {
    constructor(ele, opts) {
        this.ele = ele;
        this.opts = opts;
        this.selections = [];

        this.init();
    }

    init() {
        let rows = this.opts.rows;
        let cols = this.opts.cols;

        let root = document.createElement('div');
        this.root = root;
        root.classList.add('sgrid');

        for (let i = 0; i < rows; i++) {
            let row = document.createElement('div');
            row.classList.add('row');
            for (let j = 0; j < cols; j++) {
                let col = document.createElement('div');
                col.classList.add('col');
                row.appendChild(col);
            }
            root.appendChild(row);
        }

        root.addEventListener('mousemove', this.rootMouseEvent.bind(this));
        root.addEventListener('mousedown', this.rootMouseEvent.bind(this));
        root.addEventListener('mouseup', this.rootMouseEvent.bind(this));

        this.ele.appendChild(root);
    }

    getElementIndex(node) {
        let index = 0;
        while ( (node = node.previousElementSibling) ) {
            index++;
        }
        return index;
    }    

    calculateXY(ele) {
        return {
            x: this.getElementIndex(ele),
            y: this.getElementIndex(ele.parentElement)
        }
    }

    rootMouseEvent (event) {
        switch(event.type) {
            case 'mousedown': {
                this.mouseDownXY = this.calculateXY(event.target);
                return;
            }
            case 'mousemove': {
                if (this.mouseDownXY) {
                    event.preventDefault();
                    let currentXY = this.calculateXY(event.target);
                    this.selectCells(this.mouseDownXY, currentXY);
                }
                return;
            }
            case 'mouseup': {
                if (this.selectListener) {
                    this.selectListener({
                        from: this.mouseDownXY,
                        to: this.calculateXY(event.target)
                    });
                }
                this.mouseDownXY = undefined;
                this.resetSelection();
                return;
            }
        }
    }

    resetSelection() {
        let allCells = document.querySelectorAll('.sgrid .col');
        allCells.forEach(cell => {
            cell.classList.remove('selected');
        })
    }

    lowerupper(x1, x2) {
        if (x1 > x2){
            return {
                lower: x2,
                upper: x1
            }
        } else {
            return {
                lower: x1,
                upper: x2
            }
        }
    }

    selectCells(from, to) {
        this.resetSelection();
        for (let y = 0; y < this.root.children.length; y++) {
            let row = this.root.children[y];
            for (let x = 0; x < row.children.length; x++) {
                if (this.getSelectionCondition(x, y, from, to)) {
                    let cell = row.children[x];
                    cell.classList.add('selected');
                }
            }
        }
    }

    getSelectionCondition(x, y, from, to) {
        let calculatedX = this.lowerupper(from.x, to.x);
        let calculatedY = this.lowerupper(from.y, to.y);
        if (this.opts.selection) {
            if (this.opts.selection == 'rowonly') {
                return x >= calculatedX.lower && x <= calculatedX.upper && y == from.y;
            } else if (this.opts.selection == 'colonly') {
                return x == from.x && y >= calculatedY.lower && y <= calculatedY.upper;
            }
        }
        return x >= calculatedX.lower && x <= calculatedX.upper && y >= calculatedY.lower && y <= calculatedY.upper;
    }

    onselect(selectListener) {
        this.selectListener = selectListener;
    }
}
