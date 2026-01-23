export const log = (message: string, data?: unknown) => {
  console.log(JSON.stringify({ message, data }));
};
