"use strict";

var tokens = {
	ERROR: -1,
	IDENT: 0,
	LETTER: 1,
	NUMBER: 2,
	LBRACE: 3,
	RBRACE: 4,
	QUOTE: 5,
	COLON: 6,
	NL: 7,
	COMMENT: 8,
};

var ProtoBuf = function() {
    
    this.c = '';
    this.oldc = '';
	this.sym = tokens.ERROR;
	this.i = 0;
    this.protobuf = "";
    this.buffer = "";
    this.quoted = false;
    this.object = [];
    this.levelStack = [];

    var Value = function(quoted, value) {
    	this.quoted = quoted;
    	this.value = value;
    }

	this.isnumber = function(c) {
		return c >= '0' && c <= '9';
	}

	this.isletter = function(c) {
		return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c == '_';
	}

	this.getsym = function() {
		var c = this.protobuf.charAt(this.i++);

		if (c == ' ' || c == '\t') {
			this.sym = tokens.IDENT;
		}
		else if (c == '{') {
			this.sym = tokens.LBRACE;
		}
		else if (c == '}') {
			this.sym = tokens.RBRACE;
		}
		else if (c == '"') {
			this.sym = tokens.QUOTE;
		}
		else if (c == ':') {
			this.sym = tokens.COLON;
		}
		else if (c == '\n') {
			this.sym = tokens.NL;
		}
		else if (c == '#') {
			this.sym = tokens.COMMENT;
		}
		else if (this.isnumber(c)) {
			this.sym = tokens.NUMBER;
		}
		else if (this.isletter(c)) {
			this.sym = tokens.LETTER;
		}
		else {
			this.sym = tokens.ERROR;
		}

		this.oldc = this.c;
		this.c = c;
	}

	this.accept = function(s) {
		if (this.sym == s) {
			this.getsym();
			return true;
		}

		return false;
	}

	this.expect = function(s) {
		if (this.accept(s))
			return true;

		console.log(this);
		throw "Unexpected symbol in 'expect'";
	}

	this.value = function() {
		while (this.accept(tokens.IDENT));

		if (this.accept(tokens.QUOTE)) {
			this.quoted = true;
			this.buffer = "";

			while (!this.accept(tokens.QUOTE)) {
				this.buffer += this.c;
				this.getsym();
			}
		}
		else if (this.number()) {
		}
		else if (this.name()) {
		}
		else {
			console.log(this);
			throw "Unexpected symbon in 'value'"
		}
	}

	this.number = function() {
		while (this.accept(tokens.IDENT));

		if (this.accept(tokens.NUMBER)) {
			this.buffer = this.oldc;

			while (this.accept(tokens.NUMBER)) {
				this.buffer += this.oldc;
			}

			return true;
		}

		return false;
	}

	this.name = function() {
		while (this.accept(tokens.IDENT));

		if (this.accept(tokens.LETTER)) {
			this.buffer = this.oldc;

			while (this.accept(tokens.LETTER) || this.accept(tokens.NUMBER)) {
				this.buffer += this.oldc;
			}

			return true;
		}

		return false;
	}

	this.handleLBRACE = function(keyname) {
		while (this.accept(tokens.IDENT));

		if (keyname in this.object || $.isArray(this.object)) {
			if (!$.isArray(this.object)) {
				this.object = [this.object];
			}

			var obj = {};
			obj[keyname] = {};

			this.object.push(obj);
			this.levelStack.push(this.object);
			this.object = obj[keyname];
		}
		else {
			this.object[keyname] = {};
			this.levelStack.push(this.object);
			this.object = this.object[keyname];	
		}

		this.expression();
	}

	this.expression = function() {
		// Ignore ident
		while (this.accept(tokens.IDENT));

		// Check if we ended
		if (this.i > this.protobuf.length) {
			return;
		}

		// Ignore newlines
		if (this.accept(tokens.NL)) {
			this.expression();
			return;
		}

		// Ignore comments
		if (this.accept(tokens.COMMENT)) {
			while (!this.accept(tokens.NL)) {
				this.getsym();
			}

			this.expression();
			return;
		}

		if (this.name()) {
			var keyname = this.buffer;

			while (this.accept(tokens.IDENT));

			if (this.accept(tokens.COLON)) {

				// Older prototxt might use "include : {" which is, by itself, ilegal
				// but we must be able to handle it
				while (this.accept(tokens.IDENT));

				if (this.accept(tokens.LBRACE)) {
					this.handleLBRACE(keyname);
				}
				else {
					this.value();

					var obj = $.isArray(this.object) ? this.object[this.object.length - 1] : this.object;

					if (keyname in obj) {
						if (!$.isArray(obj[keyname])) {
							obj[keyname] = [obj[keyname]];
						}

						obj[keyname].push(new Value(this.quoted, this.buffer));
					}
					else {
						obj[keyname] = new Value(this.quoted, this.buffer);
					}
					
					this.expression();
				}
			}
			else if (this.accept(tokens.LBRACE)) {
				this.handleLBRACE(keyname);
			}
			else {
				console.log(this);
				throw "Unexpected symbol in 'expression:name'"
			}
		}
		else if (this.accept(tokens.RBRACE)) {
			while (this.accept(tokens.IDENT));

			this.object = this.levelStack[this.levelStack.length - 1];
			this.levelStack.pop();

			this.expression();
		}
		else {
			console.log(this);
			throw "Unexpected symbol in 'expression'"
		}
	}

    
    this.compile = function(pb) {
    	// It must end with \n, if not, inject it
    	if (pb.charAt(pb.length - 1) != '\n') {
    		pb += '\n';
    	}

    	this.object = {};
    	this.levelStack = [];
        this.protobuf = pb;
        this.i = 0;

        this.getsym();
        this.expression();

        // Consistency, always return an array
        if (!$.isArray(this.object)) {
        	this.object = [this.object];
        }

        return this.object;
    }

    this.upgrade = function(pb) {
    	var upgradeLayerType = function(layer) {
    		if ('type' in layer) {
    			var type = UpgradeV0LayerType(layer['type']['value']);
    			if (type >= 0) {
    				layer['type']['value'] = UpgradeV1LayerType(type);
    			}
    		}

    		return layer;
		}

    	var upgradeLayer = function(layer) {
    		return upgradeLayerType(layer['layers'] || layer['layer']);
    	}


    	var upgradedObj = [];

    	if ($.isArray(pb)) {
    		for (var i = 0, len = pb.length; i < len; ++i) {
    			upgradedObj.push({layer : upgradeLayer(pb[i])});
    		}
    	}
    	else {
    		upgradedObj.push({layer : upgradeLayer(pb)});
    	}

    	return upgradedObj;
    }

    this.decompile = function(pb, version) {
    	version = typeof(version) === 'undefined' ? version.V1 : version;

    	if (version != version.V0 && version != version.V1) {
    		throw "Unable to decompile";
    	}


    }
};
