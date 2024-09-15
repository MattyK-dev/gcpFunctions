import * as ff from '@google-cloud/functions-framework'

import { FunctionNames, executeFunction } from '@gcp-functions/shared';

import { ragExampleLib } from '@gcp-functions/rag-example-lib';

ff.http(FunctionNames.RAG_EXAMPLE, async (req, res) => {
  await executeFunction<any>(ragExampleLib, req.body, res);
});
