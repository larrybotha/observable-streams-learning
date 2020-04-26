import { interval } from "rxjs";
import { scan, startWith } from "rxjs/operators";

import {
  markForRemoval,
  updateLines,
  updateMatrix,
} from "../../../../lib/matrix-naive";
import { Matrix } from "../../../../lib/matrix-naive/interfaces";

const matrix$ = interval(300).pipe(
  startWith([]),
  scan<number, Matrix>(matrix => {
    markForRemoval(matrix);
    updateLines(matrix);

    return updateMatrix(matrix);
  })
);

export { matrix$ };
