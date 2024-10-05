// @ts-ignore
import BigNumber from 'bignumber.js';

BigNumber.config({ DECIMAL_PLACES: 18 });

const Units: any = {};

const rawUnits: any = {
    "apt": "1",
    "wei": "1",
    "octas": "100000000",
    "ether": "1000000000000000000"
};

const units: any = {};

Object.keys(rawUnits).map(function (unit: any) {
    units[unit] = new BigNumber(rawUnits[unit], 10);
});

Units.units = rawUnits;

function convert(value: any, from: any, to: any) {
    const result = new BigNumber(value, 10).mul(units[from]).round(0, BigNumber.ROUND_DOWN).div(units[to]);
    return result.toString(10);
}

export default convert;