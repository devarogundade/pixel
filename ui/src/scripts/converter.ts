import convert from './baseconverter';

const Converter = {
    validateEmail: (email: string) => {
        const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    fineAddress: function (hash: string | null, space: number) {
        if (hash == null || hash.length == 0) return '- - - - -';
        return hash.substring(0, space) + '...' + hash.substring(hash.length - space, hash.length);
    },

    formatNumber: function (value: number) {
        if (value >= 1e9) {
            return (value / 1e9).toFixed(1) + 'b';
        } else if (value >= 1e6) {
            return (value / 1e6).toFixed(1) + 'm';
        } else if (value >= 1e3) {
            return (value / 1e3).toFixed(1) + 'k';
        } else {
            return value.toString();
        }
    },

    fromWei: function (wei: bigint): number {
        try {
            if (wei == BigInt(0)) return 0;
            return convert(wei, 'wei', 'ether');
        } catch (error) {
            console.error('ether', error);
            return 0;
        }
    },

    toWei: function (ether: string | number): bigint {
        try {
            if (ether == '') return BigInt(0);
            return convert(ether, 'ether', 'wei');
        } catch (error) {
            console.error('wei', error);
            return BigInt(0);
        }
    },

    fromOctas: function (apt: any) {
        try {
            if (apt == '' || apt == '0') return '0';
            return convert(apt, 'apt', 'octas');
        } catch (error) {
            console.error('octas', error);
            return '0';
        }
    },

    toOctas: function (octas: any) {
        try {
            if (octas == '') return '0';
            return convert(octas, 'octas', 'apt');
        } catch (error) {
            console.error('apt', error);
            return '0';
        }
    },

    convertSecondsToMMSS: function (seconds: number): string {
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        // Pad with leading zeros if necessary
        const minutesStr = minutes.toString().padStart(2, '0');
        const secsStr = secs.toString().padStart(2, '0');

        return `${minutesStr}:${secsStr}`;
    },

    toMoney: function (amount: any, max = null) {
        let maxF = max ? max : 6;
        if (amount > 1) {
            maxF = 3;
        }
        if (amount > 10) {
            maxF = 2;
        }
        if (amount > 200) {
            maxF = 0;
        }
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: maxF
        });
        return formatter.format(amount).replace('$', '');
    },

    fullMonth: function (date: Date): string {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };
        return date.toLocaleString('en-US', options);
    },

    nFormatter: function (num: number, digits: number) {
        if (num < 1000) return this.toMoney(num);
        const lookup = [
            { value: 1, symbol: "" },
            { value: 1e3, symbol: "k" },
            { value: 1e6, symbol: "M" },
            { value: 1e9, symbol: "G" },
            { value: 1e12, symbol: "T" },
            { value: 1e15, symbol: "P" },
            { value: 1e18, symbol: "E" }
        ];
        const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
        const item = lookup.slice().reverse().find(function (item) {
            return num >= item.value;
        });
        const result = item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
        return result.replace('$', '');
    }
};

export default Converter;