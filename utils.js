const ptcalc = psi => {
  const temp =
    396.5655 +
    (-65.93914 - 396.5655) / (1 + Math.pow(psi / 790.8456, 0.6406789));
  return temp;
};

module.exports = ptcalc;
