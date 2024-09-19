import assert from 'assert'
import { renderCell } from '../../src/component/table'
import DataProxy from '../../src/core/data_proxy';
describe("renderCell", () => {

  it("should enable to ref formula cell in formual cell", () => { 
      const text = []
    const mockDraw = {
      strokeBorders: () => {},
      rect: (_,f) => {f()},
      text: (t) => {
        text.push(t);
      },
      error: () => {},
      frozen: () => {}
    };
    const dataProxy = new DataProxy('testSheet', {
      row: {
        len: 2,
        height: 25,
      },
      col: {
        len: 2,
        width: 100,
        indexWidth: 60,
        minWidth: 60,
      },
    });

    dataProxy.setCellText(0, 0, '=A2+1');
    dataProxy.setCellText(1, 0, '=SQRT(4)');
    renderCell(mockDraw,dataProxy,0,0);
    assert.equal(dataProxy.getCell(0, 0).computation,'3');
    assert.equal(dataProxy.getCell(1, 0).computation,'2');
    assert.equal(text[0],"3");
  })
})
