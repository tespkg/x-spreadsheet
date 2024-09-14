import { expr2xy, xy2expr } from './alphabet';
import { numberCalc } from './helper';
import { tokenize } from 'excel-formula-tokenizer';
import { buildTree } from 'excel-formula-ast';

// function indexToExcelAddress({ row, column }) {
//   let columnPart = '';

//   // Convert the column index back to letters (base-26 system)
//   while (column > 0) {
//     const remainder = (column - 1) % 26;
//     columnPart = String.fromCharCode(remainder + 'A'.charCodeAt(0)) + columnPart;
//     column = Math.floor((column - 1) / 26);
//   }

//   // Return the Excel cell address as a string (column letters + row number)
//   return columnPart + row;
// }
// function excelAddressToIndex(cellAddress) {
//   const columnPart = cellAddress.match(/[A-Z]+/)[0];  // Extract column part (letters)
//   const rowPart = parseInt(cellAddress.match(/\d+/)[0]);  // Extract row part (numbers)

//   let columnIndex = 0;

//   // Convert the column part (letters) to a number, treating it like base-26 (A=1, B=2, ..., Z=26, AA=27, etc.)
//   for (let i = 0; i < columnPart.length; i++) {
//     columnIndex = columnIndex * 26 + (columnPart.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
//   }

//   // Return row and column as 1-based index
//   return {
//     row: rowPart,
//     column: columnIndex
//   };
// }


export const evalExpr = (formula, formulaMap, 
  /**@type {(y:number,x:number)=>string} */
  getCellText) => {
  const tokens = tokenize(formula);
  const tree = buildTree(tokens);
  const evalNode = (node) => {
    if (node.type === 'number') {
      return parseFloat(node.value);
    }
    if (node.type === 'text') {
      return node.value;
    }
    if (node.type === 'cell') {
      const [x, y] = expr2xy(node.key);
      return getCellText(y, x)
    }
    if (node.type === 'function') {
      const func = formulaMap[node.name];
      if (func) {
        const params = node.arguments.map(evalNode);
        return func.render(params);
      }
      throw new Error(`Function ${node.name} not found`);
    }
    if (node.type === 'binary-expression') {
      const left = evalNode(node.left);
      const right = evalNode(node.right);
      switch (node.operator) {
        case '+': return +left +  +right;  // numberCalc('+', left, right);
        case '-': return +left -  +right; // numberCalc('-', left, right);
        case '*': return +left *  +right; // numberCalc('*', left, right);
        case '/': return +left /  +right; // numberCalc('/', left, right);
        case '=': return +left == +right;
        case '==': return left == +right;
        case '>': return left > right;
        case '<': return left < right;
        case '>=': return left >= right;
        case '<=': return left <= right;
        case '<>': return left != right;
        default: throw new Error(`Unknown operator ${node.operator}`);
      }
    }
    if (node.type === 'unary-expression') {
      const value = evalNode(node.operand);
      switch (node.operator) {
        case '-': return -value;
        case '+': return +value;
        default: throw new Error(`Unknown operator ${node.operator}`);
      }
    }
    if (node.type === 'cell-range') {
      const startCell = node.left.key;
      const endCell = node.right.key;
      const rangeValues = [];

      const [startCol, startRow] = expr2xy(startCell);
      const [endCol, endRow] = expr2xy(endCell);

      // Iterate over the range and collect values
      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          const cellValue = getCellText(row, col);
          rangeValues.push(cellValue);
        }
      }

      return rangeValues;
    }
    throw new Error(`Unknown node type ${node.type}`);
  };
  //console.log(tree);  
  return evalNode(tree);
};

const cellRender = (src, formulaMap, getCellText, cellList = []) => {
  if (src[0] === '=') {
    try {
      return evalExpr(src.substring(1), formulaMap, getCellText, cellList);
    }catch(e) {
      console.error(`Error while eval src: ${src}`);
      console.error(e);
      return '#ERR'
    }
  }
  return src;
};

export default {
  render: cellRender,
};
