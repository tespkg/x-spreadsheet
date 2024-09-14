import './_.prototypes';

const alphabets = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

/** index number 2 letters
 * @example stringAt(26) ==> 'AA'
 * @date 2019-10-10
 * @export
 * @param {number} index
 * @returns {string}
 */
export function stringAt(index) {
  let str = '';
  let cindex = index;
  while (cindex >= alphabets.length) {
    cindex /= alphabets.length;
    cindex -= 1;
    str += alphabets[parseInt(cindex, 10) % alphabets.length];
  }
  const last = index % alphabets.length;
  str += alphabets[last];
  return str;
}

/** translate letter in A1-tag to number
 * @date 2019-10-10
 * @export
 * @param {string} str "AA" in A1-tag "AA1"
 * @returns {number}
 */
export function indexAt(str) {
  let ret = 0;
  for (let i = 0; i !== str.length; ++i) ret = 26 * ret + str.charCodeAt(i) - 64;
  return ret - 1;
}

// B10 => x,y
/** translate A1-tag to XY-tag
 * @date 2019-10-10
 * @export
 * @param {tagA1} src
 * @returns {tagXY}
 */
export function expr2xy(src) {
  const { row, column } = excelAddressToIndex(src)
  return [column - 1, row - 1]
}

export function indexToExcelAddress({ row, column }) {
  let columnPart = '';

  // Convert the column index back to letters (base-26 system)
  while (column > 0) {
    const remainder = (column - 1) % 26;
    columnPart = String.fromCharCode(remainder + 'A'.charCodeAt(0)) + columnPart;
    column = Math.floor((column - 1) / 26);
  }

  // Return the Excel cell address as a string (column letters + row number)
  return columnPart + row;
}
/**
 * to 0-based index
 * */
export function excelAddressToIndex(cellAddress) {
  const columnPart = cellAddress.match(/[A-Z]+/)[0];  // Extract column part (letters)
  const rowPart = parseInt(cellAddress.match(/\d+/)[0]);  // Extract row part (numbers)

  let columnIndex = 0;

  // Convert the column part (letters) to a number, treating it like base-26 (A=1, B=2, ..., Z=26, AA=27, etc.)
  for (let i = 0; i < columnPart.length; i++) {
    columnIndex = columnIndex * 26 + (columnPart.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
  }

  // Return row and column as 1-based index
  return {
    row: rowPart,
    column: columnIndex
  };
}


/** translate XY-tag to A1-tag
 * @example x,y => B10
 * @date 2019-10-10
 * @export
 * @param {number} x
 * @param {number} y
 * @returns {tagA1}
 */
export function xy2expr(x, y) {
  return `${stringAt(x)}${y + 1}`;
}

/** translate A1-tag src by (xn, yn)
 * @date 2019-10-10
 * @export
 * @param {tagA1} src
 * @param {number} xn
 * @param {number} yn
 * @returns {tagA1}
 */
export function expr2expr(src, xn, yn, condition = () => true) {
  if (xn === 0 && yn === 0) return src;
  const [x, y] = expr2xy(src);
  if (!condition(x, y)) return src;
  return xy2expr(x + xn, y + yn);
}

export default {
  stringAt,
  indexAt,
  expr2xy,
  xy2expr,
  expr2expr,
};
