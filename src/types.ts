export const CountryList = {
  MX: "Mexico",
  DZ: "Algeria",
  KE: "Kenya",
  VU: "Vanuatu",
  AT: "Austria",
  CU: "Cuba",
  GY: "Guyana",
  MT: "Malta",
  DK: "Denmark",
  ER: "Eritrea",
  CW: "Curaçao",
  JM: "Jamaica",
  PS: "Palestine, State of",
  RE: "Réunion",
  MY: "Malaysia",
  IL: "Israel",
  SZ: "Eswatini",
  CF: "Central African Republic",
  TC: "Turks and Caicos Islands",
  ES: "Spain",
  MN: "Mongolia",
  SX: "Sint Maarten",
  AO: "Angola",
  DM: "Dominica",
  ID: "Indonesia",
  MF: "Saint Martin (French part)",
  CN: "China",
  NL: "Netherlands",
  BJ: "Benin",
  BI: "Burundi",
  CR: "Costa Rica",
  LT: "Lithuania",
  KM: "Comoros",
  OM: "Oman",
  BH: "Bahrain",
  SY: "Syria",
  NO: "Norway",
  AL: "Albania",
  TO: "Tonga",
  BD: "Bangladesh",
  GQ: "Equatorial Guinea",
  LA: "Lao People's Democratic Republic",
  GH: "Ghana",
  SI: "Slovenia",
  ZA: "South Africa",
  BA: "Bosnia and Herzegovina",
  GW: "Guinea-Bissau",
  AS: "American Samoa",
  MU: "Mauritius",
  KG: "Kyrgyzstan",
  ZM: "Zambia",
  TT: "Trinidad and Tobago",
  CH: "Switzerland",
  BT: "Bhutan",
  CA: "Canada",
  YE: "Yemen",
  GN: "Guinea",
  MD: "Moldova",
  TG: "Togo",
  KR: "South Korea",
  US: "United States of America",
  CZ: "Czechia",
  AI: "Anguilla",
  NC: "New Caledonia",
  BE: "Belgium",
  JP: "Japan",
  FJ: "Fiji",
  GL: "Greenland",
  MG: "Madagascar",
  DJ: "Djibouti",
  SK: "Slovakia",
  PA: "Panama",
  EE: "Estonia",
  SC: "Seychelles",
  DO: "Dominican Republic",
  SS: "South Sudan",
  GF: "French Guiana",
  GR: "Greece",
  IS: "Iceland",
  KP: "North Korea",
  BL: "Saint Barthélemy",
  FM: "Micronesia",
  MR: "Mauritania",
  JO: "Jordan",
  SE: "Sweden",
  TN: "Tunisia",
  NP: "Nepal",
  PE: "Peru",
  MH: "Marshall Islands",
  NG: "Nigeria",
  CD: "Democratic Republic of the Congo",
  SL: "Sierra Leone",
  NE: "Niger",
  BG: "Bulgaria",
  CO: "Colombia",
  MM: "Myanmar",
  BB: "Barbados",
  UY: "Uruguay",
  MA: "Morocco",
  BQ: "Bonaire, Sint Eustatius and Saba",
  MQ: "Martinique",
  ME: "Montenegro",
  AF: "Afghanistan",
  UZ: "Uzbekistan",
  RO: "Romania",
  FI: "Finland",
  VG: "British Virgin Islands",
  HR: "Croatia",
  CV: "Cape Verde",
  LY: "Libya",
  GP: "Guadeloupe",
  MV: "Maldives",
  NI: "Nicaragua",
  GU: "Guam",
  RS: "Serbia",
  SN: "Senegal",
  IR: "Iran",
  RU: "Russian Federation",
  SB: "Solomon Islands",
  SA: "Saudi Arabia",
  PH: "Philippines",
  RW: "Rwanda",
  SD: "Sudan",
  KW: "Kuwait",
  CY: "Cyprus",
  ML: "Mali",
  CI: "Côte d'Ivoire",
  BS: "Bahamas",
  AE: "United Arab Emirates",
  AR: "Argentina",
  CM: "Cameroon",
  NR: "Nauru",
  MZ: "Mozambique",
  NA: "Namibia",
  BR: "Brazil",
  GB: "United Kingdom",
  LC: "Saint Lucia",
  EC: "Ecuador",
  KH: "Cambodia",
  TZ: "Tanzania",
  VC: "Saint Vincent and the Grenadines",
  GE: "Georgia",
  IT: "Italy",
  LR: "Liberia",
  IN: "India",
  DE: "Germany",
  TV: "Tuvalu",
  BF: "Burkina Faso",
  TW: "Taiwan",
  FO: "Faroe Islands",
  BO: "Bolivia",
  TD: "Chad",
  BN: "Brunei Darussalam",
  PL: "Poland",
  QA: "Qatar",
  AZ: "Azerbaijan",
  KN: "Saint Kitts and Nevis",
  YT: "Mayotte",
  HT: "Haiti",
  CG: "Congo",
  BY: "Belarus",
  TR: "Turkey",
  VE: "Venezuela",
  LU: "Luxembourg",
  MS: "Montserrat",
  IE: "Ireland",
  PK: "Pakistan",
  AM: "Armenia",
  VN: "Vietnam",
  TJ: "Tajikistan",
  WS: "Samoa",
  XK: "Kosovo",
  LS: "Lesotho",
  LV: "Latvia",
  MP: "Northern Mariana Islands",
  GT: "Guatemala",
  AW: "Aruba",
  UA: "Ukraine",
  GM: "Gambia",
  GD: "Grenada",
  ET: "Ethiopia",
  KY: "Cayman Islands",
  HN: "Honduras",
  BW: "Botswana",
  BZ: "Belize",
  SR: "Suriname",
  EG: "Egypt",
  FK: "Falkland Islands",
  SV: "El Salvador",
  PR: "Puerto Rico",
  IQ: "Iraq",
  ST: "Sao Tome and Principe",
  TM: "Turkmenistan",
  PG: "Papua New Guinea",
  FR: "France",
  UG: "Uganda",
  PT: "Portugal",
  TL: "Timor-Leste",
  CL: "Chile",
  BM: "Bermuda",
  TH: "Thailand",
  AU: "Australia",
  HU: "Hungary",
  LB: "Lebanon",
  PW: "Palau",
  KZ: "Kazakhstan",
  SO: "Somalia",
  MK: "North Macedonia",
  PY: "Paraguay",
  GA: "Gabon",
  NZ: "New Zealand",
  MW: "Malawi",
  AG: "Antigua and Barbuda",
  VI: "U.S. Virgin Islands",
  PF: "French Polynesia",
  LK: "Sri Lanka",
  EH: "Western Sahara"
} as const

export type CountryCode = keyof typeof CountryList
export type Tab = "Chart"
export type PopulationData = {
  [countryCode in CountryCode]: number[][][]
}
