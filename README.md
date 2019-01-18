# Universal Encoder

Convert any number or ASCII text to any base, using RFC4648 character set or your own custom character sets.

## Working with numeric values

These examples use the RFC4648 presets.

```
// Decimal to hex and back
var decToHex = new BaseConverter().setInputPreset('decimal').setOutputPreset('base16').generateHelper();
var hexToDec = new BaseConverter().setInputPreset('base16').setOutputPreset('decimal').generateHelper();

var dec = 35;
var hex = decToHex(dec);
var dec_again = hexToDec(hex);
console.log(dec, hex, dec_again);

// decimal to binary and back
var decToBin = new BaseConverter().setInputPreset('decimal').setOutputPreset('binary').generateHelper();
var binToDec = new BaseConverter().setInputPreset('binary').setOutputPreset('decimal').generateHelper();

var dec = 32;
var bin = decToBin(dec);
var dec_again = binToDec(bin);
console.log(dec, bin, dec_again);
```

You can use your own charsets too:

```
var charset = 'a(3^5!#8oyTk';
var customEncoder = new BaseConverter().setInputPreset('decimal').setOutputSymbols(charset).setOutputBase(charset.length).generateHelper();
var customeDecoder = new BaseConverter().setInputSymbols(charset).setInputBase(charset.length).setOutputPreset('decimal').generateHelper();
```

## Working with text

```
var base64 = new ASCIIEncoder().setOutputPreset('base64');
b64encode = base64.generateEncoder();
b64decode = base64.generateDecoder();

var encoded = b64encode("Hello, world!");
var decoded = b64decode(encoded);

console.log(encoded, decoded);
```

### Using Node?

Don't forget to `const {BaseConverter, ASCIIEncoder} require('Universal-Encoder')`

### Use cases

check out the experiments in the /experiments folder



