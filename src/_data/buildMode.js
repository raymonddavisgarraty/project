const production = process.env.NODE_ENV === "production" ||
  process.env.SITE_ENV === "production";
export default Object.freeze({ production });
