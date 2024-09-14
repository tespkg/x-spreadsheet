import assert from 'assert';
import { describe, it } from 'mocha';
import cell, { evalExpr } from '../../src/core/cell';
import { xy2expr } from '../../src/core/alphabet'
import { formulam } from '../../src/core/formula';

describe('evalExpr', () => {

  it('should return 2 when the value is 1+1', () => {
    const formulaMap = {};
    const getCellText = (row, col) => row + col;
    assert.equal(evalExpr('1+1', formulaMap, getCellText), 2);
  });
  it('should return "my name:A1 score:50" when the value is CONCAT("my name:", A1, " score:", 50)', () => {
    const formulaMap = {
      CONCAT: { render: params => params.join('') }
    };
    const values = { A1: 'lihua', A2: 1 };
    const getCellText = (row, col) => {
      const key = xy2expr(col, row);
      return values[key];
    };
    assert.equal(evalExpr('CONCAT("my name:", A1, " score:", 50)', formulaMap, getCellText), 'my name:lihua score:50');
  });
  it('should return 2 when the value is SUM(A1, A2)', () => {
    const formulaMap = {
      SUM: { render: params => params.reduce((a, b) => a + b, 0) }
    };
    const values = { A1: 1, A2: 1 };
    const getCellText = (y, x) => {
      const key = xy2expr(x, y);
      return values[key];
    };
    assert.equal(evalExpr('SUM(A1, A2)', formulaMap, getCellText), 2);
  });

  it('should return 120 when the value is AVERAGE(SUM(A1,B2), C1, C5) + 50 + B20', () => {
    const formulaMap = {
      AVERAGE: { render: params => params.reduce((a, b) => a + b, 0) / params.length },
      SUM: { render: params => params.reduce((a, b) => a + b, 0) }
    };
    const values = { A1: 10, B2: 20, C1: 30, C5: 40, B20: 20 };
    const getCellText = (y, x) => {
      const key = xy2expr(x, y);
      return values[key];
    };
    assert.equal(
      evalExpr('AVERAGE(SUM(A1,B2), C1, C5) + 50 + B20', formulaMap, getCellText),
      (values.A1 + values.B2 + values.C1 + values.C5) / 3 + 50 + values.B20
    );
  });
  it('should return 120 when the value is ((AVERAGE(SUM(A1,B2, B3), C1, C5) + 50) + B20)', () => {
    const formulaMap = {
      AVERAGE: { render: params => params.reduce((a, b) => a + b, 0) / params.length },
      SUM: { render: params => params.reduce((a, b) => a + b, 0) }
    };
    const values = { A1: 10, B2: 20, B3: 30, C1: 40, C5: 50, B20: 20 };
    const getCellText = (y, x) => {
      const key = xy2expr(x, y);
      return values[key];
    };
    assert.equal(evalExpr('((AVERAGE(SUM(A1,B2, B3), C1, C5) + 50) + B20)', formulaMap, getCellText),
      (values.A1 + values.B2 + values.B3 + values.C1 + values.C5) / 3 + 50 + values.B20
    );
  });
  it('should return "t" when the value is IF(1=1, "t", "f")', () => {
    const formulaMap = {
      IF: { render: params => params[0] ? params[1] : params[2] }
    };
    const getCellText = (row, col) => row + col;
    assert.equal(evalExpr('IF(1=1, "t", "f")', formulaMap, getCellText), 't');
  });
  it('should return 2 when the value is IF(2>1, 2, 1)', () => {
    const formulaMap = {
      IF: { render: params => params[0] ? params[1] : params[2] }
    };
    const getCellText = (row, col) => row + col;
    assert.equal(evalExpr('IF(2>1, 2, 1)', formulaMap, getCellText), 2);
  });
  it('should return 2 when the value is IF(AND(1=1), 2, 1)', () => {
    const formulaMap = {
      IF: { render: params => params[0] ? params[1] : params[2] },
      AND: { render: params => params.every(Boolean) }
    };
    const getCellText = (row, col) => row + col;
    assert.equal(evalExpr('IF(AND(1=1), 2, 1)', formulaMap, getCellText), 2);
  });
  it('should return 2 when the value is IF(AND(1=1, 2>1), 2, 1)', () => {
    const formulaMap = {
      IF: { render: params => params[0] ? params[1] : params[2] },
      AND: { render: params => params.every(Boolean) }
    };
    const getCellText = (row, col) => row + col;
    assert.equal(evalExpr('IF(AND(1=1, 2>1), 2, 1)', formulaMap, getCellText), 2);
  });
  it('should return -15 when the value is 10-5-20', () => {
    const getCellText = (row, col) => row + col;
    assert.equal(evalExpr('10-5-20', {}, getCellText), -15);
  });
  it('should return -195 when the value is 10-5-20*10', () => {
    const getCellText = (row, col) => row + col;
    assert.equal(evalExpr('10-5-20*10', {}, getCellText), 10 - 5 - 20 * 10);
  });
  it('should return -90 when the value is 10-5*20', () => {
    const getCellText = (row, col) => row + col;
    assert.equal(evalExpr('10-5*20', {}, getCellText), -90);
  });
  it('should return 25 when the value is 10-5+20', () => {
    const getCellText = (row, col) => row + col;
    assert.equal(evalExpr('10-5+20', {}, getCellText), 25);
  });
  it('should return 189 when the value is 1 + 2*3 + (4 * 5 + 6) * 7', () => {
    const getCellText = (row, col) => row + col;
    assert.equal(evalExpr('1+2*3+(4*5+6)*7', {}, getCellText), 1 + 2 * 3 + (4 * 5 + 6) * 7);
  });
  it('should return 14 when the value is 9+(3-1*2)*3+4/2', () => {
    const getCellText = (row, col) => row + col;
    assert.equal(evalExpr('9+(3-1*2)*3+4/2', {}, getCellText), 9 + (3 - 1 * 2) * 3 + 4 / 2);
  });
  it('should return 57 when the value is (9+(3-1))*(2+3)+4/2', () => {
    const getCellText = (row, col) => row + col;
    assert.equal(evalExpr('(9+(3-1))*(2+3)+4/2', {}, getCellText), (9 + (3 - 1)) * (2 + 3) + 4 / 2);
  });
  it('should return 1 when the value is SUM(1)', () => {
    const formulaMap = {
      SUM: { render: params => params.reduce((a, b) => a + b, 0) }
    };
    const getCellText = (row, col) => row + col;
    assert.equal(evalExpr('SUM(1)', formulaMap, getCellText), 1);
  });
  it('should return 0 when the value is SUM()', () => {
    const formulaMap = {
      SUM: { render: params => params.reduce((a, b) => a + b, 0) }
    };
    const getCellText = (row, col) => row + col;
    assert.equal(evalExpr('SUM()', formulaMap, getCellText), 0);
  });

  it('should return 4 when the value is SQRT(16)', () => {
    const formulaMap = {
      SQRT: { render: params => Math.sqrt(params[0]) }
    };
    assert.equal(evalExpr('SQRT(16)', formulaMap, () => 0), 4);
  });

  it('should return 0.6427876096865394 when the value is -COS(I3*(PI()/180)) with I3 = 130', () => {
    const values = { I3: 130 };
    const getCellText = (y, x) => {
      const key = xy2expr(x, y);
      return values[key];
    };
    assert.equal(evalExpr('-COS(I3*(PI()/180))', formulam, getCellText), -Math.cos(130 * (Math.PI / 180)));
    //assert.equal(evalExpr('(I3*(PI()/180))', formulam, getCellText), (130 * (Math.PI / 180)));
  });

  it('should return the correct value for =(0.2166095*A21*(SQRT(C$15/C$16)))/(485*-COS(130*(PI()/180)))', () => {
    const values = { A21: 10, C15: 100, C16: 25 }; // Example values
    const getCellText = (y, x) => {
      const key = xy2expr(x, y);
      return values[key];
    };
    const expectedValue = (0.2166095 * values.A21 * Math.sqrt(values.C15 / values.C16)) / (485 * -Math.cos(130 * (Math.PI / 180)));
    assert.equal(evalExpr('=(0.2166095*A21*(SQRT(C$15/C$16)))/(485*-COS(130*(PI()/180)))', formulam, getCellText), expectedValue);
  });

   it('should return the correct value for =(N21*6894.75729/(($H$13-$H$14)*9.8)*3.28083)/1000', () => {
     const values = { N21: 10, H13: 100, H14: 50 }; // Example values
     const getCellText = (y, x) => {
       const key = xy2expr(x, y);
       return values[key];
     };
     const expectedValue = (values.N21 * 6894.75729 / ((values.H13 - values.H14) * 9.8) * 3.28083) / 1000;
     assert.equal(evalExpr('=(N21*6894.75729/(($H$13-$H$14)*9.8)*3.28083)/1000', formulam, getCellText), expectedValue);
   });

});

describe('cell', () => {
  describe('.render()', () => {
    it('should eval =SUM(A1,B2, C1, C5) + 50 + B20', () => {
      const values = { A1: 1, B2: 2, C1: 3, C5: 4, B20: 5 };
      const getCellText = (y, x) => {
        const key = xy2expr(x, y);
        return values[key];
      };
      assert.equal(cell.render(`=SUM(A1,B2,C1,C5) + 50 + B20`, formulam, getCellText), values.A1 + values.B2 + values.C1 + values.C5 + 50 + values.B20);
    });
  });
});
