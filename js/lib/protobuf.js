define([], function(){
	return {
		parseProto: function(input) {
			input = input.replace(/layers( *)?{/g, '{');
			return this.getJSON('layers: [' + input + ']');
		},

		getJSON: function(input) {
			input = input.replace(/#(.*?)(\r\n|\n|\r)/gm, "\r\n");
			input = input.replace(/(\r\n|\n|\r)/gm, ",");
			input = input.replace(/,+/gm, ",");
			input = input.replace(/( *)?{,/g, '{');
			input = input.replace(/([a-zA-Z0-9_\-.\/]+)( *)?{/g, '$1: {');
			input = input.replace(/(['"])?([a-zA-Z0-9_\-.\/]+)(['"])?:/g, '"$2": ');
			input = input.replace(/(['"])?([a-zA-Z0-9_\-.\/]+)(['"])?,/g, '"$2", ');
			input = input.replace(/(['"])?([a-zA-Z0-9_\-.\/]+)(['"])?( *)?}/g, '"$2"} ');
			input = input.replace(/,( *)?}/g, '}');
			input = input.replace(/,( *)?]/g, ']');


			var lines = input.split(/(?=[{},]+)/);
			var i = 0;
			var n = lines.length;
			var output = [];
			var lastLines = [];

			for (; i < n; ++i) {
				var current = lines[i];
				var k = lastLines.length;

				var regex_del = /([{},][{},]?).*?/g;
				var regex_pre = /((['"])?([a-zA-Z0-9_\-.\/]+)(['"])?):.*?/g;
				var regex_pst = /.*?:(( *)?(['"])?([a-zA-Z0-9_\-.\/]+)(['"])?)/g;

				var poi_pre = "", poi_pst = "", delimiter = "", result;
				if (result = regex_del.exec(current))
				    delimiter = result[1];

				if (result = regex_pre.exec(current))
				    poi_pre = result[1];

				if (result = regex_pst.exec(current))
				    poi_pst = result[1];

				//console.log("POI: " + poi_pre);
				//console.log("POI_POST: " + poi_pst);
				
				if (k > 0) {
					var last = lastLines[k - 1];

					if (last[0] != poi_pre) {
						if (k > 1) {
							var array = last[2] + last[0] + ': [';

							for (var j = 0; j < k; ++j) {
								if (j > 0) array += ",";
								array += lastLines[j][1];
							}

							array += "]";
							output.push(array);
						}
						else {
							output.push(last[3]);
						}

						lastLines = [];
					}
				}

				if (poi_pre	&& poi_pst) {
					lastLines.push([poi_pre, poi_pst, delimiter, current]);
				} else {
					output.push(current);
				}
			}

			input = output.join('');

			//console.log(input);
			return JSON.parse('{' + input + '}');
		},

		getProto: function(input) {
			input = JSON.stringify(input);

			console.log(input);

			// Transform JSON arrays [] to protobuf repeateable
			var regex_pre = /((['"])?([a-zA-Z0-9_\-.\/]+)(['"])?):\[([^\]]*)\]/g;
			var result;
			while (result = regex_pre.exec(input)) {
				var subs = "";
			    var poi_pre = result[1];
				var poi_post = result[5];

				result.length = result[0].length; // 3 is :[]
				
				poi_post = poi_post.split(",");
				var len = poi_post.length;
				for (var i = 0; i < len; ++i) {
					if (i > 0)
						subs += ",";
					subs += poi_pre + ":" + poi_post[i];
				}

				input = [input.slice(0, result.index), subs, input.slice(result.index + result.length)].join('');
			}

			input = input.substring(1, input.length - 1);
			input = input.replace(/(['"])?([a-zA-Z0-9_\-.\/]+)(['"])?:/g, '$2: ');
			//input = input.replace(/(['"])?([a-zA-Z0-9_.]+)(['"])?,/g, '$2,');
			input = input.replace(/}/g, "\r\n}");
			input = input.replace(/,/g, "\r\n");
			input = input.replace(/:?( )?{/g, " {\r\n");
			input = input.replace(/"([0-9.]+)"/g, '$1'); // Numbers are not quoted in protobuf
			input = input.replace(/"(false|true)"/g, '$1'); // Non quoted special words
			input = input.replace(/"([A-Z]+)"/g, '$1'); // In general, capitalized words are neither quoted

			// Fix tabulation
			output = input;
			var spaces = 0;
			var wait = 1;
			var self = 0;
			i = input.length;
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
