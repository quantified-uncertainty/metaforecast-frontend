export const distinctColors = ["#3d674a", "#231149", "#62520b", "#32407e", "#7d4f1b", "#002455", "#223900", "#615691", "#003419", "#793466", "#006669", "#984158", "#00314e", "#460c00", "#0d1624", "#6f5b41", "#240d23", "#272600", "#755469", "#2a323d"]

// https://medialab.github.io/iwanthue/ fancy light background
const platformNames = ["Betfair", "FantasySCOTUS", "Foretold", "GiveWell/OpenPhilanthropy", "Good Judgment", "Good Judgment Open", "Guesstimate", "Infer", "Kalshi", "Manifold Markets", "Metaculus", "Peter Wildeford", "PolyMarket", "PredictIt", "Rootclaim", "Smarkets", "X-risk estimates"]

export const platformsWithLabels = platformNames.map((name, i) => ({value: name, label: name, color: distinctColors[i]}))

export const platforms = platformsWithLabels

/*
const platformsold = [
  { value: "Betfair", label: "Betfair" },
  { value: "FantasySCOTUS", label: "FantasySCOTUS" },
  { value: "Foretold", label: "Foretold" },
  { value: "GiveWell/OpenPhilanthropy", label: "GiveWell/OpenPhilanthropy" },
  { value: "Good Judgment", label: "Good Judgment" },
  { value: "Good Judgment Open", label: "Good Judgment Open" },
  { value: "Guesstimate", label: "Guesstimate" },
  { value: "Infer", label: "Infer" },
  { value: "Kalshi", label: "Kalshi" },
  { value: "Manifold Markets", label: "Manifold Markets" },
  { value: "Metaculus", label: "Metaculus" },
  { value: "Peter Wildeford", label: "Peter Wildeford" },
  { value: "PolyMarket", label: "PolyMarket" },
  { value: "PredictIt", label: "PredictIt" },
  { value: "Rootclaim", label: "Rootclaim" },
  { value: "Smarkets", label: "Smarkets" },
  { value: "X-risk estimates", label: "X-risk estimates" },
];
*/
/*
  { value: "AstralCodexTen", label: "AstralCodexTen" },
    { value: "CoupCast", label: "CoupCast" },
    { value: 'CSET-foretell', label: 'CSET-foretell' },
    { value: "Estimize", label: "Estimize" },
    { value: 'Elicit', label: 'Elicit' },
    { value: 'Hypermind', label: 'Hypermind' },
    { value: 'Omen', label: 'Omen' },
    { value: "WilliamHill", label: "WilliamHill" },
*/

