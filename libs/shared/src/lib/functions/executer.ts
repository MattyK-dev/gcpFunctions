import * as ff from '@google-cloud/functions-framework';

import { cloudFunctionError, serviceErrorHandler } from '../error-handlers';

/**
 * Executes a cloud function with all the generic error handlers
 * @param service The service to run
 * @param body The GCP request body
 */
export async function executeFunction<T>(
  service: (body: T) => Promise<any>,
  body: T,
  res: ff.Response
) {
  let response;
  try {
    try {
      response = await service(body);
    } catch (error: unknown) {
      serviceErrorHandler(error);
      throw new Error('Service level error occured, check logs for details');
    }

    if (!response) response = 'Function Completed Successfully';

    res.status(200).send(response);
  } catch (error: unknown) {
    cloudFunctionError(error);
    res.status(500).send((error as Error).message);
  }
}
