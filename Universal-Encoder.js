"use strict";

class BaseConverter{
	
	constructor(){
		this.input_symbols = null;
		this.input_base = null;
		this.input_preset = null;

		this.output_symbols = null;
		this.output_base = null;
		this.output_preset = null;

		// based on RFC4648
		this.symbol_presets = {
			binary: {
				symbols: '01',
				base: 2
			},
			decimal: {
				symbols: '0123456789',
				base: 10
			},
			base16: {
				symbols: '0123456789ABCDEF',
				base: 16
			},
			base32: {
				symbols: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',
				base: 32
			},
			base32hex: {
				symbols: '0123456789ABCDEFGHIJKLMNOPQRSTUV',
				base: 32
			},
			base64: {
				symbols: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
				base: 64
			},
			base64url: {
				symbols: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',
				base: 64
			}
		};

		this.statusStrings = {
			no_errors: "Values are safe",
			unsafe_symbols_type: "Symbols must be set to a string value",
			unsafe_base_type: "Base must be an integer",
			unsafe_symbol_len: "Length of symbols must be equal to or grater than base",
			dupe_symbol_values: "Symbols must not be repeated",
			no_preset: "Preset does not exist",
			safe_base_value: "Base must be greater than zero and less than "+Number.MAX_SAFE_INTEGER,
			invalid_input: "Unknown symbol in input",
			input_too_large: "Input value too large to convert"
		};
	}
	
	setInputPreset(preset){
		this.input_preset = ""+preset;
		return this;
	}
	
	setOutputPreset(preset){
		this.output_preset = ""+preset;
		return this;
	}
	
	setInputSymbols(symbols){
		this.input_preset = null;
		this.input_symbols = ""+symbols;
		return this;
	}
	
	setOutputSymbols(symbols){
		this.output_preset = null;
		this.output_symbols = ""+symbols;
		return this;
	}
	
	setInputBase(base){
		this.input_preset = null;
		this.input_base = parseInt(base);
	}
	
	setOutputBase(base){
		this.output_preset = null;
		this.output_base = parseInt(base);
	}
	
	prepAndGetStatus(value=false){
		if(this.input_preset){
			if(!this.symbol_presets[this.input_preset]) return this.statusStrings.no_preset;
			this.input_base = this.symbol_presets[this.input_preset].base;
			this.input_symbols = this.symbol_presets[this.input_preset].symbols;
		}
		if(this.output_preset){
			if(!this.symbol_presets[this.output_preset]) return this.statusStrings.no_preset;
			this.output_base = this.symbol_presets[this.output_preset].base;
			this.output_symbols = this.symbol_presets[this.output_preset].symbols;
		}
		var safe_symbols_type = 
			typeof this.input_symbols === 'string' &&
			typeof this.output_symbols === 'string';
		if(!safe_symbols_type) return this.statusStrings.unsafe_symbols_type;
		var safe_base_type =
			typeof this.input_base === 'number' &&
			typeof this.output_base === 'number';
		if(!safe_base_type) return this.statusStrings.unsafe_base_type;
		var safe_base_value =
			this.input_base > 0 && this.input_base < Number.MAX_SAFE_INTEGER &&
			this.output_base > 0 && this.output_base < Number.MAX_SAFE_INTEGER;
		if(!safe_base_value) return this.statusStrings.unsafe_base_type;
		var safe_symbol_len = 
			this.input_base >= this.input_symbols.length &&
			this.output_base >= this.output_symbols.length;
		if(!safe_symbol_len) return this.statusStrings.unsafe_symbol_len;
		var nondupe_symbol_values = 
			[...new Set(this.input_symbols.split(''))].length === this.input_symbols.length &&
			[...new Set(this.output_symbols.split(''))].length === this.output_symbols.length;
		if(!nondupe_symbol_values) return this.statusStrings.dupe_symbol_values;
		if(value){
			value = ""+value;
			for(let i=0, l=value.length; i<l; i++){
				if(!~this.input_symbols.indexOf(value[i])) return this.statusStrings.invalid_input;
			}
		}
		return this.statusStrings.no_errors;
	}
	
	convert(value) {
		value = "" + value;
		var status = this.prepAndGetStatus(value);
		if (status !== this.statusStrings.no_errors) throw new Error(status);

		var dec_value = value.split('').reverse().reduce((carry, digit, index)=>{
			return carry += this.input_symbols.indexOf(digit) * (Math.pow(this.input_base, index));
		}, 0);

		if(dec_value > Number.MAX_SAFE_INTEGER) throw new Error(this.statusStrings.input_too_large);

		var new_value = '';
		while (dec_value > 0) {
			new_value = this.output_symbols[dec_value % this.output_base] + new_value;
			dec_value = (dec_value - (dec_value % this.output_base)) / this.output_base;
		}
		
		return new_value;
	}
	
	generateHelper(){
		return this.convert.bind(this);
	}
}

class ASCIIEncoder extends BaseConverter{
	
	constructor(){
		super();
		this.setInputPreset('binary');
		this.pad_char = '=';
	}
	
	setPadChar(char){
		this.pad_char = char.toString().charAt(0);
		return this;
	}
	
	static asciiToBinary(ascii){
		let bytes = [];
		for(let i=0, l=ascii.length; i<l; i++){
			bytes.push(ascii.charCodeAt(i).toString(2).padStart(8, '0'));
		}
		return bytes.join('');
	}
	
	static binaryToASCII(binary){
		var ascii = [];
		for(var i=0, l=binary.length; i<l; i+=8){
			ascii.push(String.fromCharCode(parseInt(binary.substring(i, i+8), 2)));
		}
		return ascii.join('');
	}

	static leastCommonMultiple(a, b){
		if(!a || !b) return 0;
		var x = Math.abs(a);
		var y = Math.abs(b);
		while(y) {
		  var t = y;
		  y = x % y;
		  x = t;
		}
		var gcd = x;
		return Math.abs((a * b) / gcd);
	}

	encode(ascii){
		var binary = this.constructor.asciiToBinary(ascii);
		var status = this.prepAndGetStatus(binary);
		if (status !== this.statusStrings.no_errors) throw new Error(status);
		var bits_per_char = (this.output_base-1).toString(2).length;
		var bit_grp_size = this.constructor.leastCommonMultiple(bits_per_char, 8);
		var encoded = [];
		for(var i=0, l=binary.length; i<l; i+=bits_per_char){
			encoded.push(this.output_symbols.charAt(parseInt(binary.substring(i, i+bits_per_char).padEnd(bits_per_char, '0'),2)));
		}
		var padlen = ((encoded.length * bits_per_char) % bit_grp_size) / bits_per_char;
		encoded.push(this.pad_char.repeat(padlen));
		return encoded.join('');
	}

	decode(str){
		var bits_per_char = (this.output_base-1).toString(2).length;
		var binary = [];
		for(var i=0, l=str.length; i<l; i++){
			if(this.pad_char !== str.charAt(i)){
				binary.push(this.output_symbols.indexOf(str.charAt(i)).toString(2).padStart(bits_per_char, '0'));
			}
		}
		binary = binary.join('');
		binary = binary.substring(0, binary.length - (binary.length%8));		
		return this.constructor.binaryToASCII(binary);
	}

	generateEncoder(){
		return this.encode.bind(this);
	}

	generateDecoder(){
		return this.decode.bind(this);
	}
}

if(typeof module === 'object' && module.exports) module.exports = {
	BaseConverter,
	ASCIIEncoder
};