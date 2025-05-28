import { compareArrays } from './compare';

describe('compare', () => {
  it('should compare arrays if equal', () => {
    const data1 = ['hello', 'hello2'];
    const data2 = ['hello1', 'hello1'];
    const data3 = [...data1];

    const compared1 = compareArrays(data1, data2);
    const compared2 = compareArrays(data1, data3);

    expect(compared1).toBeFalsy();
    expect(compared2).toBeTruthy();
  });
});
