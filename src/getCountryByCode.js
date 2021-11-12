const lookup = require("country-code-lookup");

export const getCountryByCode = (code) => {
  return lookup.byIso(code);
};
