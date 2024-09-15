import * as ff from '@google-cloud/functions-framework'

import { FunctionNames, executeFunction } from '@gcp-functions/shared';

ff.http(FunctionNames.RAG_EXAMPLE, async (req, res) => {
  await executeFunction<any>(
    x,
    req.body,
    res
  )
});

async function x (body: any) {
  console.log(body);
}