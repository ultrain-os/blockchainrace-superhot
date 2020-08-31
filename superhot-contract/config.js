// const config = {
//   httpEndpoint: "http://127.0.0.1:8888",
//   httpEndpointHistory: "http://127.0.0.1:3000",
//   chainId: "80a5d6aa3e0c2e2052c3df1cc6b591b90b8307fb102bd174805e06c8b8b16ec1",
//   broadcast: true,
//   sign: true,
//   logger: {
//     directory: "../../logs", // daily rotate file directory
//     level: "info", // error->warn->info->verbose->debug->silly
//     console: true, // print to console
//     file: false // append to file
//   },
//   symbol: "UGAS",
//   keyProvider:['5JbedY3jGfNK7HcLXcqGqSYrmX2n8wQWqZAuq6K7Gcf4Dj62UfL'],
//   //expireInSeconds:60
// };

// const config = {
//   httpEndpoint:"https://pioneer.ultrain.info",
//   httpEndpointHistory:"https://history-pioneer.ultrain.info",
//   chainId:"13c654dcffbed7b6d615aa92b75ebf1a3049ff74ffe73fdeafb9113be6b6fe22",
//   broadcast: true,
//   sign: true,
//   logger: {
//     directory: "../../logs", // daily rotate file directory
//     level: "info", // error->warn->info->verbose->debug->silly
//     console: true, // print to console
//     file: false // append to file
//   },
//   symbol: "UGAS",
//   keyProvider:['5KfjDYSn44QfW2s9xs8NxrCPMZUh1ZbZNJG7o6PUsLNg8VbCdV4'],
//   //expireInSeconds:60
// };

// Private key: 5K1meGLocwvHaVSLmVnHmWcMwkTb3Kp24Ug5rEgsmgTDEjGfbiP
// Public key: UTR56rgE9RbbKJraYG9wMqxV7ucuEDjAB6rqCfiJSx2EUwsBpUUdG
const config = {
  httpEndpoint: 'https://unitopia.ultrain.info',
  httpEndpointHistory: 'https://history-unitopia.ultrain.info',
  chainId: '7c3040786b0d1de5af5bdba73800acb1767fbdea402da0613ba8601f3a1a2acb',
  broadcast: true,
  sign: true,
  logger: {
    directory: "../../logs", // daily rotate file directory
    level: "info", // error->warn->info->verbose->debug->silly
    console: true, // print to console
    file: false // append to file
  },
  symbol: "UGAS",
  keyProvider:['5K1meGLocwvHaVSLmVnHmWcMwkTb3Kp24Ug5rEgsmgTDEjGfbiP'],
  //expireInSeconds:60
};
module.exports = config;