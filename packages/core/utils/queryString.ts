function removeHash(input: string) {
  const hashStart = input.indexOf('#');

  return hashStart === -1 ? input : input.slice(0, hashStart);
}

export const queryString = {
  extract(input: string) {
    const inputNoHash = removeHash(input);

    const queryStart = inputNoHash.indexOf('?');

    return queryStart === -1 ? '' : inputNoHash.slice(queryStart + 1);
  },
  parse(input: string) {
    return Object.fromEntries(new URLSearchParams(input));
  },
  stringify(obj: Record<string, string>) {
    return new URLSearchParams(obj).toString();
  },
};
