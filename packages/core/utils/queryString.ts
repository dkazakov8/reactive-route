export const queryString = {
  extract(input: string) {
    const hashStart = input.indexOf('#');
    const inputNoHash = hashStart === -1 ? input : input.slice(0, hashStart);

    const queryStart = inputNoHash.indexOf('?');

    return queryStart === -1 ? '' : inputNoHash.slice(queryStart + 1);
  },
  stringify(obj: Record<string, string>) {
    return new URLSearchParams(obj).toString();
  },
};
