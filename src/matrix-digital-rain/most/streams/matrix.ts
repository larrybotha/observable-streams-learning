import { scan, periodic, run } from "@most/core";
import { newDefaultScheduler } from "@most/scheduler";

import {
  markForRemoval,
  updateLines,
  updateMatrix,
} from "../../lib/matrix-naive/index";
import { Matrix } from "../../lib/matrix-naive/interfaces";

const matrixReducer = (matrix: Matrix) => {
  markForRemoval(matrix);
  updateLines(matrix);

  return updateMatrix(matrix);
};

const matrixUpdate$ = scan(matrixReducer, [], periodic(300));

const matrix$ = {
  subscribe: (fn: any) => {
    /**
     * we need to emit the first item, otherwise the store gets 'undefined' as the
     * first value
     */
    fn([]);

    const sink = {
      event: (timestamp: number, matrix: any) => {
        return fn(matrix);
      },
      end: () => console.log("complete"),
      error: (err: any) => console.log("error"),
    };
    const scheduler = newDefaultScheduler();
    const disposable = run(sink, scheduler, matrixUpdate$);

    return function() {
      return disposable.dispose();
    };
  },
};

export { matrix$ };
