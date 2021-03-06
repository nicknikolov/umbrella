import { Reducer, Transducer } from "../api";
import { shuffleN } from "../func/shuffle";
import { isReduced } from "../reduced";

/**
 * Transducer. Creates internal sliding window of `n` values and
 * performs `maxSwaps` random shuffle operations for each new value and
 * yields values in shuffled order. By default `maxSwaps` is the same as
 * the chosen chunk size.
 *
 * ```
 * [...iterator(streamShuffle(5), range(10))]
 * // [ 3, 2, 5, 0, 8, 7, 1, 6, 4, 9 ]
 * ```
 *
 * @param n sliding window size
 * @param maxSwaps number of swaps per input
 */
export function streamShuffle<T>(n: number, maxSwaps = n): Transducer<T, T> {
    return ([init, complete, reduce]: Reducer<any, T>) => {
        const buf: T[] = [];
        return [
            init,
            (acc) => {
                while (buf.length && !isReduced(acc)) {
                    shuffleN(buf, maxSwaps);
                    acc = reduce(acc, buf.shift());
                }
                acc = complete(acc);
                return acc;
            },
            (acc, x) => {
                buf.push(x);
                shuffleN(buf, maxSwaps);
                if (buf.length === n) {
                    acc = reduce(acc, buf.shift());
                }
                return acc;
            }
        ];
    };
}
