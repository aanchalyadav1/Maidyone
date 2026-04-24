import { Response } from 'express';

export const sendResponse = (
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data: any = null
) => {
  let pagination;
  let finalData = data;

  if (data && typeof data === 'object' && data.pagination) {
    pagination = data.pagination;
    finalData = { ...data };
    delete finalData.pagination;
    
    // If the data object only had pagination and one other key (like 'users', 'workers'),
    // the frontend might expect that key to be inside `data` or we can just leave it as is.
    // The previous implementation returned: data: { users, pagination }.
    // So finalData will now just be { users }.
  }

  return res.status(statusCode).json({
    success,
    message,
    data: finalData,
    ...(pagination && { pagination })
  });
};
