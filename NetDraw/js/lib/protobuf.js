define([], function(){
	return {
		getJSON: function(input) {
			input = input.replace(/(\r\n|\n|\r)/gm, ",");
			input = input.replace(/ {,/g, ': {');
			input = input.replace(/(['"])?([a-zA-Z0-9_.]+)(['"])?:/g, '"$2": ');
			input = input.replace(/(['"])?([a-zA-Z0-9_.]+)(['"])?,/g, '"$2", ');
			input = input.replace(/,( )*}/g, '}');
			return JSON.parse('{' + input + '}');
		},

		getProto: function(input) {
			input = JSON.stringify(input);
			input = input.substring(1, input.length - 1);
			input = input.replace(/(['"])?([a-zA-Z0-9_.]+)(['"])?:/g, '$2: ');
			//input = input.replace(/(['"])?([a-zA-Z0-9_.]+)(['"])?,/g, '$2,');
			input = input.replace(/}/g, '\r\n}');
			input = input.replace(/,/g, "\r\n");
			input = input.replace(/:?( )?{/g, " {\r\n");

			// Fix tabulation
			var output = input;
			var spaces = 0;
			var wait = 1;
			var self = 0;
			var i = input.length;
			while (--i) {
				var c = input.charAt(i);

				if (c == '}') { self = spaces; spaces += 4; wait = 1; }
				if (c == '{') { spaces -= 4; self = spaces; wait = 1; }

				if (c == '\n') {
					if (wait) {
						wait = 0;
						output = [output.slice(0, i + 1), Array(self).join(" "), output.slice(i + 1)].join('');
					} else {
						output = [output.slice(0, i + 1), Array(spaces).join(" "), output.slice(i + 1)].join('');
					}
				}
			}

			return output;
		}
	}
});
