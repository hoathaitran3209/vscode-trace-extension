import { xyChartDataToCsv } from '../xy-shared';

describe('xyChartDataToCsv', () => {
    it('returns header only when there are no datasets', () => {
        expect(xyChartDataToCsv({ labels: [1, 2], datasets: [] })).toBe('Timestamp,IPs,Value');
        expect(xyChartDataToCsv(undefined)).toBe('Timestamp,IPs,Value');
    });

    it('groups rows by IP then sorts each group by timestamp', () => {
        const csv = xyChartDataToCsv({
            labels: [30, 10, 20],
            datasets: [
                { label: '10.0.0.2', data: [3, 1, 2] },
                { label: '10.0.0.1', data: [6, 4, 5] }
            ]
        });

        expect(csv).toBe(
            [
                'Timestamp,IPs,Value',
                '10,10.0.0.1,4',
                '20,10.0.0.1,5',
                '30,10.0.0.1,6',
                '10,10.0.0.2,1',
                '20,10.0.0.2,2',
                '30,10.0.0.2,3'
            ].join('\n')
        );
    });

    it('sorts scatter points by numeric x within each IP', () => {
        const csv = xyChartDataToCsv({
            datasets: [
                {
                    label: 'B',
                    data: [
                        { x: 20, y: 2 },
                        { x: 5, y: 1 }
                    ]
                },
                {
                    label: 'A',
                    data: [
                        { x: 8, y: 9 },
                        { x: 1, y: 7 }
                    ]
                }
            ]
        });

        expect(csv).toBe(['Timestamp,IPs,Value', '1,A,7', '8,A,9', '5,B,1', '20,B,2'].join('\n'));
    });

    it('sorts bigint timestamps within each IP', () => {
        const csv = xyChartDataToCsv({
            labels: [BigInt(300), BigInt(100)],
            datasets: [{ label: 'eth0', data: [2, 1] }]
        });

        expect(csv).toBe(['Timestamp,IPs,Value', '100,eth0,1', '300,eth0,2'].join('\n'));
    });

    it('preserves exact order for large integer timestamp strings', () => {
        const larger = '9007199254740993';
        const smaller = '9007199254740992';
        expect(Number(larger)).toBe(Number(smaller));

        const csv = xyChartDataToCsv({
            labels: [larger, smaller],
            datasets: [{ label: 'eth0', data: [2, 1] }]
        });

        expect(csv).toBe(
            ['Timestamp,IPs,Value', `${smaller},eth0,1`, `${larger},eth0,2`].join('\n')
        );
    });
});
