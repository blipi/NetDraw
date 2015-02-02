var _ = _ || {};

define([], function(){


	var Style = function() {
		this.featuresMapping = {};

		this.featuresMapping['convolution'] = {
    		fillStyle: '#256fb3',
    		strokeWidth: 4,
    		strokeStyle: '#000',

    		text : {
    			name: 'Conv',
        		fillStyle: '#000',
	    		strokeWidth: 1,
	    		strokeStyle: '#000',
	    		x: 50, y: 25,
	    	},

    		top: {
	    		fillStyle: '#FFF',
	    		strokeWidth: 2,
	    		strokeStyle: '#000',	    			
    		},

    		bottom: {
	    		fillStyle: '#000',
	    		strokeWidth: 2,
	    		strokeStyle: '#FFF',	    			
    		}
    	};

    	this.featuresMapping['pooling'] = {
    		fillStyle: '#d7dadd',
    		strokeWidth: 3,
    		strokeStyle: '#000',

    		text : {
    			name: 'Pooling',
        		fillStyle: '#000',
	    		strokeWidth: 1,
	    		strokeStyle: '#000',
	    		x: 50, y: 25,
	    	},

    		top: {
	    		fillStyle: '#FFF',
	    		strokeWidth: 2,
	    		strokeStyle: '#000',	    			
    		},

    		bottom: {
	    		fillStyle: '#000',
	    		strokeWidth: 2,
	    		strokeStyle: '#FFF',	    			
    		}
    	};

    	this.featuresMapping['lrn'] = {
    		fillStyle: '#d7dadd',
    		strokeWidth: 3,
    		strokeStyle: '#000',

    		text : {
    			name: 'LRN',
        		fillStyle: '#000',
	    		strokeWidth: 1,
	    		strokeStyle: '#000',
	    		x: 50, y: 25,
	    	},

    		top: {
	    		fillStyle: '#FFF',
	    		strokeWidth: 2,
	    		strokeStyle: '#000',	    			
    		},

    		bottom: {
	    		fillStyle: '#000',
	    		strokeWidth: 2,
	    		strokeStyle: '#FFF',	    			
    		}
    	};

    	this.featuresMapping['im2col'] = {
    		fillStyle: '#d7dadd',
    		strokeWidth: 3,
    		strokeStyle: '#000',

    		text : {
    			name: 'im2col',
        		fillStyle: '#000',
	    		strokeWidth: 1,
	    		strokeStyle: '#000',
	    		x: 50, y: 25,
	    	},

    		top: {
	    		fillStyle: '#FFF',
	    		strokeWidth: 2,
	    		strokeStyle: '#000',	    			
    		},

    		bottom: {
	    		fillStyle: '#000',
	    		strokeWidth: 2,
	    		strokeStyle: '#FFF',	    			
    		}
    	};

    	this.featuresMapping['softmax'] = {
    		fillStyle: '#d7dadd',
    		strokeWidth: 3,
    		strokeStyle: '#000',

    		text : {
    			name: 'SoftMax',
        		fillStyle: '#000',
	    		strokeWidth: 1,
	    		strokeStyle: '#000',
	    		x: 50, y: 25,
	    	},

    		top: {
	    		fillStyle: '#FFF',
	    		strokeWidth: 2,
	    		strokeStyle: '#000',	    			
    		},

    		bottom: {
	    		fillStyle: '#000',
	    		strokeWidth: 2,
	    		strokeStyle: '#FFF',	    			
    		}
    	};

    	this.featuresMapping['euclidean'] = {
    		fillStyle: '#d7dadd',
    		strokeWidth: 3,
    		strokeStyle: '#000',

    		text : {
    			name: 'Euclidean',
        		fillStyle: '#000',
	    		strokeWidth: 1,
	    		strokeStyle: '#000',
	    		x: 50, y: 25,
	    	},

    		top: {
	    		fillStyle: '#FFF',
	    		strokeWidth: 2,
	    		strokeStyle: '#000',	    			
    		},

    		bottom: {
	    		fillStyle: '#000',
	    		strokeWidth: 2,
	    		strokeStyle: '#FFF',	    			
    		}
    	};

    	this.featuresMapping['hinge'] = {
    		fillStyle: '#d7dadd',
    		strokeWidth: 3,
    		strokeStyle: '#000',

    		text : {
    			name: 'Hinge',
        		fillStyle: '#000',
	    		strokeWidth: 1,
	    		strokeStyle: '#000',
	    		x: 50, y: 25,
	    	},

    		top: {
	    		fillStyle: '#FFF',
	    		strokeWidth: 2,
	    		strokeStyle: '#000',	    			
    		},

    		bottom: {
	    		fillStyle: '#000',
	    		strokeWidth: 2,
	    		strokeStyle: '#FFF',	    			
    		}
    	};

    	this.featuresMapping['sigmoid_gain'] = {
    		fillStyle: '#d7dadd',
    		strokeWidth: 3,
    		strokeStyle: '#000',

    		text : {
    			name: 'Sigmoid Gain',
        		fillStyle: '#000',
	    		strokeWidth: 1,
	    		strokeStyle: '#000',
	    		x: 50, y: 25,
	    	},

    		top: {
	    		fillStyle: '#FFF',
	    		strokeWidth: 2,
	    		strokeStyle: '#000',	    			
    		},

    		bottom: {
	    		fillStyle: '#000',
	    		strokeWidth: 2,
	    		strokeStyle: '#FFF',	    			
    		}
    	};

    	this.featuresMapping['infogain'] = {
    		fillStyle: '#d7dadd',
    		strokeWidth: 3,
    		strokeStyle: '#000',

    		text : {
    			name: 'InfoGain',
        		fillStyle: '#000',
	    		strokeWidth: 1,
	    		strokeStyle: '#000',
	    		x: 50, y: 25,
	    	},

    		top: {
	    		fillStyle: '#FFF',
	    		strokeWidth: 2,
	    		strokeStyle: '#000',	    			
    		},

    		bottom: {
	    		fillStyle: '#000',
	    		strokeWidth: 2,
	    		strokeStyle: '#FFF',	    			
    		}
    	};

    	this.featuresMapping['accuracy'] = {
    		fillStyle: '#d7dadd',
    		strokeWidth: 3,
    		strokeStyle: '#000',

    		text : {
    			name: 'Accuracy',
        		fillStyle: '#000',
	    		strokeWidth: 1,
	    		strokeStyle: '#000',
	    		x: 50, y: 25,
	    	},

    		top: {
	    		fillStyle: '#FFF',
	    		strokeWidth: 2,
	    		strokeStyle: '#000',	    			
    		},

    		bottom: {
	    		fillStyle: '#000',
	    		strokeWidth: 2,
	    		strokeStyle: '#FFF',	    			
    		}
    	};

    	this.featuresMapping['relu'] = {
    		fillStyle: '#d7dadd',
    		strokeWidth: 3,
    		strokeStyle: '#000',

    		text : {
    			name: 'ReLU',
        		fillStyle: '#000',
	    		strokeWidth: 1,
	    		strokeStyle: '#000',
	    		x: 50, y: 25,
	    	},

    		top: {
	    		fillStyle: '#FFF',
	    		strokeWidth: 2,
	    		strokeStyle: '#000',	    			
    		},

    		bottom: {
	    		fillStyle: '#000',
	    		strokeWidth: 2,
	    		strokeStyle: '#FFF',	    			
    		}
    	};

    	this.featuresMapping['sigmoid'] = {
    		fillStyle: '#d7dadd',
    		strokeWidth: 3,
    		strokeStyle: '#000',

    		text : {
    			name: 'Sigmoid',
        		fillStyle: '#000',
	    		strokeWidth: 1,
	    		strokeStyle: '#000',
	    		x: 50, y: 25,
	    	},

    		top: {
	    		fillStyle: '#FFF',
	    		strokeWidth: 2,
	    		strokeStyle: '#000',	    			
    		},

    		bottom: {
	    		fillStyle: '#000',
	    		strokeWidth: 2,
	    		strokeStyle: '#FFF',	    			
    		}
    	};

    	this.featuresMapping['tanh'] = {
    		fillStyle: '#d7dadd',
    		strokeWidth: 3,
    		strokeStyle: '#000',

    		text : {
    			name: 'TanH',
        		fillStyle: '#000',
	    		strokeWidth: 1,
	    		strokeStyle: '#000',
	    		x: 50, y: 25,
	    	},

    		top: {
	    		fillStyle: '#FFF',
	    		strokeWidth: 2,
	    		strokeStyle: '#000',	    			
    		},

    		bottom: {
	    		fillStyle: '#000',
	    		strokeWidth: 2,
	    		strokeStyle: '#FFF',	    			
    		}
    	};

    	this.featuresMapping['absval'] = {
    		fillStyle: '#d7dadd',
    		strokeWidth: 3,
    		strokeStyle: '#000',

    		text : {
    			name: 'AbsVal',
        		fillStyle: '#000',
	    		strokeWidth: 1,
	    		strokeStyle: '#000',
	    		x: 50, y: 25,
	    	},

    		top: {
	    		fillStyle: '#FFF',
	    		strokeWidth: 2,
	    		strokeStyle: '#000',	    			
    		},

    		bottom: {
	    		fillStyle: '#000',
	    		strokeWidth: 2,
	    		strokeStyle: '#FFF',	    			
    		}
    	};

    	this.featuresMapping['power'] = {
    		fillStyle: '#d7dadd',
    		strokeWidth: 3,
    		strokeStyle: '#000',

    		text : {
    			name: 'Power',
        		fillStyle: '#000',
	    		strokeWidth: 1,
	    		strokeStyle: '#000',
	    		x: 50, y: 25,
	    	},

    		top: {
	    		fillStyle: '#FFF',
	    		strokeWidth: 2,
	    		strokeStyle: '#000',	    			
    		},

    		bottom: {
	    		fillStyle: '#000',
	    		strokeWidth: 2,
	    		strokeStyle: '#FFF',	    			
    		}
    	};

    	this.featuresMapping['bnll'] = {
    		fillStyle: '#d7dadd',
    		strokeWidth: 3,
    		strokeStyle: '#000',

    		text : {
    			name: 'BNLL',
        		fillStyle: '#000',
	    		strokeWidth: 1,
	    		strokeStyle: '#000',
	    		x: 50, y: 25,
	    	},

    		top: {
	    		fillStyle: '#FFF',
	    		strokeWidth: 2,
	    		strokeStyle: '#000',	    			
    		},

    		bottom: {
	    		fillStyle: '#000',
	    		strokeWidth: 2,
	    		strokeStyle: '#FFF',	    			
    		}
    	};

    	this.featuresMapping['data'] = {
    		fillStyle: '#d7dadd',
    		strokeWidth: 3,
    		strokeStyle: '#000',

    		text : {
    			name: 'Database',
        		fillStyle: '#000',
	    		strokeWidth: 1,
	    		strokeStyle: '#000',
	    		x: 50, y: 25,
	    	},

    		top: {
	    		fillStyle: '#FFF',
	    		strokeWidth: 2,
	    		strokeStyle: '#000',	    			
    		},

    		bottom: {
	    		fillStyle: '#000',
	    		strokeWidth: 2,
	    		strokeStyle: '#FFF',	    			
    		}
    	};

    	this.featuresMapping['memory'] = {
    		fillStyle: '#d7dadd',
    		strokeWidth: 3,
    		strokeStyle: '#000',

    		text : {
    			name: 'Memory',
        		fillStyle: '#000',
	    		strokeWidth: 1,
	    		strokeStyle: '#000',
	    		x: 50, y: 25,
	    	},

    		top: {
	    		fillStyle: '#FFF',
	    		strokeWidth: 2,
	    		strokeStyle: '#000',	    			
    		},

    		bottom: {
	    		fillStyle: '#000',
	    		strokeWidth: 2,
	    		strokeStyle: '#FFF',	    			
    		}
    	};

    	this.featuresMapping['hdf5'] = {
    		fillStyle: '#d7dadd',
    		strokeWidth: 3,
    		strokeStyle: '#000',

    		text : {
    			name: 'HDF5',
        		fillStyle: '#000',
	    		strokeWidth: 1,
	    		strokeStyle: '#000',
	    		x: 50, y: 25,
	    	},

    		top: {
	    		fillStyle: '#FFF',
	    		strokeWidth: 2,
	    		strokeStyle: '#000',	    			
    		},

    		bottom: {
	    		fillStyle: '#000',
	    		strokeWidth: 2,
	    		strokeStyle: '#FFF',	    			
    		}
    	};

    	this.featuresMapping['image'] = {
    		fillStyle: '#d7dadd',
    		strokeWidth: 3,
    		strokeStyle: '#000',

    		text : {
    			name: 'Image',
        		fillStyle: '#000',
	    		strokeWidth: 1,
	    		strokeStyle: '#000',
	    		x: 50, y: 25,
	    	},

    		top: {
	    		fillStyle: '#FFF',
	    		strokeWidth: 2,
	    		strokeStyle: '#000',	    			
    		},

    		bottom: {
	    		fillStyle: '#000',
	    		strokeWidth: 2,
	    		strokeStyle: '#FFF',	    			
    		}
    	};

    	this.featuresMapping['window'] = {
    		fillStyle: '#d7dadd',
    		strokeWidth: 3,
    		strokeStyle: '#000',

    		text : {
    			name: 'Window',
        		fillStyle: '#000',
	    		strokeWidth: 1,
	    		strokeStyle: '#000',
	    		x: 50, y: 25,
	    	},

    		top: {
	    		fillStyle: '#FFF',
	    		strokeWidth: 2,
	    		strokeStyle: '#000',	    			
    		},

    		bottom: {
	    		fillStyle: '#000',
	    		strokeWidth: 2,
	    		strokeStyle: '#FFF',	    			
    		}
    	};

    	this.featuresMapping['dummy'] = {
    		fillStyle: '#d7dadd',
    		strokeWidth: 3,
    		strokeStyle: '#000',

    		text : {
    			name: 'Dummy',
        		fillStyle: '#000',
	    		strokeWidth: 1,
	    		strokeStyle: '#000',
	    		x: 50, y: 25,
	    	},

    		top: {
	    		fillStyle: '#FFF',
	    		strokeWidth: 2,
	    		strokeStyle: '#000',	    			
    		},

    		bottom: {
	    		fillStyle: '#000',
	    		strokeWidth: 2,
	    		strokeStyle: '#FFF',	    			
    		}
    	};

    	this.featuresMapping['inner_product'] = {
    		fillStyle: '#d7dadd',
    		strokeWidth: 3,
    		strokeStyle: '#000',

    		text : {
    			name: 'Inner Product',
        		fillStyle: '#000',
	    		strokeWidth: 1,
	    		strokeStyle: '#000',
	    		x: 50, y: 25,
	    	},

    		top: {
	    		fillStyle: '#FFF',
	    		strokeWidth: 2,
	    		strokeStyle: '#000',	    			
    		},

    		bottom: {
	    		fillStyle: '#000',
	    		strokeWidth: 2,
	    		strokeStyle: '#FFF',	    			
    		}
    	};

    	this.featuresMapping['split'] = {
    		fillStyle: '#d7dadd',
    		strokeWidth: 3,
    		strokeStyle: '#000',

    		text : {
    			name: 'Split',
        		fillStyle: '#000',
	    		strokeWidth: 1,
	    		strokeStyle: '#000',
	    		x: 50, y: 25,
	    	},

    		top: {
	    		fillStyle: '#FFF',
	    		strokeWidth: 2,
	    		strokeStyle: '#000',	    			
    		},

    		bottom: {
	    		fillStyle: '#000',
	    		strokeWidth: 2,
	    		strokeStyle: '#FFF',	    			
    		}
    	};

    	this.featuresMapping['flatten'] = {
    		fillStyle: '#d7dadd',
    		strokeWidth: 3,
    		strokeStyle: '#000',

    		text : {
    			name: 'Flatten',
        		fillStyle: '#000',
	    		strokeWidth: 1,
	    		strokeStyle: '#000',
	    		x: 50, y: 25,
	    	},

    		top: {
	    		fillStyle: '#FFF',
	    		strokeWidth: 2,
	    		strokeStyle: '#000',	    			
    		},

    		bottom: {
	    		fillStyle: '#000',
	    		strokeWidth: 2,
	    		strokeStyle: '#FFF',	    			
    		}
    	};

    	this.featuresMapping['concat'] = {
    		fillStyle: '#d7dadd',
    		strokeWidth: 3,
    		strokeStyle: '#000',

    		text : {
    			name: 'Concat',
        		fillStyle: '#000',
	    		strokeWidth: 1,
	    		strokeStyle: '#000',
	    		x: 50, y: 25,
	    	},

    		top: {
	    		fillStyle: '#FFF',
	    		strokeWidth: 2,
	    		strokeStyle: '#000',	    			
    		},

    		bottom: {
	    		fillStyle: '#000',
	    		strokeWidth: 2,
	    		strokeStyle: '#FFF',	    			
    		}
    	};

    	this.featuresMapping['slice'] = {
    		fillStyle: '#d7dadd',
    		strokeWidth: 3,
    		strokeStyle: '#000',

    		text : {
    			name: 'Slice',
        		fillStyle: '#000',
	    		strokeWidth: 1,
	    		strokeStyle: '#000',
	    		x: 50, y: 25,
	    	},

    		top: {
	    		fillStyle: '#FFF',
	    		strokeWidth: 2,
	    		strokeStyle: '#000',	    			
    		},

    		bottom: {
	    		fillStyle: '#000',
	    		strokeWidth: 2,
	    		strokeStyle: '#FFF',	    			
    		}
    	};
	}

	Style.prototype.initialize = function() {
	};

	_.Style = new Style;
	return _.Style;

});
